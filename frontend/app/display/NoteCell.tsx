import {DragEvent, KeyboardEvent} from 'react';
import {Note} from '../models/tab';
import { FC } from 'react';

interface NoteCellProps {
    note?: Note;
    isEditing: boolean;
    isPlaying: boolean;
    isColumnPlaying?: boolean;
    onDrop: (e: DragEvent) => void;
    onDragOver: (e: DragEvent) => void;
    onClick: () => void;
    onUpdate: (value: string) => void;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    onPlayNote: (fret: string) => void;
}

export const NoteCell: FC<NoteCellProps> = ({
    note,
    isEditing,
    isPlaying,
    isColumnPlaying,
    onDrop,
    onDragOver,
    onClick,
    onUpdate,
    onKeyDown,
    onBlur,
    onPlayNote,
}) => {

    const cellClasses = `
        relative flex-1 h-full flex items-center justify-center 
        border-r border-neutral-200 last:border-r-0
        transition-colors duration-150
        ${isPlaying ? 'bg-primary-200' : isColumnPlaying ? 'bg-neutral-100' : 'bg-white'}
    `;

    if (isEditing) {
        return (
            <div className={cellClasses}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <input
                        type="text"
                        value=""
                        autoFocus
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^(?:[0-9]|1[0-9]|2[0-4])$/.test(value) || value === '') {
                                onUpdate(value);
                            }
                        }}
                        onKeyDown={onKeyDown}
                        onBlur={onBlur}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full text-center text-white text-xs sm:text-sm cursor-text transition-colors outline-none bg-primary-600 hover:bg-primary-500"
                    />
                </div>
            </div>
        );
    }

    if (!note) {
        return (
            <div
                className={`${cellClasses} cursor-pointer hover:bg-neutral-50`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onClick={onClick}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-neutral-300">?</span>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`${cellClasses} cursor-pointer hover:bg-neutral-50`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={onClick}
        >
            {note ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onPlayNote(note.fret);
                            }}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-center text-white text-xs sm:text-sm cursor-pointer transition-colors outline-none ${
                                isPlaying
                                    ? 'bg-accent-600 animate-pulse'
                                    : 'bg-primary-600 hover:bg-primary-500'
                            }`}
                        >
                            {note.fret}
                        </button>
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
};
