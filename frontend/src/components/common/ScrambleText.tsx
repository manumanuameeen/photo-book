import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ScrambleTextProps {
  text: string;
  duration?: number;
  className?: string;
  once?: boolean;
}

const CHARS = '!@#$%^&*()_+{}:"<>?|[];\',./`~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const ScrambleText = ({ text, duration = 0.8, className = "", once = true }: ScrambleTextProps) => {
  const [displayText, setDisplayText] = useState(text);
  const ref = useRef(null);
  const isInView = useInView(ref, { once });
  const [isScrambling, setIsScrambling] = useState(false);

  useEffect(() => {
    if (isInView && !isScrambling) {
      const scramble = async () => {
        setIsScrambling(true);
        let iteration = 0;
        const interval = setInterval(() => {
          setDisplayText(() =>
            text
              .split("")
              .map((char, index) => {
                if (index < iteration) {
                  return text[index];
                }
                if (char === " ") return " ";
                return CHARS[Math.floor(Math.random() * CHARS.length)];
              })
              .join("")
          );

          if (iteration >= text.length) {
            clearInterval(interval);
            setDisplayText(text);
            setIsScrambling(false);
          }

          iteration += 1 / (duration * 10);
        }, 30);

        return () => clearInterval(interval);
      };
      scramble();
    }
  }, [isInView, text, duration, isScrambling]);

  return (
    <motion.span ref={ref} className={className}>
      {displayText}
    </motion.span>
  );
};
