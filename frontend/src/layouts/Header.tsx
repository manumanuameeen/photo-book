import React from "react";

const Colors = {
    darkGreen: "#006039",
};

const Footer: React.FC = () => {
    return (
        <footer 
            className="text-white py-6 px-6 md:px-12"
            style={{ backgroundColor: Colors.darkGreen }}
        >
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="text-center md:text-left">
                        <p className="text-sm">
                            © 2024 PhotoBook, Inc. All rights reserved.
                        </p>
                    </div>
                    
                    <div className="flex space-x-6 text-sm">
                        <a href="#home" className="hover:text-gray-300 transition">
                            Home
                        </a>
                        <a href="#photographers" className="hover:text-gray-300 transition">
                            Photographers
                        </a>
                        <a href="#categories" className="hover:text-gray-300 transition">
                            Categories
                        </a>
                        <a href="#about" className="hover:text-gray-300 transition">
                            About
                        </a>
                    </div>
                    
                    <div className="text-center md:text-right">
                        <form className="flex items-center space-x-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="px-3 py-1 text-sm rounded text-gray-900"
                            />
                            <button
                                type="submit"
                                className="px-4 py-1 text-sm font-semibold rounded bg-yellow-500 text-green-900 hover:bg-yellow-600 transition"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;