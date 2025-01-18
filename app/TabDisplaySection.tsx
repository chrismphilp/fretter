import {DragEvent, FC, KeyboardEvent, useState} from "react";
import {Note, Tab} from "./GuitarTabEditor";

interface TabDisplaySectionProps {
    tab: Tab;
    playNote: (string: number, fret: string, type?: 'h' | 'p') => void;
    handleDragOver: (e: DragEvent) => void;
    handleDrop: (e: DragEvent, stringIndex: number, position: number, groupIndex: number) => void;
    currentlyPlayingNotes: Note[];
    updateNote: (stringIndex: number, position: number, groupIndex: number, value: string, type?: 'h' | 'p') => void;
}

interface EditingPosition {
    stringIndex: number;
    position: number;
    groupIndex: number;
}

const stringDisplayMappings: Record<number, string> = {
    0: 'E',
    1: 'B',
    2: 'G',
    3: 'D',
    4: 'A',
    5: 'e',
}

const TabDisplaySection: FC<TabDisplaySectionProps> = (
    {
        tab,
        playNote,
        handleDragOver,
        handleDrop,
        currentlyPlayingNotes = [],
        updateNote,
    }) => {
    const [editingPosition, setEditingPosition] = useState<EditingPosition | null>(null);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, stringIndex: number, position: number, groupIndex: number) => {
        if (e.key.toLowerCase() === 'h') {
            e.preventDefault();
            const stringNotes = tab.groups[groupIndex].notes[stringIndex] || [];
            const note = stringNotes.find(n => n.position === position);
            if (note) {
                updateNote(stringIndex, position, groupIndex, note.fret, 'h');
            }
        } else if (e.key.toLowerCase() === 'p') {
            e.preventDefault();
            const stringNotes = tab.groups[groupIndex].notes[stringIndex] || [];
            const note = stringNotes.find(n => n.position === position);
            if (note) {
                updateNote(stringIndex, position, groupIndex, note.fret, 'p');
            }
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            updateNote(stringIndex, position, groupIndex, '');
            setEditingPosition(null);
        }
    };

    const handleClick = (stringIndex: number, position: number, groupIndex: number) => {
        const stringNotes = tab.groups[groupIndex].notes[stringIndex] || [];
        const note = stringNotes.find(n => n.position === position);
        if (note) {
            updateNote(stringIndex, position, groupIndex, '');
        }
        setEditingPosition({stringIndex, position, groupIndex});
    };

    return (
        <div className="w-full p-6 mb-6">
            {tab.groups.map((group) => (
                <div key={group._id} className="bg-blue-50 p-5 mb-8 rounded-lg">
                    <h3 className="text-gray-700 mb-2">Section {group.groupIndex + 1}</h3>
                    <div className="grid grid-rows-6 gap-3">
                        {[...Array(6)].map((_, stringIndex) => (
                            <div key={`${group._id}-${stringIndex}`} className="flex items-center space-x-4"
                                 onDragOver={handleDragOver}>
                                <span className="w-20 font-mono text-gray-700 text-center">
                                    {`${stringDisplayMappings[5 - stringIndex]}`}
                                </span>
                                <div className="flex-1 h-16 bg-white border border-gray-200 rounded-lg flex">
                                    {[...Array(16)].map((_, position) => {
                                        const stringNotes = group.notes[stringIndex] || [];
                                        const note = stringNotes.find(note => note.position === position);

                                        return (
                                            <div
                                                key={`${group._id}-${stringIndex}-${position}`}
                                                className="flex-1 h-full border-r border-dashed border-blue-200 relative cursor-pointer hover:bg-blue-50 transition-colors"
                                                onDrop={(e) => handleDrop(e, stringIndex, position, group.groupIndex)}
                                                onDragOver={handleDragOver}
                                                onClick={() => handleClick(stringIndex, position, group.groupIndex)}
                                            >
                                                {editingPosition?.stringIndex === stringIndex &&
                                                editingPosition?.position === position &&
                                                editingPosition?.groupIndex === group.groupIndex ? (
                                                    <div
                                                        className="absolute inset-0 flex items-center justify-center">
                                                        <input
                                                            type="text"
                                                            value=""
                                                            autoFocus
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (/^(?:[0-9]|1[0-9]|2[0-4])$/.test(value) || value === '') {
                                                                    updateNote(stringIndex, position, group.groupIndex, value);
                                                                    setEditingPosition(null);
                                                                }
                                                            }}
                                                            onKeyDown={(e) => handleKeyDown(e, stringIndex, position, group.groupIndex)}
                                                            onBlur={() => setEditingPosition(null)}
                                                            className="w-10 h-10 rounded-full text-center text-white cursor-text transition-colors outline-none bg-blue-700 hover:bg-blue-600"
                                                        />
                                                    </div>
                                                ) : note ? (
                                                    <div
                                                        className="absolute inset-0 flex items-center justify-center">
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={note.fret}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^(?:[0-9]|1[0-9]|2[0-4])$/.test(value) || value === '') {
                                                                        updateNote(stringIndex, position, group.groupIndex, value);
                                                                    }
                                                                }}
                                                                onKeyDown={(e) => handleKeyDown(e, stringIndex, position, group.groupIndex)}
                                                                className={`w-10 h-10 rounded-full text-center text-white cursor-text transition-colors outline-none ${
                                                                    currentlyPlayingNotes?.some(
                                                                        n => n.stringIndex === stringIndex &&
                                                                            n.position === position &&
                                                                            n.tabGroupId === group._id
                                                                    )
                                                                        ? 'bg-green-600 animate-pulse'
                                                                        : 'bg-blue-700 hover:bg-blue-600'
                                                                }`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    playNote(stringIndex, note.fret);
                                                                }}
                                                            />
                                                            {note.type && (
                                                                <span
                                                                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs font-bold text-blue-700">
                                                                    {note.type.toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TabDisplaySection;