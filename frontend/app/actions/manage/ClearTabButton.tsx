import {Note, Tab} from "../../GuitarTabEditor";
import {FC} from "react";
import {emptyTab} from "../../utils";

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
            className="btn btn-compact bg-neutral-200 text-neutral-700 hover:bg-neutral-300 focus:ring-neutral-400"
        >
            Clear
        </button>
    )
}

export default ClearTabButton;
