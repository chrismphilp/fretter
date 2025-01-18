"use client";

import {DragEvent, FC, useEffect, useRef, useState} from 'react';
import {Chorus, Compressor, Filter, PolySynth, Reverb, Sampler, Synth} from "tone";
import GuitarTabContainer from "./GuitarTabContainer";
import CapoControl from "./CapoControl";
import TabDisplaySection from "./TabDisplaySection";
import TempoControl from "./TempoControl";
import FretSelector from "./FretSelector";
import PlaybackControls from "./actions/PlaybackControls";
import AddSectionButton from "./AddTabSection";
import {v4} from 'uuid';
import {emptyTab, playAllMusicalNotes, playMusicalNote} from "./utils";

export interface Tab {
    _id: string;
    groups: TabGroup[];
    tempo: number;
    capo: number;
}

export interface TabGroup {
    _id: string;
    tabId: string;
    groupIndex: number;
    notes: Note[][];
}

export interface Note {
    _id: string;
    tabGroupId?: string;
    stringIndex: number;
    fret: string;
    position: number;
    absolutePosition: number;
    type?: 'h' | 'p' | 'space';
}

const GuitarTabEditor: FC = () => {
    const [currentlyPlayingNotes, setCurrentlyPlayingNotes] = useState<Note[]>([]);
    const [draggedNote, setDraggedNote] = useState<string | null>(null);
    const [sampler, setSampler] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [tab, setTab] = useState<Tab>(emptyTab(v4()));

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

    const playNote = (stringIndex: number, fret: string, type?: 'h' | 'p' | 'space') => {
        playMusicalNote(sampler, isLoaded, tab.capo, stringIndex, fret, type);
    }

    const playAllNotes = async () => {
        setIsPlaying(true);
        await playAllMusicalNotes(sampler, tab, isLoaded, isPlaying, setCurrentlyPlayingNotes, playbackTimeoutRef);
    }

    const updateNote = (stringIndex: number, position: number, groupIndex: number, value: string, type?: 'h' | 'p' | 'space') => {
        setTab(prev => {
            const newGroups = [...prev.groups];
            const targetGroup = {...newGroups[groupIndex]};

            if (value === '') {
                // Remove note if it exists
                targetGroup.notes = targetGroup.notes.map((stringNotes, idx) =>
                    idx === stringIndex
                        ? stringNotes.filter(note => note.position !== position)
                        : stringNotes
                );
            } else {
                const absolutePosition = (groupIndex * 16) + position;
                const newNote: Note = {
                    _id: crypto.randomUUID(), // Generate new ID for the note
                    tabGroupId: targetGroup._id,
                    stringIndex,
                    position,
                    absolutePosition,
                    fret: value,
                    type
                };

                // Ensure string array exists
                if (!targetGroup.notes[stringIndex]) {
                    targetGroup.notes[stringIndex] = [];
                }

                // Remove existing note at this position if it exists
                targetGroup.notes[stringIndex] = targetGroup.notes[stringIndex].filter(
                    note => note.position !== position
                );

                // Add the new note
                targetGroup.notes[stringIndex].push(newNote);

                // Play the note
                playNote(stringIndex, value, type);
            }

            newGroups[groupIndex] = targetGroup;
            return {
                ...prev,
                groups: newGroups
            };
        });
    };

    const addNewSection = () => {
        setTab(prev => ({
            ...prev,
            groups: [
                ...prev.groups,
                {
                    _id: crypto.randomUUID(),
                    tabId: prev._id,
                    groupIndex: prev.groups.length,
                    notes: [
                        [],
                        [],
                        [],
                        [],
                        [],
                        []
                    ] // Initialize empty arrays for each string
                }
            ]
        }));
    };

    const exportTab = () => {
        let tabText = "Guitar Tab\n\n";

        if (tab.capo > 0) {
            tabText += `Capo: ${tab.capo}\n\n`;
        }

        const stringLabels = ['e|', 'B|', 'G|', 'D|', 'A|', 'E|'];
        const stringLines = Array(6).fill('').map((_, i) => stringLabels[i]);

        // Process each group
        tab.groups.forEach((group, groupIndex) => {
            // Add group separator if not first group
            if (groupIndex > 0) {
                stringLines.forEach((_, i) => {
                    stringLines[i] += '||';
                });
            }

            // Get notes for this group
            for (let position = 0; position < 16; position++) {
                for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
                    // Find note at this position for this string
                    const stringNotes = group.notes[5 - stringIndex] || [];
                    const note = stringNotes.find(n => n.position === position);

                    if (!note) {
                        stringLines[stringIndex] += '-';
                    } else {
                        if (note.type === 'h') {
                            // Find next note for hammer-on
                            const nextNote = stringNotes.find(n => n.position === position + 1);
                            if (nextNote) {
                                stringLines[stringIndex] += `${note.fret}h${nextNote.fret}`;
                                position++; // Skip next position
                            } else {
                                stringLines[stringIndex] += note.fret;
                            }
                        } else if (note.type === 'p') {
                            stringLines[stringIndex] += `[${note.fret}]`;
                        } else {
                            stringLines[stringIndex] += note.fret;
                        }
                    }

                    stringLines[stringIndex] += '-';
                }
            }
        });

        tabText += stringLines.join('\n') + '\n';

        // Add legend if techniques are used
        if (tab.groups.some(group =>
            group.notes.some(stringNotes =>
                stringNotes.some(note => note.type === 'h' || note.type === 'p')
            )
        )) {
            tabText += '\nLegend:\n';
            tabText += '5h7 - hammer-on from 5 to 7\n';
            tabText += '[5] - pull-off\n';
        }

        const blob = new Blob([tabText], {type: 'text/plain'});
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

    const handleDragStart = (e: DragEvent, fret: string) => {
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

    const handleDrop = (e: DragEvent, stringIndex: number, position: number, groupIndex: number) => {
        e.preventDefault();

        const targetGroup = tab.groups[groupIndex];
        if (!targetGroup) return;

        // Check if there's already a note at this position
        if (targetGroup.notes[stringIndex][position] !== undefined &&
            targetGroup.notes[stringIndex][position].type !== 'space') {
            return;
        }

        if (draggedNote !== null && position < 16) {
            updateNote(stringIndex, position, groupIndex, draggedNote);
        }
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    return (
        <GuitarTabContainer isLoaded={isLoaded}>
            <CapoControl capo={tab.capo} setCapo={(capo) => setTab({...tab, capo})}/>
            <TempoControl tempo={tab.tempo} setTempo={(tempo) => setTab({...tab, tempo})}/>
            <TabDisplaySection
                tab={tab}
                playNote={playNote}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                currentlyPlayingNotes={currentlyPlayingNotes}
                updateNote={updateNote}
            />
            <FretSelector handleDragStart={handleDragStart}/>
            <AddSectionButton onAdd={addNewSection}/>
            <PlaybackControls
                tab={tab}
                playAllNotes={playAllNotes}
                isPlaying={isPlaying}
                stopPlayback={stopPlayback}
                setTab={setTab}
                setCurrentlyPlayingNotes={setCurrentlyPlayingNotes}
                exportTab={exportTab}
            />
        </GuitarTabContainer>
    );
};

export default GuitarTabEditor;