import {Note, Tab} from "../GuitarTabEditor";
import {FC} from "react";
import ClearTabButton from "./ClearTabButton";
import ExportTabButton from "./ExportTabButton";
import StopPlaybackButton from "./StopPlaybackButton";
import PlaybackButton from "./PlaybackButton";

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
            <PlaybackButton playAllNotes={playAllNotes} isPlaying={isPlaying}/>
            <StopPlaybackButton stopPlayback={stopPlayback} isPlaying={isPlaying}/>
            <ClearTabButton tab={tab} setTab={setTab} setCurrentlyPlayingNotes={setCurrentlyPlayingNotes}/>
            <ExportTabButton exportTab={exportTab}/>
        </div>
    );
};

export default PlaybackControls;
