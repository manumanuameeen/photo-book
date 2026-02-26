import { Upload, X, Image as ImageIcon, CheckCircle, AlertOctagon, Star } from 'lucide-react';
import { toast } from 'sonner';

interface StepPhotosProps {
    selectedFiles: File[];
    setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
    previewUrls: string[];
    setPreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
}

export function StepPhotos({ selectedFiles, setSelectedFiles, previewUrls, setPreviewUrls }: StepPhotosProps) {

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);

            const validFiles = filesArray.filter(file => {
                if (!file.type.startsWith('image/')) {
                    toast.error(`${file.name} is not an image`);
                    return false;
                }
                if (file.size > 5 * 1024 * 1024) {
                    toast.error(`${file.name} is too large (max 5MB)`);
                    return false;
                }
                return true;
            });

            if (validFiles.length > 0) {
                
                const newFiles = [...selectedFiles, ...validFiles];
                const newPreviews = [...previewUrls, ...validFiles.map(file => URL.createObjectURL(file))];

                setSelectedFiles(newFiles);
                setPreviewUrls(newPreviews);
            }
        }
    };

    const removePhoto = (idx: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== idx);
        const newPreviews = previewUrls.filter((_, i) => i !== idx);

        setSelectedFiles(newFiles);
        setPreviewUrls(newPreviews);
    };

    const makeCover = (idx: number) => {
        if (idx === 0) return; 

        const newFiles = [...selectedFiles];
        const newPreviews = [...previewUrls];

        const [fileToMove] = newFiles.splice(idx, 1);
        newFiles.unshift(fileToMove);

        const [previewToMove] = newPreviews.splice(idx, 1);
        newPreviews.unshift(previewToMove);

        setSelectedFiles(newFiles);
        setPreviewUrls(newPreviews);
        toast.success("Cover image updated");
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <ImageIcon className="text-green-600" />
                    Item Photos
                </h2>
                <p className="text-gray-500 text-sm mt-1 ml-9">High-quality photos significantly increase rental chances.</p>
            </div>

            <div className={`p-4 rounded-lg flex items-start gap-3 border ${previewUrls.length < 4 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
                {previewUrls.length < 4 ? <AlertOctagon className="shrink-0 mt-0.5" size={18} /> : <CheckCircle className="shrink-0 mt-0.5" size={18} />}
                <div className="text-sm">
                    <p className="font-semibold">Requirement: Minimum 4 Images</p>
                    <p className="opacity-90 mt-0.5">Please upload at least 4 clear photos of your item from different angles. First image will be the cover.</p>
                    <p className="mt-2 font-bold">{previewUrls.length} / 4 uploaded</p>
                </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 transition-all cursor-pointer relative group bg-white">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center pointer-events-none">
                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                        <Upload size={32} />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">Click to upload photos</h3>
                    <p className="text-gray-400 text-sm mt-2">SVG, PNG, JPG or GIF (max. 5MB)</p>
                </div>
            </div>

            {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {previewUrls.map((img, idx) => (
                        <div key={idx} className={`aspect-square rounded-xl overflow-hidden border-2 relative group shadow-sm bg-white transition-all ${idx === 0 ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200'}`}>
                            <img src={img} alt={`preview ${idx}`} className="w-full h-full object-cover" />

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                {idx !== 0 && (
                                    <button
                                        type='button'
                                        onClick={() => makeCover(idx)}
                                        className="bg-white text-yellow-500 rounded-full px-3 py-1.5 text-xs font-bold hover:bg-yellow-50 transition-colors transform hover:scale-105 shadow-lg flex items-center gap-1"
                                    >
                                        <Star size={14} fill="currentColor" /> Set Cover
                                    </button>
                                )}
                                <button
                                    type='button'
                                    onClick={() => removePhoto(idx)}
                                    className="bg-white text-red-500 rounded-full p-2 hover:bg-red-50 transition-colors transform hover:scale-110 shadow-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {idx === 0 && (
                                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                                    <Star size={12} fill="currentColor" /> Cover
                                </div>
                            )}
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                                {idx + 1}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
