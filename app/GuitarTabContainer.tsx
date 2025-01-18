import {FC, ReactNode} from "react";

interface GuitarTabContainerProps {
    isLoaded: boolean;
    children: ReactNode;
}

const GuitarTabContainer: FC<GuitarTabContainerProps> = ({isLoaded, children}) => {
    return (
        <div className="w-full p-5">
            <div className="mb-6">
                <h2 className="text-3xl font-semibold text-gray-800 tracking-wide leading-tight border-b-2 border-gray-300 pb-2 mb-4">Acoustic Guitar Tab Editor</h2>
                {!isLoaded && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <h3 className="text-sm font-medium text-blue-800">Loading</h3>
                        <p className="text-sm text-blue-700">Loading guitar samples...</p>
                    </div>
                )}
            </div>
            {children}
        </div>
    );
};

export default GuitarTabContainer;
