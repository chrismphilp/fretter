import {start} from "tone";
import {FC} from "react";

const PlaybackControls: FC<{
    playAllNotes,
    isPlaying,
    isEmptyNoteSequence,
    stopPlayback,
    isSpaceMode,
    setTab,
    setNoteSequence,
    setCurrentlyPlayingNotes,
}> = ({
          playAllNotes,
          isPlaying,
          isEmptyNoteSequence,
          stopPlayback,
          isSpaceMode,
          setTab,
          setNoteSequence,
          setCurrentlyPlayingNotes,
      }) => {
    return (
        <div className="mt-6 flex space-x-4">
            <button
                onClick={async () => {
                    // Initialize Tone.js on user interaction
                    await start();
                    await playAllNotes();
                }}
                disabled={isPlaying || isEmptyNoteSequence}
                className={`px-4 py-2 rounded-md text-white transition-colors ${
                    isPlaying || isEmptyNoteSequence ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
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
                <button
                    onClick={() => {
                        setTab([[], [], [], [], [], []]); // Reset to 6 empty arrays
                        setNoteSequence([]); // Clear the sequence
                        setCurrentlyPlayingNotes([]); // Reset any playing notes
                    }}
                    className="px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-colors"
                >
                    Clear Tab
                </button>
            )}

            {isSpaceMode && (
                <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md opacity-75">
                    Space Mode Active
                </div>
            )}
        </div>
    );
}

export default PlaybackControls;