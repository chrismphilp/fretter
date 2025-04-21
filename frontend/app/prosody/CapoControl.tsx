import {FC} from "react";

interface CapoControlProps {
    capo: number;
    setCapo: (capo: number) => void;
}

const CapoControl: FC<CapoControlProps> = ({capo, setCapo}) => {
    return (
        <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-neutral-700">Capo:</label>
            <input
                type="number"
                min="0"
                max="15"
                value={capo}
                onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setCapo(value);
                }}
                className="w-20 px-3 py-2 text-sm rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
        </div>
    );
};

export default CapoControl;
