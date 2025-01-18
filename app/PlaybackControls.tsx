import {Note, Tab} from "./GuitarTabEditor";
import {FC} from "react";
import {v4} from "uuid";

interface PlaybackControlsProps {
    tab: Tab;
    playAllNotes: () => void;
    isPlaying: boolean;
    stopPlayback: () => void;
    setTab: (tab: Tab) => void;
    setCurrentlyPlayingNotes: (notes: Note[]) => void;
    exportTab: () => void;
}

const PlaybackControls: FC<PlaybackControlsProps> = (
    {
        tab,
        playAllNotes,
        isPlaying,
        stopPlayback,
        setTab,
        setCurrentlyPlayingNotes,
        exportTab,
    }) => {
    return (
        <div className="mt-6 flex space-x-4">
            <button
                onClick={playAllNotes}
                disabled={isPlaying}
                className={`px-4 py-2 rounded-md text-white transition-colors ${
                    isPlaying ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
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

            {!isPlaying && (
                <>
                    <button
                        onClick={exportTab}
                        className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        Export Tab
                    </button>
                    <button
                        onClick={() => {
                            setTab({
                                _id: tab._id,
                                tempo: 120,
                                capo: 0,
                                groups: [{
                                    _id: v4(),
                                    tabId: tab._id,
                                    groupIndex: 0,
                                    notes: [
                                        [], // String 6 (Low E)
                                        [], // String 5 (A)
                                        [], // String 4 (D)
                                        [], // String 3 (G)
                                        [], // String 2 (B)
                                        [], // String 1 (High E)
                                    ]
                                }],
                            });
                            setCurrentlyPlayingNotes([]);
                        }}
                        className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-gray-700 transition-colors"
                    >
                        Clear Tab
                    </button>
                </>
            )}
        </div>
    );
};

export default PlaybackControls;
