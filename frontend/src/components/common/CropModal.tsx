import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import getCroppedImg from '../../utils/cropUtils';

interface CropModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: string;
    onCropComplete: (croppedImage: Blob) => void;
    aspectRatio?: number;
}

const CropModal: React.FC<CropModalProps> = ({
    isOpen,
    onClose,
    image,
    onCropComplete,
    aspectRatio = 16 / 9
}) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropChange = (crop: Point) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteInternal = useCallback((_area: Area, areaPixels: Area) => {
        setCroppedAreaPixels(areaPixels);
    }, []);

    const handleSave = async () => {
        try {
            if (croppedAreaPixels) {
                const croppedImage = await getCroppedImg(image, croppedAreaPixels);
                if (croppedImage) {
                    onCropComplete(croppedImage);
                    onClose();
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]"
                    >
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-900">Crop Cover Image</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="relative flex-1 bg-gray-900 overflow-hidden">
                            <Cropper
                                image={image}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspectRatio}
                                onCropChange={onCropChange}
                                onCropComplete={onCropCompleteInternal}
                                onZoomChange={onZoomChange}
                                objectFit="contain"
                            />
                        </div>

                        <div className="p-6 bg-white border-t border-gray-100">
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-4">
                                    <ZoomOut size={18} className="text-gray-400" />
                                    <input
                                        type="range"
                                        value={zoom}
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        aria-labelledby="Zoom"
                                        onChange={(e) => setZoom(Number(e.target.value))}
                                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600 focus:outline-none"
                                    />
                                    <ZoomIn size={18} className="text-gray-400" />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all border border-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className="px-8 py-2 rounded-xl font-bold text-white bg-green-700 hover:bg-green-800 transition-all flex items-center gap-2 shadow-lg shadow-green-900/10"
                                    >
                                        <Check size={18} /> Apply Crop
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CropModal;
