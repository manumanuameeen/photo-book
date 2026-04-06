import { motion } from 'framer-motion';

export const AmbientFlares = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1],
          x: ['-20%', '10%', '-20%'],
          y: ['-10%', '20%', '-10%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] rounded-full bg-blue-900/40 blur-[120px] will-change-[transform,opacity]"
      />
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.05, 0.2, 0.05],
          x: ['20%', '-10%', '20%'],
          y: ['20%', '-20%', '20%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vh] rounded-full bg-purple-900/30 blur-[150px] will-change-[transform,opacity]"
      />
    </div>
  );
};
