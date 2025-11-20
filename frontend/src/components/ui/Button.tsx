import type React from "react";

export interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export interface InputProps{
    type?:string;
    placeholder?:string;
    error?:string;
    icon?:React.ReactNode;
}