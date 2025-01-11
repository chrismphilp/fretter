import {FC} from "react";

const CapoControl: FC<{
    capo: number;
    setCapo: (capo: number) => void;
}> = ({capo, setCapo}) => {
    return (
        <div className="flex items-center space-x-4 mb-6">
            <label className="w-20 text-gray-700">Capo:</label>
            <input
                type="number"
                min="0"
                max="12"
                value={capo}
                onChange={(e) => setCapo(parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-amber-500"
            />
        </div>
    );
};

export default CapoControl;