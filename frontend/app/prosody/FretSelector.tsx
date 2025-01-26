import {DragEvent, FC} from "react";

interface FretSelectorProps {
    handleDragStart: (e: DragEvent, fret: string) => void;
}

const FretSelector: FC<FretSelectorProps> = ({handleDragStart}) => {
    return (
        <div className="p-4 bg-blue-100 rounded-lg">
            <h3 className="text-sm font-semibold mb-2 text-gray-800">
                Drag fret positions to the tab:
            </h3>
            <div className="flex flex-wrap gap-2">
                {[...Array(13)].map((_, i) => (
                    <div
                        key={i}
                        draggable
                        onDragStart={(e) => handleDragStart(e, i.toString())}
                        className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white cursor-move hover:bg-blue-600 transition-colors"
                    >
                        {i}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FretSelector;