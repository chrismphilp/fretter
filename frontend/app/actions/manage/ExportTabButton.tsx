import {FC} from "react";

interface ExportTabButtonProps {
    exportTab: () => void;
}

const ExportTabButton: FC<ExportTabButtonProps> = ({exportTab}) => {
    return (
        <button
            onClick={exportTab}
            className="btn btn-compact bg-primary-100 text-primary-800 hover:bg-primary-200 focus:ring-primary-300"
        >
            Export
        </button>
    )
}

export default ExportTabButton;
