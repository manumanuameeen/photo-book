import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { IPhotographerApplicationForm } from "../types/application.types";

interface ApplicationState {
    formData: Partial<IPhotographerApplicationForm>;
    currentStep: number;
    applicationStatus: 'none' | 'pending' | 'approved' | 'rejected';
    setStep: (step: number) => void;
    updateFormData: (data: Partial<IPhotographerApplicationForm>) => void;
    setApplicationStatus: (status: 'none' | 'pending' | 'approved' | 'rejected') => void;
    resetForm: () => void;
    resetFormDataOnly: () => void;
}

const initialFormState: Partial<IPhotographerApplicationForm> = {
    name: '',
    email: '',
    phone: '',
    location: '',
    yearsExperience: '',
    specialties: [],
    priceRange: '',
    availability: '',
    portfolioWebsite: '',
    instagramHandle: '',
    personalWebsite: '',
    portfolioImages: [],
    businessName: '',
    professionalTitle: '',
    businessBio: '',
};

export const useApplicationStore = create<ApplicationState>()(
    persist(
        (set) => ({
            formData: initialFormState,
            currentStep: 1,
            applicationStatus: 'none',

            setStep: (step: number) => set({ currentStep: step }),

            updateFormData: (data) => set((state) => ({
                formData: {
                    ...state.formData,
                    ...data,
                }
            })),

            setApplicationStatus: (status) => set({ applicationStatus: status }),

            resetForm: () => set({
                formData: initialFormState,
                currentStep: 1,
            }),

            resetFormDataOnly: () => set({
                formData: initialFormState
            }),
        }),
        {
            name: "photographer-application-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => {
                const { portfolioImages, ...restFormData } = state.formData;
                console.log("Excluding portfolioImages from localStorage, count:", portfolioImages?.length || 0);
                
                return {
                    currentStep: state.currentStep,
                    applicationStatus: state.applicationStatus,
                    formData: restFormData,
                }
            },
            merge: (persistedState: any, currentState: ApplicationState) => {
                return {
                    ...currentState,
                    ...persistedState,
                    formData: {
                        ...currentState.formData,
                        ...persistedState.formData,
                        portfolioImages: currentState.formData.portfolioImages || [],
                    }
                }
            }
        }
    )
);