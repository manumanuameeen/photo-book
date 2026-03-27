import React from 'react';
import { Camera, MapPin, Check, ExternalLink } from 'lucide-react';

export interface PhotographerData {
  _id: string;
  personalInfo: {
    name: string;
    location: string;
    profileImage?: string;
  };
  businessInfo: {
    businessName: string;
  };
  professionalDetails: {
    priceRange: string;
    specialties: string[];
  };
  portfolio?: {
    portfolioImages?: string[];
  };
}

export interface PackageData {
  _id: string;
  name: string;
  description: string;
  price?: number;
  baseprice: number;
  features: string[];
}

interface PhotographerListProps {
  photographers: PhotographerData[];
  onSelect: (photographer: PhotographerData) => void;
}

export const PhotographerList: React.FC<PhotographerListProps> = ({ photographers, onSelect }) => {
  return (
    <div className="grid grid-cols-1 gap-3 my-2">
      {photographers.map((p, idx) => (
        <div key={idx} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-all flex gap-3">
          <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
            {p.portfolio?.portfolioImages?.[0] ? (
              <img src={p.portfolio.portfolioImages[0]} alt={p.personalInfo.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Camera size={20} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 text-sm truncate">{p.businessInfo.businessName || p.personalInfo.name}</h4>
            <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
              <MapPin size={10} />
              <span>{p.personalInfo.location}</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs">
              <span className="text-indigo-600 font-medium">{p.professionalDetails.priceRange}</span>
            </div>
            <button 
              onClick={() => onSelect(p)}
              className="mt-2 w-full bg-indigo-50 text-indigo-600 py-1 rounded-lg text-[10px] font-bold hover:bg-indigo-100 transition-colors"
            >
              Select Photographer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

interface PackageListProps {
  packages: PackageData[];
  onSelect: (pkg: PackageData) => void;
}

export const PackageList: React.FC<PackageListProps> = ({ packages, onSelect }) => {
  return (
    <div className="space-y-3 my-2">
      {packages.map((pkg, idx) => (
        <div key={idx} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-bold text-gray-900 text-sm">{pkg.name}</h4>
              <p className="text-[10px] text-gray-500 line-clamp-2">{pkg.description}</p>
            </div>
            <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-lg text-xs">
              PKR {pkg.price || pkg.baseprice}
            </span>
          </div>
          <div className="space-y-1 mb-3">
            {pkg.features?.slice(0, 3).map((f: string, i: number) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-600">
                <Check size={10} className="text-green-500" />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => onSelect(pkg)}
            className="w-full bg-indigo-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
          >
            Select Package
          </button>
        </div>
      ))}
    </div>
  );
};

export const BookingConfirmation: React.FC<{ bookingId: string }> = ({ bookingId }) => {
  return (
    <div className="bg-green-50 border border-green-100 rounded-xl p-4 my-2 text-center">
      <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
        <Check size={20} />
      </div>
      <h4 className="font-bold text-green-900 text-sm">Booking Initiated!</h4>
      <p className="text-[10px] text-green-700 mt-1">Your booking reference is {bookingId}.</p>
      <button className="mt-3 flex items-center gap-1 mx-auto text-[10px] font-bold text-indigo-600 hover:text-indigo-700">
        View in Dashboard <ExternalLink size={10} />
      </button>
    </div>
  );
};
