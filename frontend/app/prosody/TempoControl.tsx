import {ChangeEvent, FC} from "react";

interface TempoControlProps {
    tempo: number;
    setTempo: (tempo: number) => void;
}

const TempoControl: FC<TempoControlProps> = ({tempo, setTempo}) => {
    return (
        <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-neutral-700">Tempo:</label>
            <input
                type="range"
                min="40"
                max="240"
                value={tempo}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTempo(parseInt(e.target.value))}
                className="w-full accent-primary-600"
            />
            <span className="text-sm text-neutral-700 w-16 text-right">{tempo} BPM</span>
        </div>
    );
};

export default TempoControl;