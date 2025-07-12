import {DragEvent, FC, KeyboardEvent, useState} from "react";
import {Tab} from "../models/tab";
import {NoteCell} from './NoteCell';

interface TabDisplaySectionProps {
    tab: Tab;
    updateNote: (stringIndex: number, position: number, groupIndex: number, value: string) => void;
    playNote: (stringIndex: number, fret: string) => void;
    currentlyPlayingNotes: { stringIndex: number; position: number; tabGroupId?: string; }[] | null;
    handleDragOver: (e: DragEvent) => void;
    handleDrop: (e: DragEvent, stringIndex: number, position: number, groupIndex: number) => void;
}

export const TabDisplaySection: FC<TabDisplaySectionProps> = (
    {
        tab,
        updateNote,
        playNote,
        currentlyPlayingNotes,
        handleDragOver,
        handleDrop,
    }) => {
    const [editingPosition, setEditingPosition] = useState<{
        stringIndex: number;
        position: number;
        groupIndex: number;
    } | null>(null);

    const [visibleRange, setVisibleRange] = useState({start: 0, end: 16});
    const totalPositions = 16;

    const currentlyPlayingPosition = currentlyPlayingNotes && currentlyPlayingNotes.length > 0 ? currentlyPlayingNotes[0].position : null;
    const currentlyPlayingGroupId = currentlyPlayingNotes && currentlyPlayingNotes.length > 0 ? currentlyPlayingNotes[0].tabGroupId : null;

    const showNextPage = () => {
        const newStart = visibleRange.start + 8;
        const newEnd = Math.min(newStart + 8, totalPositions);
        if (newStart < totalPositions) {
            setVisibleRange({start: newStart, end: newEnd});
        }
    };

    const showPrevPage = () => {
        const newStart = Math.max(visibleRange.start - 8, 0);
        setVisibleRange({start: newStart, end: newStart + 8});
    };

    const handleClick = (stringIndex: number, position: number, groupIndex: number) => {
        setEditingPosition({stringIndex, position, groupIndex});
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, stringIndex: number, position: number, groupIndex: number) => {
        if (e.key === 'Enter' || e.key === 'Escape' || e.key === 'Tab') {
            setEditingPosition(null);
        } else if (e.key === 'Backspace') {
            updateNote(stringIndex, position, groupIndex, '');
            setEditingPosition(null);
        }
    };

    return (
        <div className="w-full mb-8">
            {tab.groups.map((group) => (
                <div key={group._id} className="card p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm text-neutral-600 font-medium">Section {group.groupIndex + 1}</h3>

                        <div className="flex gap-2">
                            <button
                                onClick={showPrevPage}
                                disabled={visibleRange.start === 0}
                                className={`btn btn-compact ${visibleRange.start === 0 ? 'bg-neutral-200 text-neutral-400' : 'bg-primary-100 text-primary-700'}`}
                            >
                                ←
                            </button>
                            <span className="text-xs text-neutral-500">
                                {visibleRange.start + 1}-{Math.min(visibleRange.end, totalPositions)} of {totalPositions}
                            </span>
                            <button
                                onClick={showNextPage}
                                disabled={visibleRange.end >= totalPositions}
                                className={`btn btn-compact ${visibleRange.end >= totalPositions ? 'bg-neutral-200 text-neutral-400' : 'bg-primary-100 text-primary-700'}`}
                            >
                                →
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-rows-6 gap-2">
                        {[...Array(6)].map((_, stringIndex) => (
                            <div key={`${group._id}-${stringIndex}`}
                                 className="flex items-center space-x-2 sm:space-x-3"
                                 onDragOver={handleDragOver}>
                                <span className="w-6 sm:w-8 font-mono text-neutral-500 text-center text-xs sm:text-sm">
                                    {`${stringDisplayMappings[5 - stringIndex]}`}
                                </span>
                                <div className="flex-1 h-10 sm:h-12 border border-neutral-200 rounded flex">
                                    {[...Array(totalPositions)]
                                        .slice(visibleRange.start, visibleRange.end)
                                        .map((_, idx) => {
                                            const position = idx + visibleRange.start;
                                            const stringNotes = group.notes[stringIndex] || [];
                                            const note = stringNotes.find(note => note.position === position);
                                            const isEditing = editingPosition?.stringIndex === stringIndex &&
                                                editingPosition?.position === position &&
                                                editingPosition?.groupIndex === group.groupIndex;
                                            const isPlaying = currentlyPlayingNotes?.some(
                                                n => n.stringIndex === stringIndex &&
                                                    n.position === position &&
                                                    n.tabGroupId === group._id
                                            );
                                            const isColumnPlaying = currentlyPlayingPosition === position && currentlyPlayingGroupId === group._id;


                                            return (
                                                <NoteCell
                                                    key={`${group._id}-${stringIndex}-${position}`}
                                                    note={note}
                                                    isEditing={isEditing}
                                                    isPlaying={!!isPlaying}
                                                    isColumnPlaying={isColumnPlaying}
                                                    onDrop={(e) => handleDrop(e, stringIndex, position, group.groupIndex)}
                                                    onDragOver={handleDragOver}
                                                    onClick={() => handleClick(stringIndex, position, group.groupIndex)}
                                                    onUpdate={(value) => {
                                                        updateNote(stringIndex, position, group.groupIndex, value);
                                                        if (isEditing) {
                                                            setEditingPosition(null);
                                                        }
                                                    }}
                                                    onKeyDown={(e) => handleKeyDown(e, stringIndex, position, group.groupIndex)}
                                                    onBlur={() => setEditingPosition(null)}
                                                    onPlayNote={(fret) => playNote(stringIndex, fret.toString())}
                                                />
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

const stringDisplayMappings = ["e", "B", "G", "D", "A", "E"];

export default TabDisplaySection;
