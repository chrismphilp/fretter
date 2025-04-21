import {FC, ReactNode} from "react";

interface GuitarTabContainerProps {
    isLoaded: boolean;
    children: ReactNode;
}

const GuitarTabContainer: FC<GuitarTabContainerProps> = ({isLoaded, children}) => {
    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h2 className="text-2xl font-medium text-neutral-800 tracking-tight pb-2 border-b border-neutral-200">Fretter</h2>
                {!isLoaded && (
                    <div className="mt-4 p-4 bg-primary-50 border border-primary-100 rounded-md">
                        <p className="text-sm text-primary-700">Loading guitar samples...</p>
                    </div>
                )}
            </div>
            {children}
        </div>
    );
};

export default GuitarTabContainer;
