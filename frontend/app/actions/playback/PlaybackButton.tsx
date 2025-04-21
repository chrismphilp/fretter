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
            className={`btn btn-compact ${
                isPlaying ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed' : 'btn-primary'
            }`}
        >
            {isPlaying ? 'Playing...' : 'Play'}
        </button>
    )
}

export default PlaybackButton;
