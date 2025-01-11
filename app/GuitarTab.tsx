"use client";

import {DragEvent, useEffect, useState} from 'react';
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

interface Note {
    stringIndex: number;
    fret: string;
    position: number;
}

const GuitarTabEditor = () => {
    const [isSpaceMode, setIsSpaceMode] = useState(false);
    const [currentlyPlayingNotes, setCurrentlyPlayingNotes] = useState<Note[]>([]);
    const [tempo, setTempo] = useState<number>(120); // BPM (beats per minute)
    const [capo, setCapo] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const [draggedNote, setDraggedNote] = useState<string | null>(null);
    const [sampler, setSampler] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [noteSequence, setNoteSequence] = useState<Note[]>([]);

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

    const playNote = (string: number, fret: string) => {
        if (sampler && isLoaded) {
            const note = getNoteFromFret(string, fret);
            // Lower velocity for single notes
            const velocity = 0.2 + Math.random() * 0.1;
            const timing = now();
            sampler.triggerAttackRelease(note, "4n", timing, velocity);
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
                const baseVelocity = 0.2;
                const velocityVariation = 0.1;
                const velocity = baseVelocity + Math.random() * velocityVariation;
                const strumDelay = index * 15;
                const timing = now() + (strumDelay / 1000);

                sampler.triggerAttackRelease(
                    actualNote,
                    "4n",
                    timing,
                    velocity
                );
            });
        };

        const playNextPosition = (index: number) => {
            if (index >= timeline.length) {
                setIsPlaying(false);
                setCurrentlyPlayingNotes([]);
                return;
            }

            const currentPosition = timeline[index];

            // Only play and show highlighting if there are notes at this position
            if (currentPosition.notes.length > 0) {
                setCurrentlyPlayingNotes(
                    currentPosition.notes.map(note => ({
                        stringIndex: note.stringIndex,
                        fret: note.fret,
                        position: note.position
                    }))
                );
                playChord(currentPosition.notes);
            } else {
                // Clear highlighting for spaces
                setCurrentlyPlayingNotes([]);
            }

            const delayMs = (60 / tempo) * 1000;
            setTimeout(() => playNextPosition(index + 1), delayMs);
        };

        playNextPosition(0);
    };

    const updateNote = (stringIndex: number, position: number, value: string) => {
        const newTab = tab.map(stringNotes => [...stringNotes]); // Create deep copy

        if (value === '') {
            // Remove the note
            if (newTab[stringIndex][position]) {
                newTab[stringIndex][position] = undefined;
                setNoteSequence(prev => prev.filter(note =>
                    note.stringIndex !== stringIndex || note.position !== position
                ));
            }
        } else {
            // Update single position only
            newTab[stringIndex][position] = value;

            // Play the note
            playNote(stringIndex, value);

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
                        fret: value
                    };
                    return newSequence;
                } else {
                    return [...prev, {
                        stringIndex,
                        position,
                        fret: value
                    }];
                }
            });
        }

        setTab(newTab);
    };

    const stopPlayback = () => {
        setIsPlaying(false);
        setCurrentlyPlayingNotes([]);
        sampler?.releaseAll();
    };

    const handleDragStart = (e, fret) => {
        setIsDragging(true);
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
        setIsDragging(false);

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
            />
        </GuitarTabContainer>
    );
};

export default GuitarTabEditor;