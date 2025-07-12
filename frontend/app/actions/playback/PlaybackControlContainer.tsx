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
        <>
            <PlaybackButton playAllNotes={playAllNotes} isPlaying={isPlaying}/>
            <StopPlaybackButton stopPlayback={stopPlayback} isPlaying={isPlaying}/>
        </>
    );
};

export default PlaybackControlContainer;
