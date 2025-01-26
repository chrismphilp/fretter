import {FC} from "react";

interface StopPlaybackButtonProps {
    stopPlayback: () => void;
    isPlaying: boolean;
}

const StopPlaybackButton: FC<StopPlaybackButtonProps> = ({stopPlayback, isPlaying}) => {
    return (
        <button
            onClick={stopPlayback}
            disabled={!isPlaying}
            className={`px-4 py-2 rounded-md text-white transition-colors" ${
                !isPlaying ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-700'
            }`}
        >
            Stop
        </button>
    )
}

export default StopPlaybackButton;
