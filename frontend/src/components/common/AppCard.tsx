import {type ReactNode } from "react";
import { MotionWrapper } from "./MotionWrapper";


export interface AppCardProps {
    children: ReactNode;
    className?: string
}

export const AppCard = ({ children, className }: AppCardProps) => {
    return (
        <MotionWrapper className={`bg-white rounded-2xl shadow-md p-6 border border-gray-100 ${className}`}>
            {children}
        </MotionWrapper>
    );
};