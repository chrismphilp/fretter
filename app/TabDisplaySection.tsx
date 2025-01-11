import {DragEvent, FC, useState} from "react";

const TabDisplaySection: FC<{
    tab: string[][];
    playNote: (string: number, fret: string) => void;
    handleDragOver: (e: DragEvent) => void;
    handleDrop: (e: DragEvent, stringIndex: number, position: number) => void;
    currentlyPlayingNotes?: { stringIndex: number; position: number }[];
    updateNote: (stringIndex: number, position: number, value: string) => void;
}> = ({
          tab,
          playNote,
          handleDragOver,
          handleDrop,
          currentlyPlayingNotes = [],
          updateNote,
      }) => {
    const [editingPosition, setEditingPosition] = useState<{ stringIndex: number, position: number } | null>(null);

    return (
        <div className="w-full bg-blue-50 p-6 rounded-lg mb-6">
            <div className="grid grid-rows-6 gap-4">
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
                                    onClick={() => {
                                        if (!stringNotes[position]) {
                                            setEditingPosition({stringIndex, position});
                                        }
                                    }}
                                >
                                    {stringNotes[position] !== undefined && stringNotes[position] !== 'space' ? (
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
                                    ) : editingPosition?.stringIndex === stringIndex &&
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
                                                onBlur={() => setEditingPosition(null)}
                                                className="w-10 h-10 rounded-full text-center text-white cursor-text transition-colors outline-none bg-vlue-700 hover:bg-blue-600"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    ) : stringNotes[position] === 'space' ? (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
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