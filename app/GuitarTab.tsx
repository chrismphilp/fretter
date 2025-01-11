"use client";

import {DragEvent, useEffect, useRef, useState} from 'react';
import {Chorus, Compressor, Filter, now, PolySynth, Reverb, Sampler, start, Synth} from "tone";
import GuitarTabContainer from "./GuitarTabContainer";
import CapoControl from "./CapoControl";
import TabDisplaySection from "./TabDisplaySection";
import TempoControl from "./TempoControl";
import FretSelector from "./FretSelector";
import PlaybackControls from "./PlaybackControls";

interface StringNotes {
    [key: number]: string;
}

export interface Note {
    stringIndex: number;
    fret: string;
    position: number;
    type?: 'h' | 'p';
}

const GuitarTabEditor = () => {
    const [isSpaceMode, setIsSpaceMode] = useState(false);
    const [currentlyPlayingNotes, setCurrentlyPlayingNotes] = useState<Note[]>([]);
    const [tempo, setTempo] = useState<number>(120); // BPM (beats per minute)
    const [capo, setCapo] = useState<number>(0);
    const [draggedNote, setDraggedNote] = useState<string | null>(null);
    const [sampler, setSampler] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [noteSequence, setNoteSequence] = useState<Note[]>([]);
    const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [tab, setTab] = useState<string[][]>([
        [], // String 6 (Low E)
        [], // String 5 (A)
        [], // String 4 (D)
        [], // String 3 (G)
        [], // String 2 (B)
        [], // String 1 (High E)
    ]);

    const stringNotes: StringNotes = {
        0: 'E4', // High E
        1: 'B3',
        2: 'G3',
        3: 'D3',
        4: 'A2',
        5: 'E2', // Low E
    };


    useEffect(() => {
        // Using the provided acoustic guitar samples
        const prefix = process.env.NEXT_PUBLIC_BASE_PATH || '';
        const newSampler = new Sampler({
            urls: {
                'A2': `${prefix}/notes/A2.mp3`,
                'A3': `${prefix}/notes/A3.mp3`,
                'A4': `${prefix}/notes/A4.mp3`,
                'B2': `${prefix}/notes/B2.mp3`,
                'B3': `${prefix}/notes/B3.mp3`,
                'B4': `${prefix}/notes/B4.mp3`,
                'C3': `${prefix}/notes/C3.mp3`,
                'C4': `${prefix}/notes/C4.mp3`,
                'C5': `${prefix}/notes/C5.mp3`,
                'D2': `${prefix}/notes/D2.mp3`,
                'D3': `${prefix}/notes/D3.mp3`,
                'D4': `${prefix}/notes/D4.mp3`,
                'E2': `${prefix}/notes/E2.mp3`,
                'E3': `${prefix}/notes/E3.mp3`,
                'E4': `${prefix}/notes/E4.mp3`,
                'F2': `${prefix}/notes/F2.mp3`,
                'F3': `${prefix}/notes/F3.mp3`,
                'F4': `${prefix}/notes/F4.mp3`,
                'G2': `${prefix}/notes/G2.mp3`,
                'G3': `${prefix}/notes/G3.mp3`,
                'G4': `${prefix}/notes/G4.mp3`
            },
            onload: () => {
                setIsLoaded(true);
            },
            onerror: (error) => {
                console.error("Sample loading error:", error);

                // Create better fallback synth with these new settings
                // In your useEffect where the fallback synth is created
                const fallbackSynth = new PolySynth(Synth, {
                    oscillator: {
                        type: "sine", // Use sine wave for cleaner sound
                        partialCount: 2
                    },
                    envelope: {
                        attack: 0.002,  // Very fast attack
                        decay: 0.2,     // Quick decay
                        sustain: 0.1,   // Low sustain
                        release: 0.4    // Moderate release
                    },
                    volume: -12 // Lower overall volume
                }).toDestination();

                // Create and connect effects chain
                const filter = new Filter({
                    frequency: 2000,
                    type: "lowpass",
                    rolloff: -24
                }).toDestination();

                const reverb = new Reverb({
                    decay: 2.5,
                    wet: 0.2
                }).toDestination();

                const compressor = new Compressor({
                    threshold: -20,
                    ratio: 4,
                    attack: 0.005,
                    release: 0.1
                }).toDestination();

                const chorus = new Chorus({
                    frequency: 1.5,
                    delayTime: 3.5,
                    depth: 0.7,
                    wet: 0.2
                }).start();

                // Connect effects chain
                fallbackSynth.connect(filter);
                filter.connect(chorus);
                chorus.connect(compressor);
                compressor.connect(reverb);

                setSampler(fallbackSynth);
                setIsLoaded(true);
            }
        }).toDestination();

        // Create effects for the sampler (if real samples load)
        const reverb = new Reverb({
            decay: 1.5,
            wet: 0.15
        }).toDestination();

        const compressor = new Compressor({
            threshold: -24,
            ratio: 12,
            attack: 0.003,
            release: 0.25
        }).toDestination();

        newSampler.connect(reverb);
        newSampler.connect(compressor);
        setSampler(newSampler);

        return () => {
            if (playbackTimeoutRef.current) {
                clearTimeout(playbackTimeoutRef.current);
            }
            sampler?.releaseAll();
            newSampler.dispose();
            reverb.dispose();
            compressor.dispose();
        };
    }, []);

    const getNoteFromFret = (string: number, fret: string) => {
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

    const playNote = (string: number, fret: string, type?: 'h' | 'p') => {
        if (sampler && isLoaded) {
            const note = getNoteFromFret(string, fret);
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

    const playAllNotes = async () => {
        if (!sampler || !isLoaded || isPlaying) return;

        await start();
        setIsPlaying(true);

        // First, let's create a timeline of all positions, including spaces
        const timeline: { position: number; notes: Note[] }[] = [];
        const maxPosition = Math.max(...noteSequence.map(note => note.position));

        // Fill timeline with empty arrays for each position
        for (let i = 0; i <= maxPosition; i++) {
            timeline[i] = {position: i, notes: []};
        }

        // Fill in the notes at their correct positions
        noteSequence.forEach(note => {
            timeline[note.position].notes.push(note);
        });

        const playChord = (notes: Note[]) => {
            // Sort notes by string number (6 to 1) for natural strumming
            const sortedNotes = [...notes].sort((a, b) => b.stringIndex - a.stringIndex);

            sortedNotes.forEach((note, index) => {
                const actualNote = getNoteFromFret(note.stringIndex, note.fret);
                let baseVelocity = 0.2;
                let duration = "4n";

                // Adjust velocity and duration based on type
                if (note.type === 'h') {
                    baseVelocity = 0.4;
                    duration = "8n";
                } else if (note.type === 'p') {
                    baseVelocity = 0.15;
                    duration = "8n";
                }

                const velocityVariation = 0.1;
                const velocity = baseVelocity + Math.random() * velocityVariation;
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

        const playNextPosition = (index: number) => {
            if (index >= timeline.length) {
                stopPlayback();
                return;
            }

            const currentPosition = timeline[index];

            // Only play and show highlighting if there are notes at this position
            if (currentPosition.notes.length > 0) {
                setCurrentlyPlayingNotes(
                    currentPosition.notes.map(note => ({
                        stringIndex: note.stringIndex,
                        fret: note.fret,
                        position: note.position,
                        type: note.type
                    }))
                );
                playChord(currentPosition.notes);
            } else {
                // Clear highlighting for spaces
                setCurrentlyPlayingNotes([]);
            }

            const delayMs = (60 / tempo) * 1000;
            playbackTimeoutRef.current = setTimeout(() => playNextPosition(index + 1), delayMs);
        };

        playNextPosition(0);
    };

    const updateNote = (stringIndex: number, position: number, value: string, type?: 'h' | 'p') => {
        const newTab = [...tab];
        newTab[stringIndex] = [...tab[stringIndex]];


        if (value === '') {
            // Clear the current position
            newTab[stringIndex][position] = undefined;

            // Cleanup the row - remove trailing spaces and undefined values
            while (
                newTab[stringIndex].length > 0 &&
                (newTab[stringIndex][newTab[stringIndex].length - 1] === 'space' ||
                    newTab[stringIndex][newTab[stringIndex].length - 1] === undefined)
                ) {
                newTab[stringIndex].pop();
            }

            // Update note sequence
            setNoteSequence(prev => prev.filter(note =>
                note.stringIndex !== stringIndex || note.position !== position
            ));
        } else {
            // Adding or updating a note
            // Fill any gaps with spaces up to the position
            while (newTab[stringIndex].length < position) {
                newTab[stringIndex].push('space');
            }

            newTab[stringIndex][position] = value;

            // Play the note
            playNote(stringIndex, value, type);

            // Update note sequence
            setNoteSequence(prev => {
                const existingNoteIndex = prev.findIndex(note =>
                    note.stringIndex === stringIndex && note.position === position
                );
                if (existingNoteIndex >= 0) {
                    const newSequence = [...prev];
                    newSequence[existingNoteIndex] = {
                        stringIndex,
                        position,
                        fret: value,
                        type
                    };
                    return newSequence;
                } else {
                    return [...prev, {
                        stringIndex,
                        position,
                        fret: value,
                        type
                    }];
                }
            });
        }

        setTab(newTab);
    };

    const exportTab = () => {
        let tabText = "Guitar Tab\n\n";

        // Add capo information if set
        if (capo > 0) {
            tabText += `Capo: ${capo}\n\n`;
        }

        const stringLabels = ['e|', 'B|', 'G|', 'D|', 'A|', 'E|'];
        const stringLines = Array(6).fill('').map((_, i) => stringLabels[i]);

        // Find the maximum position used in the tab
        const maxPosition = Math.max(...tab.map(string => string.length));

        // Fill in the tab content
        for (let position = 0; position < maxPosition; position++) {
            for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
                // Find if there's a note in the sequence at this position
                const noteInSequence = noteSequence.find(note =>
                    note.stringIndex === (5 - stringIndex) &&
                    note.position === position
                );

                const note = tab[5 - stringIndex][position];

                if (note === undefined || note === '') {
                    stringLines[stringIndex] += '-';
                } else if (note === 'space') {
                    stringLines[stringIndex] += ' ';
                } else {
                    // Format based on technique
                    if (noteInSequence?.type === 'h') {
                        // Hammer-on: 5h7
                        const nextNote = noteSequence.find(n =>
                            n.stringIndex === (5 - stringIndex) &&
                            n.position === position + 1
                        );
                        if (nextNote) {
                            stringLines[stringIndex] += `${note}h${nextNote.fret}`;
                            position++; // Skip the next position as we've included it
                        } else {
                            stringLines[stringIndex] += note;
                        }
                    } else if (noteInSequence?.type === 'p') {
                        // Pull-off: [7]
                        stringLines[stringIndex] += `[${note}]`;
                    } else {
                        // Regular note
                        stringLines[stringIndex] += note;
                    }
                }

                // Add spacing between notes
                stringLines[stringIndex] += '-';
            }
        }

        // Combine all strings
        tabText += stringLines.join('\n') + '\n';

        // Add legend
        if (noteSequence.some(note => note.type === 'h' || note.type === 'p')) {
            tabText += '\nLegend:\n';
            tabText += '5h7 - hammer-on from 5 to 7\n';
            tabText += '[5] - pull-off\n';
        }

        // Create and download the file
        const blob = new Blob([tabText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'guitar-tab.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const stopPlayback = () => {
        setIsPlaying(false);
        setCurrentlyPlayingNotes([]);
        sampler?.releaseAll();

        // Clear any pending timeouts
        if (playbackTimeoutRef.current) {
            clearTimeout(playbackTimeoutRef.current);
            playbackTimeoutRef.current = null;
        }
    };

    const handleDragStart = (e, fret) => {
        setDraggedNote(fret);
        e.dataTransfer.setData('text/plain', fret);
        const dragImage = document.createElement('div');
        dragImage.className = 'w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white';
        dragImage.textContent = fret;
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 20, 20);
        setTimeout(() => document.body.removeChild(dragImage), 0);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault(); // Prevent page scroll
                setDraggedNote('space');
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setDraggedNote(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                setIsSpaceMode(true);
                setDraggedNote('space');
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setIsSpaceMode(false);
                setDraggedNote(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const handleDrop = (e: DragEvent, stringIndex: number, position: number) => {
        e.preventDefault();

        // Check if there's already a note at this position
        if (tab[stringIndex][position] !== undefined && tab[stringIndex][position] !== 'space') {
            return; // If there's already a note, don't allow the drop
        }

        if (draggedNote !== null && position < 16) {
            const newTab = [...tab];

            // Ensure the array at stringIndex has enough elements
            while (newTab[stringIndex].length < position) {
                newTab[stringIndex].push('space');
            }

            newTab[stringIndex] = [
                ...newTab[stringIndex].slice(0, position),
                draggedNote,
                ...newTab[stringIndex].slice(position + 1)
            ];
            setTab(newTab);

            // Only add to sequence if it's not a space
            if (draggedNote !== 'space') {
                setNoteSequence(prev => [...prev, {
                    stringIndex,
                    fret: draggedNote,
                    position
                }]);
                playNote(stringIndex, draggedNote);
            }
        }
    };


    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    return (
        <GuitarTabContainer isLoaded={isLoaded}>
            <CapoControl capo={capo} setCapo={setCapo}/>
            <TempoControl tempo={tempo} setTempo={setTempo}/>
            <TabDisplaySection
                tab={tab}
                playNote={playNote}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                currentlyPlayingNotes={currentlyPlayingNotes}
                updateNote={updateNote}
            />
            <FretSelector handleDragStart={handleDragStart}/>
            <PlaybackControls playAllNotes={playAllNotes}
                              isPlaying={isPlaying}
                              isEmptyNoteSequence={noteSequence.length === 0}
                              stopPlayback={stopPlayback}
                              isSpaceMode={isSpaceMode}
                              setTab={setTab}
                              setNoteSequence={setNoteSequence}
                              setCurrentlyPlayingNotes={setCurrentlyPlayingNotes}
                              exportTab={exportTab}
            />
        </GuitarTabContainer>
    );
};

export default GuitarTabEditor;