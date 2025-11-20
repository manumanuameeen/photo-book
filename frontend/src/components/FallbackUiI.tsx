import React from "react";
import { AlertCircle, Camera, RefreshCw, WifiOff } from "lucide-react";
import { motion } from "framer-motion";

interface FallbackProps {
  type: "video" | "image" | "page" | "network" | "auth";
  message?: string;
  onRetry?: () => void;
}

const FallbackUI: React.FC<FallbackProps> = ({ type, message, onRetry }) => {
  const config = {
    video: {
      icon: <Camera className="w-12 h-12" />,
      title: "Video Unavailable",
      desc: message || "This video could not be loaded. Using fallback.",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    image: {
      icon: <AlertCircle className="w-12 h-12" />,
      title: "Image Failed",
      desc: message || "We couldn't load this image.",
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    page: {
      icon: <RefreshCw className="w-12 h-12 animate-spin" />,
      title: "Loading...",
      desc: "Please wait while we prepare your content.",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    network: {
      icon: <WifiOff className="w-12 h-12" />,
      title: "No Internet",
      desc: "Check your connection and try again.",
      color: "text-red-600",
      bg: "bg-red-50",
    },
    auth: {
      icon: <AlertCircle className="w-12 h-12" />,
      title: "Session Expired",
      desc: "Please log in again to continue.",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  };

  const { icon, title, desc, color, bg } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-8 rounded-2xl ${bg} border-2 border-dashed ${color.replace("text", "border")} text-center max-w-md mx-auto`}
    >
      <div className={`${color} mb-4`}>{icon}</div>
      <h3 className={`text-2xl font-bold ${color} mb-2`}>{title}</h3>
      <p className="text-gray-600 mb-4">{desc}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className=" from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-medium hover:scale-105 transition"
        >
          Retry
        </button>
      )}
    </motion.div>
  );
};

export default FallbackUI;