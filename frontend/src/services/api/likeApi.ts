import apiClient from "../apiClient";
import { API_ROUTES } from "../../constants/apiRoutes";

export type LikeTargetType = 'photographer' | 'package' | 'portfolio' | 'rental';

export const likeApi = {
    toggleLike: async (targetId: string, type: LikeTargetType) => {
        let endpoint = "";
        switch (type) {
            case 'photographer':
                endpoint = API_ROUTES.LIKE.PHOTOGRAPHER(targetId);
                break;
            case 'package':
                endpoint = API_ROUTES.LIKE.PACKAGE(targetId);
                break;
            case 'portfolio':
                endpoint = API_ROUTES.LIKE.PORTFOLIO(targetId);
                break;
            case 'rental':
                endpoint = API_ROUTES.LIKE.RENTAL(targetId);
                break;
        }
        const response = await apiClient.patch(endpoint);
        return response.data.data;
    }
};
