import {Note, Tab} from "../GuitarTabEditor";
import {FC} from "react";
import {emptyTab} from "../utils";

interface ClearTabButtonProps {
    tab: Tab;
    setTab: (tab: Tab) => void;
    setCurrentlyPlayingNotes: (notes: Note[]) => void;
}

const ClearTabButton: FC<ClearTabButtonProps> = ({tab, setTab, setCurrentlyPlayingNotes}) => {
    return (
        <button
            onClick={() => {
                setTab(emptyTab(tab._id));
                setCurrentlyPlayingNotes([]);
            }}
            className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-gray-700 transition-colors"
        >
            Clear Tab
        </button>
    )
}

export default ClearTabButton;
