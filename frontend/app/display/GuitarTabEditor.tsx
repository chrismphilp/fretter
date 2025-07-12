"use client";

import {DragEvent, FC, useEffect, useRef, useState} from 'react';
import {Chorus, Compressor, Filter, PolySynth, Reverb, Sampler, Synth} from "tone";
import GuitarTabContainer from "./GuitarTabContainer";
import TabDisplaySection from "./TabDisplaySection";
import FretSelector from "../prosody/FretSelector";
import {v4} from 'uuid';
import {emptyTab, playAllMusicalNotes, playMusicalNote} from "../utils";
import ProsodyContainer from "../prosody/ProsodyContainer";
import ActionContainer from "../actions/ActionContainer";
import {Note, Tab} from "../models/tab";

const GuitarTabEditor: FC = () => {
    const [currentlyPlayingNotes, setCurrentlyPlayingNotes] = useState<Note[]>([]);
    const [draggedNote, setDraggedNote] = useState<string | null>(null);
    const [sampler, setSampler] = useState<PolySynth | Sampler>(null);
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
            newSampler.releaseAll();
            newSampler.dispose();
            reverb.dispose();
            compressor.dispose();
        };
    }, []);

    const playNote = (stringIndex: number, fret: string, type?: 'h' | 'p' | 'space') => {
        playMusicalNote(sampler as Sampler, isLoaded, tab.capo, stringIndex, fret, type);
    }

    const playAllNotes = async () => {
        setIsPlaying(true);
        await playAllMusicalNotes(sampler as Sampler, tab, isLoaded, isPlaying, setCurrentlyPlayingNotes, playbackTimeoutRef);
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
                    _id: v4(), // Generate new ID for the note
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

    const addTabGroupSection = () => {
        setTab(prev => ({
            ...prev,
            groups: [
                ...prev.groups,
                {
                    _id: v4(),
                    tabId: prev._id,
                    groupIndex: prev.groups.length,
                    notes: [
                        [],
                        [],
                        [],
                        [],
                        [],
                        []
                    ],
                }
            ]
        }));
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
            <ProsodyContainer
                tempo={tab.tempo}
                setTempo={(tempo) => setTab({...tab, tempo})}
                capo={tab.capo}
                setCapo={(capo) => setTab({...tab, capo})}
            />

            <TabDisplaySection
                tab={tab}
                playNote={playNote}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                currentlyPlayingNotes={currentlyPlayingNotes}
                updateNote={updateNote}
            />

            <FretSelector handleDragStart={handleDragStart}/>

            <ActionContainer tab={tab}
                             setTab={setTab}
                             setCurrentlyPlayingNotes={setCurrentlyPlayingNotes}
                             addTabGroupSection={addTabGroupSection}
                             isPlaying={isPlaying}
                             playAllNotes={playAllNotes}
                             stopPlayback={stopPlayback}
            />
        </GuitarTabContainer>
    );
};

export default GuitarTabEditor;
