import React from 'react';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Camera,
    CreditCard,
    DollarSign,
    Instagram,
    Globe,
    Facebook,
    Linkedin,
    User,
    Pencil
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { ROUTES } from '../../../constants/routes';

const PhotographerProfile = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

            {/* --- Top Navigation Bar --- */}
            <div className="bg-[#1E5631] h-16 w-full shadow-sm"></div>

            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* --- Breadcrumb & Header --- */}
                <div className="mb-8">
                    <Link to={ROUTES.PHOTOGRAPHER.DASHBOARD} className="flex items-center text-sm text-green-700 font-medium hover:underline mb-4">
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Dashboard
                    </Link>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-900">My Account Information</h1>
                        <button className="flex items-center gap-2 bg-[#1E5631] text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-[#164024] transition-colors">
                            <Pencil size={16} />
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* --- Main Grid Content --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* === LEFT COLUMN === */}
                    <div className="space-y-6">

                        {/* Personal Identity Card */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-700 mb-6">Personal Identity</h2>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                    {/* Placeholder for Avatar if image is missing */}
                                    <User size={48} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Sarah Elizabeth Johnson</h3>
                                <p className="text-sm text-gray-400 mt-1">Member since March 2023</p>
                            </div>
                        </div>

                        {/* Contact Details Card */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-700 mb-6">Contact Details</h2>
                            <div className="space-y-5">
                                <InfoField
                                    label="Email Address"
                                    value="sarah.johnson@email.com"
                                    icon={Mail}
                                />
                                <InfoField
                                    label="Phone Number"
                                    value="+1 (555) 123-4567"
                                    icon={Phone}
                                />
                                <InfoField
                                    label="Base Location"
                                    value="Austin, Texas"
                                    icon={MapPin}
                                />
                            </div>
                        </div>
                    </div>

                    {/* === RIGHT COLUMN === */}
                    <div className="space-y-6">

                        {/* Business & Platform Information */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-700 mb-6">Business & Platform Information</h2>
                            <div className="space-y-5">
                                <InfoField
                                    label="Business/Studio Name"
                                    value="Sarah Johnson Photography LLC"
                                    icon={Briefcase}
                                />
                                <InfoField
                                    label="Main Genre"
                                    value="Wedding & Portrait Photography"
                                    icon={Camera}
                                />
                                <InfoField
                                    label="Payment Account"
                                    value="Bank Account ending in ****-4321"
                                    icon={CreditCard}
                                />
                                <InfoField
                                    label="Standard Public Rate"
                                    value="$150/Hour"
                                    icon={DollarSign}
                                />
                            </div>
                        </div>

                        {/* Social Media Links */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-700 mb-6">Social Media Links</h2>
                            <div className="space-y-5">
                                <InfoField
                                    label="Instagram Handle"
                                    value="@sarahjohnsonphoto"
                                    icon={Instagram}
                                    isLink
                                />
                                <InfoField
                                    label="External Website"
                                    value="www.sarahjohnsonphotography.com"
                                    icon={Globe}
                                    isLink
                                />
                                <InfoField
                                    label="Facebook Page"
                                    value="Sarah Johnson Photography"
                                    icon={Facebook}
                                    isLink
                                />
                                <InfoField
                                    label="LinkedIn Profile"
                                    value="Sarah Johnson"
                                    icon={Linkedin}
                                    isLink
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// --- Helper Component for Fields ---
const InfoField = ({ label, value, icon: Icon, isLink = false }: { label: string, value: string, icon: any, isLink?: boolean }) => (
    <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">{label}</label>
        <div className={`
      flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-50
      ${isLink ? 'bg-green-50/50 text-green-700' : 'bg-gray-50 text-gray-800'}
    `}>
            <Icon size={18} className={isLink ? 'text-green-600' : 'text-gray-400'} />
            <span className={`text-sm font-medium ${isLink ? 'hover:underline cursor-pointer' : ''}`}>
                {value}
            </span>
        </div>
    </div>
);

export default PhotographerProfile;
