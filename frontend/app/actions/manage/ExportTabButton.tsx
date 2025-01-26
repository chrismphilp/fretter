import {FC} from "react";

interface ExportTabButtonProps {
    exportTab: () => void;
}

const ExportTabButton: FC<ExportTabButtonProps> = ({exportTab}) => {
    return (
        <button
            onClick={exportTab}
            className="mt-4 px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
            Export Tab
        </button>
    )
}

export default ExportTabButton;
