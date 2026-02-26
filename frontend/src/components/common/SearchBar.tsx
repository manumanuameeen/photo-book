import React, { useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = "Search..." }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
            <Search className="w-4 h-4 text-gray-400" />
            <input
                ref={inputRef}
                type="text"
                className="bg-transparent outline-none text-sm text-gray-600 w-64"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

export default SearchBar;
