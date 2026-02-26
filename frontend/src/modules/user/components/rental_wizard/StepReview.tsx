import { useFormContext } from 'react-hook-form';
import { CheckCircle, MapPin, Calendar, Shield, Tag, FileText } from 'lucide-react';

export function StepReview({ previewImage }: { previewImage?: string }) {
    const { getValues } = useFormContext();
    const data = getValues();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <CheckCircle className="text-green-600" />
                    Review Listing
                </h2>
                <p className="text-gray-500 text-sm mt-1 ml-9">Double check your details before publishing.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex gap-6 items-start bg-gray-50/50">
                    {previewImage ? (
                        <img src={previewImage} alt="Main" className="w-32 h-32 rounded-lg object-cover shadow-md border border-gray-200" />
                    ) : (
                        <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                            No Image
                        </div>
                    )}
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-xl text-gray-900 leading-tight">{data.name}</h3>
                            <span className="px-3 py-1 bg-[#1E5631] text-white text-xs font-bold rounded-full uppercase tracking-wide">
                                {data.category}
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm mt-2 flex items-center gap-2">
                            <Tag size={14} /> {data.condition} Condition
                        </p>
                        <div className="mt-4 flex items-end gap-1">
                            <span className="text-3xl font-bold text-[#1E5631]">${data.pricePerDay}</span>
                            <span className="text-gray-500 font-medium mb-1.5">/ day</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div className="space-y-1">
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                            <MapPin size={12} /> Location
                        </span>
                        <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            {data.pickupLocation}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                            <Calendar size={12} /> Max Period
                        </span>
                        <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            {data.maxRentalPeriod} Days
                        </p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                            <Tag size={12} /> Quantity
                        </span>
                        <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            {data.stock} Available
                        </p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                            <Shield size={12} /> Security Deposit
                        </span>
                        <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            ${data.securityDeposit}
                        </p>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100">
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <FileText size={12} /> Description
                    </span>
                    <p className="text-gray-700 text-sm leading-relaxed p-4 bg-gray-50 rounded-lg border border-gray-100 italic">
                        "{data.description}"
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-100">
                <Shield className="shrink-0 text-yellow-600" size={20} />
                <p className="opacity-90">
                    By publishing this listing, you agree to our terms of service. Your item will be reviewed by an admin within 24 hours before going live.
                </p>
            </div>
        </div>
    );
}
