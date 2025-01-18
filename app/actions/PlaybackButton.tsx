import {FC} from "react";

interface PlayButtonProps {
    playAllNotes: () => void;
    isPlaying: boolean;
}

const PlaybackButton: FC<PlayButtonProps> = ({playAllNotes, isPlaying}) => {
    return (
        <button
            onClick={playAllNotes}
            disabled={isPlaying}
            className={`px-4 py-2 rounded-md text-white transition-colors ${
                isPlaying ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
        >
            {isPlaying ? 'Playing...' : 'Play All Notes'}
        </button>
    )
}

export default PlaybackButton;
