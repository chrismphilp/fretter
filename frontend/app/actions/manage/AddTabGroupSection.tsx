import {FC} from "react";

interface AddTabGroupSectionButtonProps {
    addTabGroupSection: () => void;
}

const AddTabGroupSectionButton: FC<AddTabGroupSectionButtonProps> = ({ addTabGroupSection }) => {
    return (
        <button
            onClick={addTabGroupSection}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
            Add Section (+16 bars)
        </button>
    );
};

export default AddTabGroupSectionButton;
