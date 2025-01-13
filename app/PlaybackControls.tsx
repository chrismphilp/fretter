import {Note} from "./GuitarTab";
import {FC} from "react";

interface PlaybackControlsProps {
    playAllNotes: () => void;
    isPlaying: boolean;
    isEmptyNoteSequence: boolean;
    stopPlayback: () => void;
    setTab: (tab: string[][]) => void;
    setNoteSequence: (notes: Note[]) => void;
    setCurrentlyPlayingNotes: (notes: Note[]) => void;
    exportTab: () => void;
}

const PlaybackControls: FC<PlaybackControlsProps> = (
    {
        playAllNotes,
        isPlaying,
        isEmptyNoteSequence,
        stopPlayback,
        setTab,
        setNoteSequence,
        setCurrentlyPlayingNotes,
        exportTab,  // Add this
    }) => {
    return (
        <div className="mt-6 flex space-x-4">
            <button
                onClick={playAllNotes}
                disabled={isPlaying || isEmptyNoteSequence}
                className={`px-4 py-2 rounded-md text-white transition-colors ${
                    isPlaying || isEmptyNoteSequence
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

            {!isEmptyNoteSequence && !isPlaying && (
                <>
                    <button
                        onClick={() => {
                            setTab(Array(6).fill([]));
                            setNoteSequence([]);
                            setCurrentlyPlayingNotes([]);
                        }}
                        className="px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-colors"
                    >
                        Clear Tab
                    </button>
                    <button
                        onClick={exportTab}
                        className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        Export Tab
                    </button>
                </>
            )}
        </div>
    );
};

export default PlaybackControls;
