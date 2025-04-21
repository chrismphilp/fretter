import {FC} from "react";
import StopPlaybackButton from "./StopPlaybackButton";
import PlaybackButton from "./PlaybackButton";

interface PlaybackControlsContainerProps {
    playAllNotes: () => void;
    isPlaying: boolean;
    stopPlayback: () => void;
}

const PlaybackControlContainer: FC<PlaybackControlsContainerProps> = (
    {
        playAllNotes,
        isPlaying,
        stopPlayback,
    }) => {
    return (
        <div className="mb-6 flex space-x-3">
            <PlaybackButton playAllNotes={playAllNotes} isPlaying={isPlaying}/>
            <StopPlaybackButton stopPlayback={stopPlayback} isPlaying={isPlaying}/>
        </div>
    );
};

export default PlaybackControlContainer;
