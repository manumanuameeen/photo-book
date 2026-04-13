import { motion } from 'framer-motion';
import { useRef } from 'react';

const messages = [
  { id: 1, text: "Looking for a drone for my weekend shoot in the Alps. Any recommendations?", sender: "user" },
  { id: 2, text: "I'd recommend the DJI Mavic 3 Pro. It handles high altitude well and has great battery life. I can check availability for your dates.", sender: "ai" },
  { id: 3, text: "Perfect. Book it for next Friday.", sender: "user" },
];

export const Ecosystem = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const springTransition = {
    type: "spring" as const,
    damping: 20,
    stiffness: 100,
    mass: 0.8
  };

  return (
    <section ref={containerRef} className="relative py-40 min-h-screen bg-gradient-to-b from-transparent to-[#050505] overflow-hidden flex items-center">
      
      {}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-purple-900/10 opacity-50 z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        
        {}
        <div>
          <p className="text-gray-500 font-mono text-xs tracking-[0.3em] mb-4">
          <h3 className="text-5xl md:text-7xl font-light text-white leading-tight mb-8">
            The Complete
            <span className="block font-bold italic text-gray-400 mt-2">Ecosystem</span>
          </h3>
          <p className="text-gray-400 text-lg md:text-xl font-light max-w-lg mb-8 leading-relaxed">
            Experience our intelligent platform managed by <span className="text-white">Shutter AI</span>. From gear rentals to photographer bookings, manage everything through a conversational, unified interface.
          </p>
        </div>

        {}
        <div className="relative h-[600px] flex items-center justify-center perspective-[1000px]">
          
          {}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8],
              y: [-10, 10, -10],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-[10%] right-[10%] z-20 w-32 h-32 md:w-40 md:h-40 rounded-full will-change-[transform,opacity]"
          >
            {}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 shadow-[0_0_100px_rgba(255,255,255,0.2)] mix-blend-screen flex justify-center items-center">
              <div className="w-16 h-16 rounded-full bg-white/5 blur-md"></div>
              <i className="fas fa-camera-retro text-white/50 text-3xl absolute z-10"></i>
            </div>
            {}
            <motion.div 
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-blue-400/20 blur-[50px] rounded-full -z-10"
            ></motion.div>
          </motion.div>

          {}
          <div className="w-full max-w-sm flex flex-col space-y-4 pt-32">
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.8 }}
                transition={{
                  ...springTransition,
                  delay: idx * 0.2
                }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`p-5 rounded-2xl max-w-[85%] backdrop-blur-md border ${
                    msg.sender === 'user' 
                      ? 'bg-white/10 border-white/20 rounded-tr-sm text-white' 
                      : 'bg-black/40 border-white/5 rounded-tl-sm text-gray-300'
                  }`}
                  style={{
                    boxShadow: msg.sender === 'user' ? '0 10px 40px -10px rgba(255,255,255,0.1)' : '0 10px 40px -10px rgba(0,0,0,0.5)'
                  }}
                >
                  <p className="text-sm font-light leading-relaxed">{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
