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
            className={`btn btn-compact ${
                !isPlaying ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed' : 'bg-accent-600 text-white hover:bg-accent-700 focus:ring-accent-500'
            }`}
        >
            Stop
        </button>
    )
}

export default StopPlaybackButton;
