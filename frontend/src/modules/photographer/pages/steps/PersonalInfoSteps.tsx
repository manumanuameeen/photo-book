import React from "react";
import { motion } from "framer-motion";
import { useApplicationStore } from "../../store/useApplicationStore";
import { FormInput } from "../../../../components/common/FormInput";
import { type ChangeEvent } from "react";

const PersonalInfoStep = () => {
    const { formData, updateFormData, setStep } = useApplicationStore();

    const [localData, setLocalData] = React.useState({
        name: formData.name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        location: formData.location || '',
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setLocalData({
            ...localData,
            [e.target.name]: e.target.value,
        });
    };

    const isFormValid = localData.name && localData.email && localData.phone && localData.location;

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        updateFormData(localData);
        setStep(2);
    };

    const inputVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.4,
            },
        }),
    };

    return (
        <form onSubmit={handleNext}>
            <motion.h3
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-green-700 mb-6"
            >
                Personal Information
            </motion.h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    variants={inputVariants}
                >
                    <FormInput
                        label="Full Name"
                        name="name"
                        placeholder="John Smith"
                        value={localData.name}
                        onChange={handleChange}
                    />
                </motion.div>
                
                <motion.div
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    variants={inputVariants}
                >
                    <FormInput
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="john.smith@example.com"
                        value={localData.email}
                        onChange={handleChange}
                    />
                </motion.div>
                
                <motion.div
                    custom={2}
                    initial="hidden"
                    animate="visible"
                    variants={inputVariants}
                >
                    <FormInput
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        placeholder="999-999-9999"
                        value={localData.phone}
                        onChange={handleChange}
                    />
                </motion.div>
                
                <motion.div
                    custom={3}
                    initial="hidden"
                    animate="visible"
                    variants={inputVariants}
                >
                    <FormInput
                        label="Location (City, State/Country)"
                        name="location"
                        placeholder="New York, NY"
                        value={localData.location}
                        onChange={handleChange}
                    />
                </motion.div>
            </div>
            
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-end mt-10 pt-5 border-t border-gray-200"
            >
                <motion.button
                    type="submit"
                    disabled={!isFormValid}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next Step →
                </motion.button>
            </motion.div>
        </form>
    );
};

export default PersonalInfoStep;