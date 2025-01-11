"use client";

import {FC, useEffect, useState} from 'react';
import * as Tone from 'tone';
import {getTransport} from "tone";

interface StringNotes {
    [key: number]: string;
}

const Container: FC<{
    isLoaded: boolean;
    loadError: string | null;
    children: React.ReactNode;
}> = ({isLoaded, loadError, children}) => {
    return (
        <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Acoustic Guitar Tab Editor</h2>
                {!isLoaded && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <h3 className="text-sm font-medium text-blue-800">Loading</h3>
                        <p className="text-sm text-blue-700">Loading guitar samples...</p>
                    </div>
                )}
                {loadError && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <h3 className="text-sm font-medium text-yellow-800">Sound System</h3>
                        <p className="text-sm text-yellow-700">{loadError}</p>
                    </div>
                )}
            </div>
            {children}
        </div>
    );
};

const CapoControl: FC<{
    capo: number;
    setCapo: (capo: number) => void;
}> = ({capo, setCapo}) => {
    return (
        <div className="flex items-center space-x-4 mb-6">
            <label className="w-20 text-gray-700">Capo:</label>
            <input
                type="number"
                min="0"
                max="12"
                value={capo}
                onChange={(e) => setCapo(parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
        </div>
    );
};

const TabDisplaySection: FC<{
    tab: string[][];
    stringNotes: StringNotes;
    playNote: (string: number, fret: string) => void;
    handleDragOver: (e: React.DragEvent) => void;
    handleDrop: (e: React.DragEvent, stringIndex: number, position: number) => void;
    currentlyPlayingNotes?: { stringIndex: number; position: number }[];
}> = ({
          tab,
          stringNotes,
          playNote,
          handleDragOver,
          handleDrop,
          currentlyPlayingNotes = [],
      }) => {
    return (
        <div className="space-y-4 bg-amber-50 p-4 rounded-lg mb-6">
            {tab.map((stringNotes, stringIndex) => (
                <div
                    key={stringIndex}
                    className="flex items-center space-x-2 min-h-12 relative"
                    onDragOver={handleDragOver}
                >
                    <span className="w-16 font-mono text-gray-700">
                        {stringNotes[5 - stringIndex]}
                    </span>
                    <div className="flex-1 flex items-center h-12 bg-white border border-gray-200 rounded-lg relative">
                        {[...Array(16)].map((_, position) => (
                            <div
                                key={position}
                                className="w-12 h-full border-r border-dashed border-amber-200 relative"
                                onDrop={(e) => handleDrop(e, stringIndex, position)}
                                onDragOver={handleDragOver}
                            >
                                {stringNotes[position] !== undefined && stringNotes[position] !== 'space' && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white cursor-pointer transition-colors ${
                                                currentlyPlayingNotes?.some(
                                                    note => note.stringIndex === stringIndex &&
                                                        note.position === position
                                                )
                                                    ? 'bg-green-600 animate-pulse'
                                                    : 'bg-amber-700 hover:bg-amber-600'
                                            }`}
                                            onClick={() => playNote(stringIndex, stringNotes[position])}
                                        >
                                            {stringNotes[position]}
                                        </div>
                                    </div>
                                )}
                                {stringNotes[position] === 'space' && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
const FretSelector: FC<{
    handleDragStart: (e: React.DragEvent, fret: number) => void;
}> = ({handleDragStart}) => {
    return (
        <div className="p-4 bg-amber-100 rounded-lg">
            <h3 className="text-sm font-semibold mb-2 text-gray-800">
                Drag fret positions to the tab:
            </h3>
            <div className="flex flex-wrap gap-2">
                {[...Array(13)].map((_, i) => (
                    <div
                        key={i}
                        draggable
                        onDragStart={(e) => handleDragStart(e, i)}
                        className="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center text-white cursor-move hover:bg-amber-600 transition-colors"
                    >
                        {i}
                    </div>
                ))}
            </div>
        </div>
    );
};

const TempoControl: FC<{
    tempo: number;
    setTempo: (tempo: number) => void;
}> = ({ tempo, setTempo }) => {
    return (
        <div className="flex items-center space-x-4 mb-6">
            <label className="text-gray-700">Tempo (BPM):</label>
            <input
                type="range"
                min="40"
                max="240"
                value={tempo}
                onChange={(e) => setTempo(parseInt(e.target.value))}
                className="w-48"
            />
            <span className="w-16 text-gray-700">{tempo} BPM</span>
        </div>
    );
};

interface Note {
    stringIndex: number;
    fret: string;
    position: number;
}

const GuitarTabEditor = () => {
    // In GuitarTabEditor component
    const [currentlyPlayingNotes, setCurrentlyPlayingNotes] = useState<{ stringIndex: number; position: number }[]>([]);
    const [tempo, setTempo] = useState<number>(120); // BPM (beats per minute)
    const [capo, setCapo] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const [draggedNote, setDraggedNote] = useState<string | null>(null);
    const [sampler, setSampler] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
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
        const newSampler = new Tone.Sampler({
            urls: {
                'A2': '/notes/A2.mp3',
                'A3': '/notes/A3.mp3',
                'A4': '/notes/A4.mp3',
                'B2': '/notes/B2.mp3',
                'B3': '/notes/B3.mp3',
                'B4': '/notes/B4.mp3',
                'C3': '/notes/C3.mp3',
                'C4': '/notes/C4.mp3',
                'C5': '/notes/C5.mp3',
                'D2': '/notes/D2.mp3',
                'D3': '/notes/D3.mp3',
                'D4': '/notes/D4.mp3',
                'E2': '/notes/E2.mp3',
                'E3': '/notes/E3.mp3',
                'E4': '/notes/E4.mp3',
                'F2': '/notes/F2.mp3',
                'F3': '/notes/F3.mp3',
                'F4': '/notes/F4.mp3',
                'G2': '/notes/G2.mp3',
                'G3': '/notes/G3.mp3',
                'G4': '/notes/G4.mp3'
            },
            onload: () => {
                setIsLoaded(true);
            },
            onerror: (error) => {
                console.error("Sample loading error:", error);
                // Create fallback synth
                const fallbackSynth = new Tone.Synth({
                    oscillator: {
                        type: "sine",
                        partialCount: 3
                    },
                    envelope: {
                        attack: 0.02,
                        decay: 0.5,
                        sustain: 0.3,
                        release: 1
                    }
                }).toDestination();
                setSampler(fallbackSynth);
                setIsLoaded(true);
            }
        }).toDestination();

        // Add effects chain for more realistic guitar sound
        const reverb = new Tone.Reverb({
            decay: 1.5,
            wet: 0.15
        }).toDestination();

        const compressor = new Tone.Compressor({
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
            console.log('Playing note:', note, 'string:', string, 'fret:', fret);
            const velocity = 0.5 + Math.random() * 0.2;
            const timing = Tone.now();
            sampler.triggerAttackRelease(note, "2n", timing, velocity);
        }
    };

    const playAllNotes = async () => {
        if (!sampler || !isLoaded || isPlaying) return;

        await Tone.start();
        setIsPlaying(true);

        const delayMs = (60 / tempo) * 1000;

        // Group notes by position to create chords
        const groupedNotes = noteSequence.reduce((acc, note) => {
            if (!acc[note.position]) {
                acc[note.position] = [];
            }
            acc[note.position].push(note);
            return acc;
        }, {} as Record<number, Note[]>);

        const positions = Object.keys(groupedNotes)
            .map(Number)
            .sort((a, b) => a - b);

        const playChord = (notes: Note[]) => {
            notes.forEach(note => {
                const actualNote = getNoteFromFret(note.stringIndex, note.fret);
                const velocity = 0.5 + Math.random() * 0.2;
                sampler.triggerAttackRelease(actualNote, "4n", undefined, velocity);
            });
        };

        const playNextChord = (index: number) => {
            if (index >= positions.length) {
                setIsPlaying(false);
                setCurrentlyPlayingNotes([]);
                return;
            }

            const position = positions[index];
            const chordNotes = groupedNotes[position];

            // Update all currently playing notes at once
            setCurrentlyPlayingNotes(
                chordNotes.map(note => ({
                    stringIndex: note.stringIndex,
                    position: note.position
                }))
            );

            playChord(chordNotes);
            setTimeout(() => playNextChord(index + 1), delayMs);
        };

        playNextChord(0);
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
        dragImage.className = 'w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center text-white';
        dragImage.textContent = fret;
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 20, 20);
        setTimeout(() => document.body.removeChild(dragImage), 0);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' && isDragging) {
            e.preventDefault();
            setDraggedNote('space');
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDragging]);

    const handleDrop = (e: React.DragEvent, stringIndex: number, position: number) => {
        e.preventDefault();
        setIsDragging(false);

        if (draggedNote !== null && position < 16) { // Limit to 16 positions
            const newTab = [...tab];
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
        <>
            <Container isLoaded={isLoaded} loadError={loadError}>
                <CapoControl capo={capo} setCapo={setCapo}/>
                <TempoControl tempo={tempo} setTempo={setTempo}/>
                <TabDisplaySection
                    tab={tab}
                    stringNotes={stringNotes}
                    playNote={playNote}
                    handleDragOver={handleDragOver}
                    handleDrop={handleDrop}
                    currentlyPlayingNotes={currentlyPlayingNotes}
                />
                <FretSelector handleDragStart={handleDragStart}/>
            </Container>

            {/* Playback Controls */}
            <div className="mt-6 flex space-x-4">
                <button
                    onClick={async () => {
                        // Initialize Tone.js on user interaction
                        await Tone.start();
                        playAllNotes();
                    }}
                    disabled={isPlaying || noteSequence.length === 0}
                    className={`px-4 py-2 rounded-md text-white transition-colors ${
                        isPlaying || noteSequence.length === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                    {isPlaying ? 'Playing...' : 'Play All Notes'}
                </button>

                {isPlaying && (
                    <button
                        onClick={stopPlayback}
                        className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                    >
                        Stop
                    </button>
                )}

                {noteSequence.length > 0 && !isPlaying && (
                    <button
                        onClick={() => {
                            setTab(Array(6).fill([]));
                            setNoteSequence([]);
                        }}
                        className="px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-colors"
                    >
                        Clear Tab
                    </button>
                )}
            </div>
        </>
    );
};

export default GuitarTabEditor;