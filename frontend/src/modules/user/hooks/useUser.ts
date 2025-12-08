import apiClient from "../../../services/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type IChangePassword, type IProfileResponse, type IUpdateProfile,type IPasswordResponse } from "../types/profile.types";




export const useProfile = () => {
    return useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const res = await apiClient.get<IProfileResponse>("/user/profile");
            console.log("data getting from bakcned properly",res.data.data)
            return res.data.data
        }
    })
}

export const useUpdateProfile=()=>{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn:async(data:IUpdateProfile)=>{
            const res = await apiClient.post<IProfileResponse>("/user/update-profile",data);
            return res.data
        },
        onSuccess:()=>queryClient.invalidateQueries({queryKey:["profile"],exact:false})
    })
}

export const useChangePassword=()=>{
    return useMutation({
        mutationFn:async(data:IChangePassword)=>{
            const res = await apiClient.post<IPasswordResponse>("/user/change-password",data);
            console.log("change passwrod useUser.ts",res)
            return res.data
        }
    })
}





