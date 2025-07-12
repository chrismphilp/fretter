import {FC} from "react";
import ManageTabContainer from "./manage/ManageTabContainer";
import {Note, Tab} from "../display/GuitarTabEditor";
import PlaybackControlContainer from "./playback/PlaybackControlContainer";

interface ActionContainerProps {
    tab: Tab;
    setTab: (tab: Tab) => void;
    isPlaying: boolean;
    playAllNotes: () => void;
    stopPlayback: () => void;
    addTabGroupSection: () => void;
    setCurrentlyPlayingNotes: (notes: Note[]) => void;
}

const ActionContainer: FC<ActionContainerProps> = (
    {
        tab,
        setTab,
        isPlaying,
        playAllNotes,
        stopPlayback,
        addTabGroupSection,
        setCurrentlyPlayingNotes,
    }) => {
    return (
        <div className="card p-4 sticky bottom-4 z-10 border-t-2 border-primary-200">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-2 justify-center sm:justify-start">
                    <PlaybackControlContainer isPlaying={isPlaying}
                                              playAllNotes={playAllNotes}
                                              stopPlayback={stopPlayback}/>

                </div>

                <div className="flex gap-2 justify-center sm:justify-end">
                    <ManageTabContainer addTabGroupSection={addTabGroupSection}
                                        tab={tab}
                                        setTab={setTab}
                                        setCurrentlyPlayingNotes={setCurrentlyPlayingNotes}/>
                </div>
            </div>
        </div>
    );
};

export default ActionContainer;
