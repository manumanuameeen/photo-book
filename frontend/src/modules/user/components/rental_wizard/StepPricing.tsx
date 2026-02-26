import { useFormContext } from 'react-hook-form';
import { DollarSign, Calendar, Shield, AlertCircle, Package } from 'lucide-react';
import type { RentItemFormData } from '../../../../types/rental';

export function StepPricing() {
    const { register, formState: { errors } } = useFormContext<RentItemFormData>();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <DollarSign className="text-green-600" />
                    Pricing & Terms
                </h2>
                <p className="text-gray-500 text-sm mt-1 ml-9">Set competitive rates to attract more renters.</p>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                            <DollarSign size={16} className="text-gray-400" />
                            Daily Rental Rate <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-green-600">$</span>
                            <input
                                {...register('pricePerDay', { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all font-mono"
                                placeholder="0.00"
                            />
                        </div>
                        {errors.pricePerDay && (
                            <span className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">{errors.pricePerDay.message as string}</span>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                            <Shield size={16} className="text-gray-400" />
                            Security Deposit <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-green-600">$</span>
                            <input
                                {...register('securityDeposit', { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all font-mono"
                                placeholder="0.00"
                            />
                        </div>
                        {errors.securityDeposit && (
                            <span className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">{errors.securityDeposit.message as string}</span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
                            <Calendar size={16} className="text-gray-400" />
                            Max Rental Period <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {[3, 5, 7, 14].map((days) => (
                                <label key={days} className="cursor-pointer relative group">
                                    <input
                                        type="radio"
                                        value={days}
                                        {...register('maxRentalPeriod', { valueAsNumber: true })}
                                        className="peer hidden"
                                    />
                                    <div className="border border-gray-200 peer-checked:bg-[#1E5631]/5 peer-checked:border-[#1E5631] peer-checked:text-[#1E5631] py-3 rounded-xl text-center text-sm font-semibold hover:border-gray-300 transition-all flex flex-col items-center justify-center gap-1 shadow-sm peer-checked:shadow-md">
                                        <span className="text-base">{days}</span>
                                        <span className="text-[10px] uppercase tracking-wider opacity-70">Days</span>
                                    </div>
                                    <div className="absolute top-1 right-1 opacity-0 peer-checked:opacity-100 transition-opacity text-[#1E5631]">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    </div>
                                </label>
                            ))}
                        </div>
                        {errors.maxRentalPeriod && (
                            <span className="text-red-500 text-xs mt-2 block font-medium">{errors.maxRentalPeriod.message as string}</span>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                            <Package size={16} className="text-gray-400" />
                            Quantity Available <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <input
                                {...register('stock', { valueAsNumber: true })}
                                type="number"
                                min="1"
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all font-mono"
                                placeholder="1"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">How many identical items do you have?</p>
                        {errors.stock && (
                            <span className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">{errors.stock.message as string}</span>
                        )}
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-blue-800 text-sm">
                    <AlertCircle className="shrink-0" size={20} />
                    <p>
                        We recommend setting a security deposit of at least 20% of the items value to cover potential damages.
                        Platform fees of 10% apply to the daily rate.
                    </p>
                </div>
            </div>
        </div>
    );
}
