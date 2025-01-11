import {DragEvent, FC, useState, KeyboardEvent} from "react";
import {Note} from "./GuitarTab";

const TabDisplaySection: FC<{
    tab: string[][];
    playNote: (string: number, fret: string, type?: 'h' | 'p') => void;
    handleDragOver: (e: DragEvent) => void;
    handleDrop: (e: DragEvent, stringIndex: number, position: number) => void;
    currentlyPlayingNotes?: Note[];
    updateNote: (stringIndex: number, position: number, value: string, type?: 'h' | 'p') => void;
}> = ({
          tab,
          playNote,
          handleDragOver,
          handleDrop,
          currentlyPlayingNotes = [],
          updateNote,
      }) => {
    const [editingPosition, setEditingPosition] = useState<{ stringIndex: number, position: number } | null>(null);

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, stringIndex: number, position: number) => {
        if (e.key.toLowerCase() === 'h') {
            e.preventDefault();
            updateNote(stringIndex, position, tab[stringIndex][position], 'h');
        } else if (e.key.toLowerCase() === 'p') {
            e.preventDefault();
            updateNote(stringIndex, position, tab[stringIndex][position], 'p');
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            updateNote(stringIndex, position, '');
            setEditingPosition(null);
        }
    };

    const handleClick = (stringIndex: number, position: number) => {
        if (tab[stringIndex][position] === 'space') {
            // When clicking a space, immediately clear it and set up for editing
            updateNote(stringIndex, position, '');
        }
        setEditingPosition({stringIndex, position});
    };

    return (
        <div className="w-full bg-blue-50 p-6 rounded-lg mb-6">
            <div className="grid grid-rows-6 gap-3">
                {tab.map((stringNotes, stringIndex) => (
                    <div key={stringIndex} className="flex items-center space-x-4" onDragOver={handleDragOver}>
                        <span className="w-20 font-mono text-gray-700 text-center">
                            {`${6 - stringIndex}`}
                        </span>
                        <div className="flex-1 h-16 bg-white border border-gray-200 rounded-lg flex">
                            {[...Array(16)].map((_, position) => (
                                <div
                                    key={position}
                                    className="flex-1 h-full border-r border-dashed border-blue-200 relative cursor-pointer hover:bg-blue-50 transition-colors"
                                    onDrop={(e) => handleDrop(e, stringIndex, position)}
                                    onDragOver={handleDragOver}
                                    onClick={() => handleClick(stringIndex, position)}
                                >
                                    {editingPosition?.stringIndex === stringIndex &&
                                    editingPosition?.position === position ? (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <input
                                                type="text"
                                                value=""
                                                autoFocus
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^(?:[0-9]|1[0-9]|2[0-4])$/.test(value) || value === '') {
                                                        updateNote(stringIndex, position, value);
                                                        setEditingPosition(null);
                                                    }
                                                }}
                                                onKeyDown={(e) => handleKeyDown(e, stringIndex, position)}
                                                onBlur={() => setEditingPosition(null)}
                                                className="w-10 h-10 rounded-full text-center text-white cursor-text transition-colors outline-none bg-blue-700 hover:bg-blue-600"
                                            />
                                        </div>
                                    ) : stringNotes[position] !== undefined && stringNotes[position] !== 'space' ? (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <input
                                                type="text"
                                                value={stringNotes[position]}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^(?:[0-9]|1[0-9]|2[0-4])$/.test(value) || value === '') {
                                                        updateNote(stringIndex, position, value);
                                                    }
                                                }}
                                                onKeyDown={(e) => handleKeyDown(e, stringIndex, position)}
                                                className={`w-10 h-10 rounded-full text-center text-white cursor-text transition-colors outline-none ${
                                                    currentlyPlayingNotes?.some(
                                                        note => note.stringIndex === stringIndex &&
                                                            note.position === position
                                                    )
                                                        ? 'bg-green-600 animate-pulse'
                                                        : 'bg-blue-700 hover:bg-blue-600'
                                                }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    playNote(stringIndex, stringNotes[position]);
                                                }}
                                            />
                                        </div>
                                    ) : stringNotes[position] === 'space' ? (
                                        <div
                                            className="absolute inset-0 flex items-center justify-center cursor-pointer">
                                            <div
                                                className="w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors"
                                                onKeyDown={(e) => handleKeyDown(e, stringIndex, position)}
                                                tabIndex={0}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TabDisplaySection;