import {FC} from "react";
import AddTabGroupSectionButton from "./AddTabGroupSection";
import ClearTabButton from "./ClearTabButton";
import ExportTabButton from "./ExportTabButton";
import {Note, Tab} from "../../GuitarTabEditor";

interface ManageTabContainerProps {
    tab: Tab;
    setTab: (tab: Tab) => void;
    addTabGroupSection: () => void;
    setCurrentlyPlayingNotes: (notes: Note[]) => void;
    exportTab: () => void;
}

const ManageTabContainer: FC<ManageTabContainerProps> = (
    {
        tab,
        setTab,
        addTabGroupSection,
        setCurrentlyPlayingNotes,
        exportTab,
    }) => {
    return (
        <div className="mt-6 flex space-x-4">
            <AddTabGroupSectionButton addTabGroupSection={addTabGroupSection}/>
            <ClearTabButton tab={tab} setTab={setTab} setCurrentlyPlayingNotes={setCurrentlyPlayingNotes}/>
            <ExportTabButton exportTab={exportTab}/>
        </div>
    );
}

export default ManageTabContainer;
