import { useRef, useEffect } from "react";
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from "use-places-autocomplete";
import { MapPin, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LocationAutocompleteProps {
    placeholder?: string;
    onSelect: (data: { address: string; lat: number; lng: number }) => void;
    defaultValue?: string;
    className?: string;
    error?: string;
}

const LocationAutocomplete = ({
    placeholder = "Search for a location...",
    onSelect,
    defaultValue = "",
    className = "",
    error,
}: LocationAutocompleteProps) => {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            /* Define search scope here */
        },
        debounce: 300,
        defaultValue,
    });

    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                clearSuggestions();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [clearSuggestions]);

    // Update internal value if defaultValue changes externally
    useEffect(() => {
        if (defaultValue) {
            setValue(defaultValue, false);
        }
    }, [defaultValue, setValue]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const handleSelect = ({ description }: { description: string }) => () => {
        setValue(description, false);
        clearSuggestions();

        getGeocode({ address: description }).then((results) => {
            const { lat, lng } = getLatLng(results[0]);
            onSelect({ address: description, lat, lng });
        });
    };

    const handleClear = () => {
        setValue("");
        clearSuggestions();
    };

    return (
        <div ref={wrapperRef} className={`relative w-full ${className}`}>
            <div className="relative flex items-center">
                <MapPin className="absolute left-3 text-gray-400" size={18} />
                <input
                    value={value}
                    onChange={handleInput}
                    disabled={!ready}
                    placeholder={placeholder}
                    className={`w-full pl-10 pr-10 py-3 bg-white/5 border rounded-xl focus:ring-2 transition-all outline-none text-white placeholder-gray-500 ${error ? "border-red-500 ring-red-500/20" : "border-white/10 focus:ring-yellow-500/20 focus:border-yellow-500/50"
                        }`}
                />
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {status === "OK" && (
                    <motion.ul
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-[100] w-full mt-2 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto backdrop-blur-xl"
                    >
                        {data.map((suggestion) => {
                            const {
                                place_id,
                                structured_formatting: { main_text, secondary_text },
                            } = suggestion;

                            return (
                                <li
                                    key={place_id}
                                    onClick={handleSelect(suggestion)}
                                    className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-b-0 group"
                                >
                                    <div className="flex items-start gap-3">
                                        <MapPin className="text-yellow-500 mt-1 shrink-0 group-hover:scale-110 transition-transform" size={16} />
                                        <div>
                                            <strong className="text-white text-sm block">{main_text}</strong>
                                            <small className="text-gray-400 text-xs">{secondary_text}</small>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </motion.ul>
                )}
            </AnimatePresence>
            {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
        </div>
    );
};

export default LocationAutocomplete;
