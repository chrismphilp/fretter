import {FC} from "react";

const TempoControl: FC<{
    tempo: number;
    setTempo: (tempo: number) => void;
}> = ({tempo, setTempo}) => {
    return (
        <div className="flex items-center space-x-4 mb-6">
            <label className="text-gray-700">Tempo (BPM):</label>
            <input
                type="range"
                min="40"
                max="240"
                value={tempo}
                onChange={(e) => setTempo(parseInt(e.target.value))}
                className="w-48"
            />
            <span className="w-16 text-gray-700">{tempo} BPM</span>
        </div>
    );
};

export default TempoControl;