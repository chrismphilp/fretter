import {DragEvent, FC, useState} from "react";

interface FretSelectorProps {
    handleDragStart: (e: DragEvent, fret: string) => void;
}

const FretSelector: FC<FretSelectorProps> = ({handleDragStart}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };
    
    return (
        <div className="card p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-neutral-700">
                    Fret positions:
                </h3>
                <button 
                    onClick={toggleExpand}
                    className="md:hidden btn btn-compact bg-neutral-100 text-neutral-700"
                >
                    {isExpanded ? 'Show Less' : 'Show All'}
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {[...Array(isExpanded ? 13 : 8)].map((_, i) => (
                    <div
                        key={i}
                        draggable
                        onDragStart={(e) => handleDragStart(e, i.toString())}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm cursor-move hover:bg-primary-500 transition-colors"
                    >
                        {i}
                    </div>
                ))}
                {!isExpanded && (
                    <div 
                        className="w-7 h-7 sm:w-8 sm:h-8 md:hidden bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xs sm:text-sm cursor-pointer"
                        onClick={toggleExpand}
                    >
                        +
                    </div>
                )}
            </div>
        </div>
    );
};

export default FretSelector;