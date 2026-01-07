import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { Search, MapPin, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { toast } from "sonner";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapLocationPickerProps {
    label: string;
    initialLat?: number;
    initialLng?: number;
    onLocationSelect: (data: { address: string; lat: number; lng: number }) => void;
}

interface SearchResult {
    display_name: string;
    lat: string;
    lon: string;
}

function LocationMarker({
    position,
    onMapClick
}: {
    position: [number, number] | null;
    onMapClick: (lat: number, lng: number) => void;
}) {
    const map = useMap();

    useEffect(() => {
        const handleClick = (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            onMapClick(lat, lng);
        };

        map.on('click', handleClick);
        return () => {
            map.off('click', handleClick);
        };
    }, [map, onMapClick]);

    return position ? <Marker position={position} /> : null;
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);

    return null;
}

export const SmallLocationPicker = ({
    label,
    initialLat = 20.5937,
    initialLng = 78.9629,
    onLocationSelect,
}: MapLocationPickerProps) => {
    const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
    const [address, setAddress] = useState("Click on the map or search for a location");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            );
            const data = await res.json();
            const fullAddress = data.display_name || "Unknown location";
            return fullAddress;
        } catch (err) {
            console.error("Reverse geocoding error:", err);
            return "Location selected (address unavailable)";
        }
    };

    const handleMapClick = async (lat: number, lng: number) => {
        setPosition([lat, lng]);
        const fullAddress = await reverseGeocode(lat, lng);
        setAddress(fullAddress);
        setSearchQuery(fullAddress);
        onLocationSelect({ address: fullAddress, lat, lng });
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition([latitude, longitude]);
                const fullAddress = await reverseGeocode(latitude, longitude);
                setAddress(fullAddress);
                setSearchQuery(fullAddress);
                onLocationSelect({ address: fullAddress, lat: latitude, lng: longitude });
                setIsLocating(false);
            },
            (err) => {
                console.error("Geolocation error:", err);
                toast.error("Unable to retrieve your location. Please check browser permissions.");
                setIsLocating(false);
            }
        );
    };

    const searchLocation = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
            );
            const data = await res.json();
            setSearchResults(data);
            setShowResults(true);
        } catch (err) {
            console.error("Search error:", err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout for search
        searchTimeoutRef.current = setTimeout(() => {
            searchLocation(value);
        }, 500);
    };

    const handleSelectResult = async (result: SearchResult) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        setPosition([lat, lng]);
        setAddress(result.display_name);
        setSearchQuery(result.display_name);
        setShowResults(false);

        onLocationSelect({
            address: result.display_name,
            lat,
            lng,
        });
    };

    useEffect(() => {
        const handleClickOutside = () => setShowResults(false);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700">{label}</label>
                <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="text-xs flex items-center gap-1.5 text-green-600 font-medium hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                    {isLocating ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
                    Use Current Location
                </button>
            </div>

            {/* Search Input */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
                <div className="relative flex items-center">
                    <Search className="absolute left-3 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={(e) => e.key === 'Enter' && searchLocation(searchQuery)}
                        onFocus={() => searchResults.length > 0 && setShowResults(true)}
                        placeholder="Search for a location..."
                        className="w-full pl-10 pr-24 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                    <button
                        type="button"
                        onClick={() => searchLocation(searchQuery)}
                        disabled={isSearching}
                        className="absolute right-2 bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-800 transition-colors disabled:opacity-70 flex items-center gap-2"
                    >
                        {isSearching ? <Loader2 size={12} className="animate-spin" /> : "Search"}
                    </button>
                </div>

                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && (
                    <div className="absolute z-[1000] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                        {searchResults.map((result, index) => (
                            <button
                                key={index}
                                onClick={() => handleSelectResult(result)}
                                className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-start gap-3"
                            >
                                <MapPin className="text-green-600 mt-1 flex-shrink-0" size={18} />
                                <span className="text-sm text-gray-700">{result.display_name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Map Container - Reduced height from h-80/h-96 to h-64 for better layout */}
            <div className="h-64 rounded-xl overflow-hidden shadow-2xl border border-gray-200">
                <MapContainer
                    center={position}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    <LocationMarker position={position} onMapClick={handleMapClick} />
                    <MapUpdater center={position} />
                </MapContainer>
            </div>


            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-green-200 shadow-sm mt-2">
                <p className="text-xs font-semibold text-green-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <MapPin size={14} /> Selected Location
                </p>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-800 leading-relaxed">
                        {address}
                    </p>
                    {position && (
                        <p className="text-[10px] text-gray-500 font-mono">
                            {position[0].toFixed(6)}, {position[1].toFixed(6)}
                        </p>
                    )}
                </div>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500 italic">
                💡 Tip: Search for a location or click directly on the map to set your position
            </p>
        </div>
    );
};