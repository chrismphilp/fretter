import {DragEvent, FC, KeyboardEvent, useState, useEffect} from "react";
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
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 16 });
    const [isMobile, setIsMobile] = useState(false);
    const [totalPositions] = useState(16);
    
    // Check viewport size and set mobile state
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);
    
    // Adjust visible range when in mobile mode
    useEffect(() => {
        if (isMobile) {
            setVisibleRange({ start: 0, end: 8 });
        } else {
            setVisibleRange({ start: 0, end: 16 });
        }
    }, [isMobile]);
    
    // Handle pagination for mobile view
    const showNextPage = () => {
        if (visibleRange.end < totalPositions) {
            setVisibleRange({
                start: visibleRange.start + 8,
                end: Math.min(visibleRange.start + 16, totalPositions)
            });
        }
    };
    
    const showPrevPage = () => {
        if (visibleRange.start > 0) {
            setVisibleRange({
                start: Math.max(0, visibleRange.start - 8),
                end: Math.max(8, visibleRange.end - 8)
            });
        }
    };

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
        <div className="w-full mb-8">
            {tab.groups.map((group) => (
                <div key={group._id} className="card p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm text-neutral-600 font-medium">Section {group.groupIndex + 1}</h3>
                        
                        {isMobile && (
                            <div className="flex gap-2">
                                <button 
                                    onClick={showPrevPage}
                                    disabled={visibleRange.start === 0}
                                    className={`btn btn-compact ${visibleRange.start === 0 ? 'bg-neutral-200 text-neutral-400' : 'bg-primary-100 text-primary-700'}`}
                                >
                                    ←
                                </button>
                                <span className="text-xs text-neutral-500">
                                    {visibleRange.start+1}-{visibleRange.end} of {totalPositions}
                                </span>
                                <button 
                                    onClick={showNextPage}
                                    disabled={visibleRange.end >= totalPositions}
                                    className={`btn btn-compact ${visibleRange.end >= totalPositions ? 'bg-neutral-200 text-neutral-400' : 'bg-primary-100 text-primary-700'}`}
                                >
                                    →
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-rows-6 gap-2">
                        {[...Array(6)].map((_, stringIndex) => (
                            <div key={`${group._id}-${stringIndex}`} className="flex items-center space-x-2 sm:space-x-3"
                                 onDragOver={handleDragOver}>
                                <span className="w-6 sm:w-8 font-mono text-neutral-500 text-center text-xs sm:text-sm">
                                    {`${stringDisplayMappings[5 - stringIndex]}`}
                                </span>
                                <div className="flex-1 h-10 sm:h-12 border border-neutral-200 rounded flex">
                                    {[...Array(16)]
                                        .slice(visibleRange.start, visibleRange.end)
                                        .map((_, idx) => {
                                            const position = idx + visibleRange.start;
                                            const stringNotes = group.notes[stringIndex] || [];
                                            const note = stringNotes.find(note => note.position === position);

                                        return (
                                            <div
                                                key={`${group._id}-${stringIndex}-${position}`}
                                                className="flex-1 h-full border-r border-dashed border-neutral-200 relative cursor-pointer hover:bg-neutral-50 transition-colors"
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
                                                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full text-center text-white text-xs sm:text-sm cursor-text transition-colors outline-none bg-primary-600 hover:bg-primary-500"
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
                                                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-center text-white text-xs sm:text-sm cursor-text transition-colors outline-none ${
                                                                    currentlyPlayingNotes?.some(
                                                                        n => n.stringIndex === stringIndex &&
                                                                            n.position === position &&
                                                                            n.tabGroupId === group._id
                                                                    )
                                                                        ? 'bg-accent-600 animate-pulse'
                                                                        : 'bg-primary-600 hover:bg-primary-500'
                                                                }`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    playNote(stringIndex, note.fret);
                                                                }}
                                                            />
                                                            {note.type && (
                                                                <span
                                                                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs font-medium text-primary-700">
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