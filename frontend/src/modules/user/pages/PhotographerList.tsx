import React, { useState } from 'react';
import {
    Search,
    ChevronDown,
    Menu,
    Star,
    Filter
} from 'lucide-react';

const PhotographerSearch = () => {
    const [activeTab, setActiveTab] = useState('individual');

    const photographers = [
        {
            id: 1,
            name: "Sarah Johnson",
            image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop", // Wedding setup
            category: "Wedding & Portrait Photography",
            location: "New York, NY",
            rating: 4.9,
            reviews: 234,
            price: "$150/hour",
            photosCount: "450 photos",
            experience: "8 years",
            tags: ["Wedding", "Portrait", "Engagement"],
            available: true
        },
        {
            id: 2,
            name: "Michael Chen",
            image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop", // Event hall
            category: "Corporate & Events Photography",
            location: "Los Angeles, CA",
            rating: 4.7,
            reviews: 189,
            price: "$120/hour",
            photosCount: "320 photos",
            experience: "6 years",
            tags: ["Corporate", "Events", "Headshots"],
            available: true
        },
        {
            id: 3,
            name: "Emma Davis",
            image: "https://images.unsplash.com/photo-1470246973918-29a53221c197?q=80&w=800&auto=format&fit=crop", // Outdoors
            category: "Outdoor & Adventure Photography",
            location: "Denver, CO",
            rating: 4.8,
            reviews: 156,
            price: "$180/hour",
            photosCount: "280 photos",
            experience: "5 years",
            tags: ["Outdoor", "Adventure", "Nature"],
            available: true
        },
        {
            id: 4,
            name: "David Rodríguez",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop", // Portrait
            category: "Fashion & Editorial Photography",
            location: "Miami, FL",
            rating: 4.9,
            reviews: 298,
            price: "Unavailable",
            photosCount: "520 photos",
            experience: "10 years",
            tags: ["Fashion", "Editorial", "Studio"],
            available: false // Triggers the gray/disabled state
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800">

            <div className="bg-[#2E7D46] px-4 py-12 md:py-16 text-center shadow-md">
                <h1 className="text-3xl md:text-5xl text-white mb-3 font-serif italic tracking-wide">
                    Find <span className="text-white">Your Perfect</span> <span className="text-yellow-400">Photographer</span>
                </h1>
                <p className="text-green-100 text-sm md:text-base font-light max-w-2xl mx-auto">
                    Browse individual photographers and professional wedding teams for your special occasions
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-8 border border-gray-100">

                    <div className="flex flex-col lg:flex-row gap-4 mb-4">
                        <div className="flex-grow relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search photographers..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:w-auto">
                            <div className="relative">
                                <select className="w-full appearance-none bg-white border border-gray-200 px-4 py-2.5 pr-8 rounded-md text-sm text-gray-600 focus:outline-none focus:border-green-500 cursor-pointer">
                                    <option>All Categories</option>
                                    <option>Wedding</option>
                                    <option>Portrait</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                            <div className="relative">
                                <select className="w-full appearance-none bg-white border border-gray-200 px-4 py-2.5 pr-8 rounded-md text-sm text-gray-600 focus:outline-none focus:border-green-500 cursor-pointer">
                                    <option>All Prices</option>
                                    <option>$0 - $100/hr</option>
                                    <option>$100 - $200/hr</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                            <div className="relative">
                                <select className="w-full appearance-none bg-white border border-gray-200 px-4 py-2.5 pr-8 rounded-md text-sm text-gray-600 focus:outline-none focus:border-green-500 cursor-pointer">
                                    <option>All Locations</option>
                                    <option>New York</option>
                                    <option>Los Angeles</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>

                        <button className="bg-[#2E7D46] hover:bg-[#256639] text-white p-2.5 rounded-md flex items-center justify-center transition-colors">
                            <Menu size={20} />
                        </button>
                    </div>

                    <button className="flex items-center text-xs text-gray-500 hover:text-green-700 font-medium transition-colors">
                        More Filters <ChevronDown size={14} className="ml-1" />
                    </button>
                </div>

                <div className="border-b border-gray-200 mb-8 flex gap-8">
                    <button
                        onClick={() => setActiveTab('individual')}
                        className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'individual'
                                ? 'border-green-600 text-green-700'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Individual Photographers (4)
                    </button>
                    <button
                        onClick={() => setActiveTab('groups')}
                        className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'groups'
                                ? 'border-green-600 text-green-700'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Wedding Groups (3)
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {photographers.map((photographer) => (
                        <div key={photographer.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">

                            <div className="relative h-48 bg-gray-100">
                                <img
                                    src={photographer.image}
                                    alt={photographer.name}
                                    className={`w-full h-full object-cover ${!photographer.available ? 'grayscale opacity-80' : ''}`}
                                />
                                <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded shadow-sm ${photographer.available
                                        ? 'bg-yellow-400 text-gray-900'
                                        : 'bg-gray-600 text-white'
                                    }`}>
                                    {photographer.price}
                                </div>
                            </div>

                            <div className="p-4 flex-grow flex flex-col">
                                <div className="mb-2">
                                    <h3 className={`font-bold text-lg ${!photographer.available ? 'text-gray-500' : 'text-gray-900'}`}>
                                        {photographer.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 leading-tight mb-2">
                                        {photographer.category} / <br /> {photographer.location}
                                    </p>
                                </div>

                                <div className="flex items-center mb-3">
                                    <div className="flex text-yellow-400 mr-1.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} fill="currentColor" className={i >= Math.floor(photographer.rating) ? "text-gray-300 fill-gray-300" : ""} />
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-gray-700 mr-1">{photographer.rating}</span>
                                    <span className="text-xs text-gray-400">({photographer.reviews})</span>
                                </div>

                                <div className="flex gap-4 text-xs text-gray-500 mb-4 border-b border-gray-100 pb-3">
                                    <span>{photographer.photosCount}</span>
                                    <span>{photographer.experience}</span>
                                </div>

                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {photographer.tags.map((tag, i) => (
                                        <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                    <button
                                        disabled={!photographer.available}
                                        className={`text-xs font-bold py-2 rounded transition-colors ${photographer.available
                                                ? 'bg-[#2E7D46] text-white hover:bg-[#256639]'
                                                : 'bg-gray-400 text-white cursor-not-allowed'
                                            }`}
                                    >
                                        View Profile
                                    </button>
                                    <button
                                        disabled={!photographer.available}
                                        className={`text-xs font-bold py-2 rounded border transition-colors ${photographer.available
                                                ? 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                                : 'border-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PhotographerSearch;