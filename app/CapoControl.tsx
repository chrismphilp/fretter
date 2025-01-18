import {FC} from "react";

interface CapoControlProps {
    capo: number;
    setCapo: (capo: number) => void;
}

const CapoControl: FC<CapoControlProps> = ({capo, setCapo}) => {
    return (
        <div className="flex items-center space-x-4 mb-6">
            <label className="w-20 text-gray-700">Capo:</label>
            <input
                type="number"
                min="0"
                max="15"
                value={capo}
                onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setCapo(value);
                }}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
    );
};

export default CapoControl;