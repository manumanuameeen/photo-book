import React from "react";
import {motion } from "framer-motion"

interface LoaderProps {
  text?: string;
  fullscreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
  text = "Loading...",
  fullscreen = true,
}) => {
  const containerClass = fullscreen
    ? "flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
    : "flex flex-col items-center justify-center p-6";

  return (
    <div className={containerClass}>
      <motion.div
        className="relative flex items-center justify-center w-20 h-20"
        initial={{ scale: 0.9 }}
        animate={{ rotate: 360, scale: [0.9, 1.05, 0.9] }}
        transition={{
          rotate: { repeat: Infinity, duration: 1.6, ease: "linear" },
          scale: { repeat: Infinity, duration: 1.8, ease: "easeInOut" },
        }}
      >
        <div className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-green-600 border-r-green-800 animate-spin-slow"></div>

        <motion.div
          className="w-10 h-10 rounded-full bg-green-700 shadow-[0_0_20px_4px_rgba(16,185,129,0.4)]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.6, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.8,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      <motion.p
        className="mt-8 text-lg font-medium text-gray-800 tracking-wide"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        {text}
      </motion.p>
    </div>
  );
};

export default Loader;
