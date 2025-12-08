import apiClient from "../../../services/apiClient";
import { useMutation } from "@tanstack/react-query";
import type { IPhotographerApplicationResponse, IPhotographerApplicationForm } from "../types/application.types"

export const useApply = () => {
    return useMutation({
        mutationFn: async (data: IPhotographerApplicationForm) => {
            const formData = new FormData();

            formData.append('name', data.name);
            formData.append('email', data.email);
            formData.append('phone', data.phone);
            formData.append('location', data.location);

            formData.append('yearsExperience', data.yearsExperience);
            formData.append('priceRange', data.priceRange);
            formData.append('availability', data.availability);

            data.specialties.forEach(specialty => {
                formData.append('specialties[]', specialty);
            });

            formData.append('portfolioWebsite', data.portfolioWebsite || '');
            formData.append('instagramHandle', data.instagramHandle || '');
            formData.append('personalWebsite', data.personalWebsite || '');

            formData.append('businessName', data.businessName);
            formData.append('professionalTitle', data.professionalTitle);
            formData.append('businessBio', data.businessBio);

            if (data.portfolioImages) {
                Array.from(data.portfolioImages).forEach((file) => {
                    formData.append('portfolioImages', file);
                });
            }

            const res = await apiClient.post<IPhotographerApplicationResponse>(
                "/photographer/apply",
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );
            console.log(res)
            return res.data;
        }
    })
}