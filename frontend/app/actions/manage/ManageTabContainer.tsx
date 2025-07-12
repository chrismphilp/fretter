import {FC} from "react";
import ClearTabButton from "./ClearTabButton";
import AddTabGroupSection from "./AddTabGroupSection";
import {Note, Tab} from "../../display/GuitarTabEditor";

interface ManageTabContainerProps {
    addTabGroupSection: () => void;
    tab: Tab;
    setTab: (tab: Tab) => void;
    setCurrentlyPlayingNotes: (notes: Note[]) => void;
}

const ManageTabContainer: FC<ManageTabContainerProps> = (
    {
        addTabGroupSection,
        tab,
        setTab,
        setCurrentlyPlayingNotes,
    }) => {
    return (
        <>
            <AddTabGroupSection addTabGroupSection={addTabGroupSection}/>
            <ClearTabButton tab={tab} setTab={setTab} setCurrentlyPlayingNotes={setCurrentlyPlayingNotes}/>
        </>
    );
};

export default ManageTabContainer;
