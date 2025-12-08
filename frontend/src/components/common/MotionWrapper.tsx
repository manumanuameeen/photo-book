import { motion, type MotionProps } from "framer-motion";
import { type ReactNode } from "react";

export interface MotionWrapperProps extends MotionProps {
  children: ReactNode;
  className?: string;
}

export const MotionWrapper = ({
  children,
  className,
  ...motionProps
}: MotionWrapperProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};
