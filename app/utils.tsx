import {Note, Tab, TabGroup} from "./GuitarTabEditor";
import {now, Sampler, start} from "tone";
import {v4} from "uuid";

interface StringNotes {
    [key: number]: string;
}

const stringNotes: StringNotes = {
    0: 'E4', // High E
    1: 'B3', // String 5 (A)
    2: 'G3', // String 4 (D)
    3: 'D3', // String 3 (G)
    4: 'A2', // String 2 (B)
    5: 'E2', // Low E
};

const emptyTab = (tabId: string): Tab => {
    return {
        _id: tabId,
        tempo: 120,
        capo: 0,
        groups: [{
            _id: v4(),
            tabId: tabId,
            groupIndex: 0,
            notes: [
                [], // String 6 (Low E)
                [], // String 5 (A)
                [], // String 4 (D)
                [], // String 3 (G)
                [], // String 2 (B)
                [], // String 1 (High E)
            ]
        }],
    }
};

const getNoteFromFret = (capo: number, string: number, fret: string) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const openNote = stringNotes[string];
    const openNoteBase = openNote.slice(0, -1);
    const openNoteOctave = parseInt(openNote.slice(-1));

    const baseNoteIndex = notes.indexOf(openNoteBase);
    const totalSemitonesUp = parseInt(fret) + capo;

    const newNoteIndex = (baseNoteIndex + totalSemitonesUp) % 12;
    const octaveChange = Math.floor((baseNoteIndex + totalSemitonesUp) / 12);

    return `${notes[newNoteIndex]}${openNoteOctave + octaveChange}`;
};

const playMusicalNote = (
    sampler: Sampler,
    isLoaded: boolean,
    capo: number,
    string: number,
    fret: string,
    type?: 'h' | 'p' | 'space'
) => {
    if (sampler && isLoaded) {
        const note = getNoteFromFret(capo, string, fret);
        let velocity = 0.2;
        let duration = "4n";

        // Adjust velocity and duration based on type
        if (type === 'h') {
            velocity = 0.4; // Harder attack for hammer-on
            duration = "8n"; // Shorter duration
        } else if (type === 'p') {
            velocity = 0.15; // Softer attack for pull-off
            duration = "8n";
        }

        velocity += Math.random() * 0.1; // Add slight variation
        const timing = now();
        sampler.triggerAttackRelease(note, duration, timing, velocity);
    }
};

const playAllMusicalNotes = async (
    sampler: Sampler,
    tab: Tab,
    isLoaded: boolean,
    isPlaying: boolean,
    setCurrentlyPlayingNotes: (notes: Note[]) => void,
    playbackTimeoutRef: { current: NodeJS.Timeout | null },
) => {
    if (!sampler || !isLoaded || isPlaying) return;

    await start();

    // Process all groups sequentially
    for (let i = 0; i < tab.groups.length; i++) {
        const group = tab.groups[i];

        // Create a promise that resolves when the group is done playing
        await new Promise<void>((resolve) => {
            playTabGroup(sampler, group, tab.capo, tab.tempo, setCurrentlyPlayingNotes, playbackTimeoutRef, () => {
                // This callback is called when the group finishes playing
                resolve();
            });
        });

        // Add a small delay between groups
        if (i < tab.groups.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
};

const playTabGroup = async (
    sampler: Sampler,
    group: TabGroup,
    capo: number,
    tempo: number,
    setCurrentlyPlayingNotes: (notes: Note[]) => void,
    playbackTimeoutRef: { current: NodeJS.Timeout | null },
    onComplete: () => void
) => {
    // Flatten and sort notes from all strings
    const allNotes: Note[] = group.notes.reduce((acc, stringNotes) => {
        return [...acc, ...stringNotes];
    }, []).sort((a, b) => a.position - b.position); // Sort by position only

    // Group notes by position
    const positions = new Map<number, Note[]>();
    allNotes.forEach(note => {
        if (!positions.has(note.position)) {
            positions.set(note.position, []);
        }
        positions.get(note.position)?.push(note);
    });

    const maxPosition = Math.max(...allNotes.map(note => note.position), 15);

    const playChord = (notes: Note[]) => {
        // Sort notes by string number (6 to 1) for natural strumming
        const sortedNotes = [...notes].sort((a, b) => b.stringIndex - a.stringIndex);

        sortedNotes.forEach((note, index) => {
            const actualNote = getNoteFromFret(capo, note.stringIndex, note.fret);
            let baseVelocity = 0.2;
            let duration = "4n";

            if (note.type === 'h') {
                baseVelocity = 0.4;
                duration = "8n";
            } else if (note.type === 'p') {
                baseVelocity = 0.15;
                duration = "8n";
            }

            const velocity = baseVelocity + (Math.random() * 0.1);
            const strumDelay = index * 15;
            const timing = now() + (strumDelay / 1000);

            sampler.triggerAttackRelease(
                actualNote,
                duration,
                timing,
                velocity
            );
        });
    };

    const playPosition = (position: number) => {
        if (position > maxPosition) {
            onComplete();
            return;
        }

        const notes = positions.get(position) || [];

        if (notes.length > 0) {
            setCurrentlyPlayingNotes(notes);
            playChord(notes);
        } else {
            setCurrentlyPlayingNotes([]);
        }

        const delayMs = (60 / tempo) * 1000;
        playbackTimeoutRef.current = setTimeout(
            () => playPosition(position + 1),
            delayMs
        );
    };
    playPosition(0);
};

export {
    emptyTab,
    getNoteFromFret,
    playMusicalNote,
    playAllMusicalNotes,
    playTabGroup,
}
