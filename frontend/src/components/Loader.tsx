interface LoaderProps {
    text?: string;
    fullscreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ text = "Loading...", fullscreen = true }) => {
    const containerClass = fullscreen
        ? "flex items-center justify-center min-h-screen bg-gray-100"
        : "flex items-center justify-center p-6";

    return (
        <div className={containerClass}>
            <div className="flex flex-col items-center justify-center space-y-8">


                <div className="relative">
                    <div className="w-32 h-32 border-8 border-green-950 rounded-lg relative overflow-hidden">

                        <div className="absolute inset-0">
                            <div className="absolute top-3 left-3 w-8 h-8 border-l-4 border-t-4 border-green-700"></div>
                            <div className="absolute top-3 right-3 w-8 h-8 border-r-4 border-t-4 border-green-700"></div>
                            <div className="absolute bottom-3 left-3 w-8 h-8 border-l-4 border-b-4 border-green-700"></div>
                            <div className="absolute bottom-3 right-3 w-8 h-8 border-r-4 border-b-4 border-green-700"></div>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                <div className="absolute inset-0 w-3 h-3 bg-green-600 rounded-full animate-ping"></div>
                            </div>
                        </div>

                        <div className="absolute inset-0 bg-green-500 opacity-0 animate-flash rounded-lg"></div>
                    </div>
                </div>

                <p className="text-green-950 font-semibold text-lg tracking-wider">
                    {text || "Loading..."}
                </p>
            </div>
        </div>
    );
};


export default Loader