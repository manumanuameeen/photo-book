import React from 'react';
import { useApplicationStore } from "../../store/useApplicationStore";
import { FormInput } from "../../../../components/common/FormInput";
import { toast } from 'sonner';

const BusinessBioStep = () => {
    const { formData, updateFormData, setStep } = useApplicationStore();

    const [localData, setLocalData] = React.useState({
        businessName: formData.businessName || "",
        professionalTitle: formData.professionalTitle || "",
        businessBio: formData.businessBio || "", 
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setLocalData({
            ...localData,
            [e.target.name]: e.target.value,
        });
    };

    const isFormValid = localData.businessBio.length >= 50 && 
                       localData.businessName && 
                       localData.professionalTitle;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid) {
            toast.error("Please provide a business bio of at least 50 characters, business name, and your title");
            return;
        }

        updateFormData(localData);
        setStep(5);
    }

    return (
        <form onSubmit={handleSubmit}>
            <h3 className="text-xl font-medium text-green-700 mb-6">Business Bio & Final Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <FormInput
                    label="Business Name"
                    name="businessName"  
                    placeholder="Your Photography Business"
                    value={localData.businessName}
                    onChange={handleChange}
                />
                <FormInput
                    label="Professional Title"
                    name="professionalTitle" 
                    placeholder="Wedding Photographer, Portrait Artist, etc."
                    value={localData.professionalTitle}
                    onChange={handleChange}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">
                <FormInput
                    label="Business Biography (Min 50 characters)"
                    name="businessBio"
                    placeholder="Tell us about your style, your mission, and what sets your photography apart..."
                    value={localData.businessBio}
                    onChange={handleChange}
                    isTextArea={true}
                    error={localData.businessBio.length < 50 && localData.businessBio.length > 0 ? 
                           `Bio must be at least 50 characters (Currently: ${localData.businessBio.length})` : undefined}
                />
            </div>

            <div className="flex justify-between mt-10 border-t pt-5">
                <button 
                    type="button" 
                    onClick={() => setStep(3)}
                >
                    Previous
                </button>
                <button 
                    type="submit" 
                    disabled={!isFormValid}
                >
                    Review Application
                </button>
            </div>
        </form>
    );
}

export default BusinessBioStep;