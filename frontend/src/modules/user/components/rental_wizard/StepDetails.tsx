import { useFormContext } from 'react-hook-form';
import { AlertCircle, Camera, Tag, MapPin, AlignLeft, Info } from 'lucide-react';
import LocationAutocomplete from '../../../../components/common/LocationAutocomplete';
import type { RentItemFormData } from '../../../../types/rental';

export function StepDetails() {
    const { register, formState: { errors }, setValue, watch } = useFormContext<RentItemFormData>();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Info className="text-green-600" />
                    Item Details
                </h2>
                <p className="text-gray-500 text-sm mt-1 ml-9">Provide accurate details to help renters find your gear.</p>
            </div>

            <div className="space-y-5">
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <Camera size={16} className="text-gray-400" />
                        Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('name')}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                        placeholder="e.g. Sony A7 IV with 24-70mm GM Lens"
                    />
                    {errors.name && (
                        <span className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5 font-medium animate-pulse">
                            <AlertCircle size={12} /> {errors.name.message as string}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                            <Tag size={16} className="text-gray-400" />
                            Category <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                {...register('category')}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none appearance-none bg-white"
                            >
                                <option value="">Select Category</option>
                                <option value="Cameras">Cameras</option>
                                <option value="Lenses">Lenses</option>
                                <option value="Lighting">Lighting</option>
                                <option value="Drones">Drones</option>
                                <option value="Audio">Audio</option>
                                <option value="Tripods & Supports">Tripods & Supports</option>
                                <option value="Bags & Cases">Bags & Cases</option>
                                <option value="Studio Gear">Studio Gear</option>
                                <option value="Computers & Monitors">Computers & Monitors</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Others">Others</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                        {errors.category && <span className="text-red-500 text-xs mt-1.5 block font-medium">{errors.category.message as string}</span>}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                            <Info size={16} className="text-gray-400" />
                            Condition <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                {...register('condition')}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none appearance-none bg-white"
                            >
                                <option value="Excellent">Excellent - Like new</option>
                                <option value="Good">Good - Minor wear</option>
                                <option value="Fair">Fair - Visible wear</option>
                                <option value="Poor">Poor - Functional issues</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <MapPin size={16} className="text-gray-400" />
                        Pickup Location <span className="text-red-500">*</span>
                    </label>
                    <LocationAutocomplete
                        defaultValue={watch('pickupLocation')}
                        onSelect={(address) => setValue('pickupLocation', address.address, { shouldValidate: true })}
                        className="w-full"
                    />

                    <input type="hidden" {...register('pickupLocation')} />

                    {errors.pickupLocation && <span className="text-red-500 text-xs mt-1.5 block font-medium">{errors.pickupLocation.message as string}</span>}
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <AlignLeft size={16} className="text-gray-400" />
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        {...register('description')}
                        rows={5}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none resize-none transition-all placeholder:text-gray-300"
                        placeholder="Describe the condition, included accessories, and any notable features..."
                    />
                    {errors.description && <span className="text-red-500 text-xs mt-1.5 block font-medium">{errors.description.message as string}</span>}
                </div>
            </div>
        </div>
    );
}
