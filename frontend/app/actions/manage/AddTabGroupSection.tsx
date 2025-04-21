import {FC} from "react";

interface AddTabGroupSectionButtonProps {
    addTabGroupSection: () => void;
}

const AddTabGroupSectionButton: FC<AddTabGroupSectionButtonProps> = ({ addTabGroupSection }) => {
    return (
        <button
            onClick={addTabGroupSection}
            className="btn btn-compact btn-primary"
        >
            Add Section
        </button>
    );
};

export default AddTabGroupSectionButton;
