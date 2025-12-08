import React from 'react';
import { useApplicationStore } from "../../store/useApplicationStore";
import { FormInput } from "../../../../components/common/FormInput";
import { type ChangeEvent } from "react"; 


const ALL_SPECIALTIES = [
    'Wedding Photography', 'Portrait Photography', 'Event Photography',
    'Commercial Photography', 'Fashion Photography', 'Food Photography',
    'Travel Photography', 'Nature Photography', 'Documentary Photography',
    'Sports Photography', 'Real Estate Photography', 'Studio Photography',
];


const ProfessionalDetailsStep = () => {
    const { formData, updateFormData, setStep } = useApplicationStore();

    const [localData, setLocalData] = React.useState({
        yearsExperience: formData.yearsExperience || '',
        specialties: formData.specialties || [],
        priceRange: formData.priceRange || '',
        availability: formData.availability || '',
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setLocalData({
            ...localData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSpecialtyChange = (specialty: string) => {
        setLocalData(prev => {
            const currentSpecs = prev.specialties;
            if (currentSpecs.includes(specialty)) {
                return {
                    ...prev,
                    specialties: currentSpecs.filter(s => s !== specialty)
                };
            } else {
                return {
                    ...prev,
                    specialties: [...currentSpecs, specialty]
                };
            }
        });
    };

    const isFormValid = localData.yearsExperience && localData.priceRange && localData.availability && localData.specialties.length > 0;

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid) {
            alert("Please select your experience, price range, availability, and at least one specialty.");
            return;
        }

        updateFormData(localData);
        setStep(3);
    };

    return (
        <form onSubmit={handleNext}>
            <h3 className="text-xl font-medium text-green-700 mb-6">Professional Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <FormInput
                    label="Years of Experience"
                    name="yearsExperience"
                    selectOptions={['0-2 years', '3-5 years', '6-10 years', '10+ years']}
                    value={localData.yearsExperience}
                    onChange={handleChange}
                    isSelect={true}
                />

                <FormInput
                    label="Price Range per shoot (USD)"
                    name="priceRange"
                    selectOptions={['$100-$500', '$500-$1000', '$1000-$3000', '$3000+']}
                    value={localData.priceRange}
                    onChange={handleChange}
                    isSelect={true}
                />

                <FormInput
                    label="Availability"
                    name="availability"
                    selectOptions={['Weekdays Only', 'Weekends Only', 'Anytime', 'Specific Days']}
                    value={localData.availability}
                    onChange={handleChange}
                    isSelect={true}
                />
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                    Photographer Specialties (Select all that apply)
                    {localData.specialties.length === 0 && (
                        <span className="text-red-500 ml-2 text-xs">(Required)</span>
                    )}
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6">
                    {ALL_SPECIALTIES.map((specialty) => (
                        <div key={specialty} className="flex items-center">
                            <input
                                id={specialty.replace(/\s/g, '-').toLowerCase()}
                                type="checkbox"
                                value={specialty}
                                checked={localData.specialties.includes(specialty)}
                                onChange={() => handleSpecialtyChange(specialty)}
                                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <label
                                htmlFor={specialty.replace(/\s/g, '-').toLowerCase()}
                                className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
                            >
                                {specialty}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between mt-10 border-t pt-5">
                <button
                    type="button"
                    color="secondary"
                    onClick={() => setStep(1)}
                >
                    Previous
                </button>
                <button
                    type="submit"
                    disabled={!isFormValid}
                >
                    Next Step
                </button>
            </div>
        </form>
    );
};

export default ProfessionalDetailsStep;