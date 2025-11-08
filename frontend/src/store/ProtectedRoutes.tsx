import React, { type JSX } from "react";
import { Navigate, } from "react-router-dom";
import { useAuthStore } from "../modules/auth/store/useAuthStore";

export const ProtectedRoute:React.FC<{children:JSX.Element}>=({children})=>{
 const user = useAuthStore((s)=>s.user);
 if(!user)return <Navigate to={"/login"} replace />
 return children
}