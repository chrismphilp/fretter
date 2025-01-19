import {FC} from "react";
import TempoControl from "./TempoControl";
import CapoControl from "./CapoControl";

interface ProsodyContainerProps {
    tempo: number;
    setTempo: (tempo: number) => void;
    capo: number;
    setCapo: (capo: number) => void;
}

const ProsodyContainer: FC<ProsodyContainerProps> = (
    {
        tempo,
        setTempo,
        capo,
        setCapo,
    }
) => {
    return (
        <div className="flex flex-wrap">
            <CapoControl capo={capo} setCapo={setCapo}/>
            <TempoControl tempo={tempo} setTempo={setTempo}/>
        </div>
    )
}

export default ProsodyContainer;
