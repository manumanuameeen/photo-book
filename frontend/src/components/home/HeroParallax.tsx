import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring } from 'framer-motion';

export const HeroParallax = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 80,
        damping: 25,
        restDelta: 0.001
    });

    
    const frameIndex = useTransform(smoothProgress, [0, 1], [0, 179]);

    const renderFrame = (index: number) => {
        if (!canvasRef.current || !imagesRef.current[index]) return;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            const img = imagesRef.current[index];
            const canvas = canvasRef.current;
            
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            
            const canvasRatio = canvas.width / canvas.height;
            const imgRatio = img.width / img.height;
            let drawWidth = canvas.width;
            let drawHeight = canvas.height;
            let offsetX = 0;
            let offsetY = 0;

            if (canvasRatio > imgRatio) {
                drawHeight = canvas.width / imgRatio;
                offsetY = (canvas.height - drawHeight) / 2;
            } else {
                drawWidth = canvas.height * imgRatio;
                offsetX = (canvas.width - drawWidth) / 2;
            }

            
            ctx.filter = 'brightness(85%) contrast(105%)';
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        }
    };

    
    useEffect(() => {
        const loadImages = async () => {
            const loadedImages: HTMLImageElement[] = [];
            for (let i = 1; i <= 180; i++) {
                const img = new Image();
                img.src = `/images/homepage/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
                loadedImages.push(img);
            }
            imagesRef.current = loadedImages;
            
            
            loadedImages[0].onload = () => {
                setImagesLoaded(true);
            };
        };
        loadImages();
    }, []);

    
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current && imagesLoaded) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                renderFrame(Math.max(0, Math.min(179, Math.floor(frameIndex.get()))));
            }
        };
        handleResize(); 
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [imagesLoaded]);

    
    useMotionValueEvent(frameIndex, "change", (latest) => {
        if (imagesLoaded) {
            const index = Math.max(0, Math.min(179, Math.floor(latest)));
            requestAnimationFrame(() => renderFrame(index));
        }
    });

    
    const opacity1 = useTransform(smoothProgress, [0, 0.15, 0.25], [1, 1, 0]);
    const y1 = useTransform(smoothProgress, [0, 0.15, 0.25], [0, 0, -50]);

    const opacity2 = useTransform(smoothProgress, [0.2, 0.3, 0.45, 0.55], [0, 1, 1, 0]);
    const y2 = useTransform(smoothProgress, [0.2, 0.3, 0.45, 0.55], [50, 0, 0, -50]);

    const opacity3 = useTransform(smoothProgress, [0.5, 0.6, 0.75, 0.85], [0, 1, 1, 0]);
    const y3 = useTransform(smoothProgress, [0.5, 0.6, 0.75, 0.85], [50, 0, 0, -50]);

    const opacity4 = useTransform(smoothProgress, [0.8, 0.9, 1], [0, 1, 1]);
    const y4 = useTransform(smoothProgress, [0.8, 0.9, 1], [50, 0, 0]);

    return (
        <div ref={containerRef} className="relative h-[400vh] bg-[#020202]">
            <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
                
                {}
                <div className="absolute inset-0 w-full h-full bg-[#020202]">
                    <canvas 
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full"
                        style={{ display: imagesLoaded ? 'block' : 'none' }}
                    />
                    {!imagesLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                            <span className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
                            <span className="text-white/50 text-xs font-mono uppercase tracking-[0.2em]">INITIALIZING ASSETS</span>
                        </div>
                    )}
                    {}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#020202]/20 via-transparent to-[#020202] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
                </div>

                {}
                <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-4 sm:px-8">
                    
                    {}
                    <motion.div style={{ opacity: opacity1, y: y1 }} className="absolute top-[25%] md:top-[30%] left-6 md:left-12 flex flex-col items-start text-left w-full sm:w-[600px]">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase mb-6 shadow-2xl">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            How It Works
                        </div>
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-light text-white mb-6 tracking-tight leading-[1.1]">
                            THE <span className="font-bold">PLATFORM</span>
                        </h1>
                        <p className="text-base md:text-lg text-white max-w-md font-light tracking-wide bg-black/30 p-2 rounded-lg">
                            We are an intelligent visual ecosystem designed to bridge the gap between creative talent and industry-standard equipment.
                        </p>
                    </motion.div>

                    {}
                    <motion.div style={{ opacity: opacity2, y: y2, pointerEvents: 'none' }} className="absolute top-[20%] right-6 md:right-12 flex flex-col items-end text-right w-full sm:w-[500px]">
                        <p className="text-gray-200 font-mono text-[10px] sm:text-xs tracking-[0.3em] mb-2 bg-black/30 px-2 py-1 rounded">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight drop-shadow-xl">
                            Photographer <br />
                            <span className="font-bold italic text-white/90">Listings</span>
                        </h2>
                        <p className="mt-4 text-sm md:text-base text-gray-100 font-light max-w-sm drop-shadow-md bg-black/40 p-3 rounded-xl border border-white/10">
                            Our primary module is a dedicated marketplace to discover and book vetted photographers. Browse their dynamic portfolios, read reviews, and hire the perfect visionary for your exact event.
                        </p>
                    </motion.div>

                    {}
                    <motion.div style={{ opacity: opacity3, y: y3, pointerEvents: 'none' }} className="absolute bottom-[20%] left-6 md:left-12 flex flex-col items-start text-left w-full sm:w-[500px]">
                        <p className="text-gray-200 font-mono text-[10px] sm:text-xs tracking-[0.3em] mb-2 bg-black/30 px-2 py-1 rounded">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight drop-shadow-xl">
                            Equipment <br />
                            <span className="font-bold italic text-white/90">Marketplace</span>
                        </h2>
                        <p className="mt-4 text-sm md:text-base text-gray-100 font-light max-w-sm drop-shadow-md bg-black/40 p-3 rounded-xl border border-white/10">
                            The secondary module acts as a peer-to-peer rental vault. Users can list their own expensive cameras and drones, or rent industry-standard gear from others without the massive upfront investment.
                        </p>
                    </motion.div>

                    {}
                    <motion.div style={{ opacity: opacity4, y: y4 }} className="absolute bottom-[10%] left-1/2 -translate-x-1/2 flex flex-col items-center justify-center w-full sm:w-[600px] text-center px-4">
                        <p className="text-gray-200 font-mono text-[10px] sm:text-xs tracking-[0.3em] mb-4 bg-black/30 px-4 py-1.5 rounded-full">
                        <h2 className="text-3xl md:text-5xl font-light text-white mb-6 drop-shadow-xl leading-tight">
                            Built For <span className="font-bold italic text-gray-200">Creators</span>
                        </h2>
                        <p className="text-base md:text-lg text-gray-100 font-light drop-shadow-md bg-black/40 p-4 rounded-xl border border-white/10">
                            Whether you need to hire a professional to capture your special moments, or you're a creator looking to rent top-tier lenses for a weekend shoot, everything is seamlessly managed right here.
                        </p>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};
