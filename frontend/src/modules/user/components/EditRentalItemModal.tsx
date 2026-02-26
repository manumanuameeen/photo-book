import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rentalApi } from '../../../services/api/rentalApi';
import type { IRentalItem } from '../../../types/rental';
import { X, Upload, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { LocationAutocomplete } from '../../../components/common/LocationAutocomplete';

interface EditRentalItemModalProps {

    item: IRentalItem;
    onClose: () => void;
}

const CATEGORIES = [
    "Cameras", "Lenses", "Lighting", "Drones", "Tripods",
    "Gimbals", "Audio", "Bags & Cases", "Props", "Studio Space", "Others"
];

export default function EditRentalItemModal({ item, onClose }: EditRentalItemModalProps) {
    const queryClient = useQueryClient();
    const [name, setName] = useState(item.name);
    const [description, setDescription] = useState(item.description);
    const [category, setCategory] = useState(item.category);
    const [pricePerDay, setPricePerDay] = useState(item.pricePerDay);
    const [securityDeposit, setSecurityDeposit] = useState(item.securityDeposit);
    const [pickupLocation, setPickupLocation] = useState(item.pickupLocation);

    const [maxRentalPeriod, setMaxRentalPeriod] = useState(item.maxRentalPeriod || 5);
    const [stock, setStock] = useState(item.stock || 1);

    const [termsAndConditions, setTermsAndConditions] = useState(item.termsAndConditions || "");

    const [existingImages, setExistingImages] = useState<string[]>(item.images || []);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            setNewImages(prev => [...prev, ...files]);

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(imagePreviews[index]);
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const updateMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            return rentalApi.updateRentalItem(item._id, formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-listings'] });
            toast.success("Item updated successfully");
            onClose();
            onClose();
        },

        onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to update item");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const totalImages = existingImages.length + newImages.length;
        if (totalImages === 0) {
            toast.error("Please add at least one image");
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('pricePerDay', pricePerDay.toString());
        formData.append('securityDeposit', securityDeposit.toString());
        formData.append('pickupLocation', pickupLocation);
        formData.append('maxRentalPeriod', maxRentalPeriod.toString());
        formData.append('stock', stock.toString());
        formData.append('termsAndConditions', termsAndConditions);

        formData.append('minRentalPeriod', '1');

        existingImages.forEach(img => formData.append('existingImages', img));
        newImages.forEach(file => formData.append('images', file));

        updateMutation.mutate(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Edit Rental Listing</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select value={category} onChange={e => setCategory(e.target.value)} required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price / Day</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                        <input type="number" min="1" value={pricePerDay} onChange={e => setPricePerDay(Number(e.target.value))} required
                                            className="w-full pl-7 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deposit</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                        <input type="number" min="0" value={securityDeposit} onChange={e => setSecurityDeposit(Number(e.target.value))} required
                                            className="w-full pl-7 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                                <LocationAutocomplete
                                    defaultValue={pickupLocation}
                                    onSelect={(address) => setPickupLocation(address)}
                                    className="mb-1"
                                />
                                {pickupLocation && (
                                    <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                        <MapPin size={12} />
                                        <span>Selected: {pickupLocation}</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Rental (Days)</label>
                                    <select value={maxRentalPeriod} onChange={e => setMaxRentalPeriod(Number(e.target.value))}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                        {[3, 5, 7, 14, 30].map(days => (
                                            <option key={days} value={days}>{days} Days</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input type="number" min="1" value={stock} onChange={e => setStock(Number(e.target.value))} required
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Terms (Optional)</label>
                                <textarea rows={3} value={termsAndConditions} onChange={e => setTermsAndConditions(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Special conditions..." />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Images ({existingImages.length + newImages.length})</label>
                        <div className="flex flex-wrap gap-4">
                            
                            {existingImages.map((img, index) => (
                                <div key={`exist-${index}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                                    <img src={img} alt="Existing" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeExistingImage(index)}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}

                            {imagePreviews.map((preview, index) => (
                                <div key={`new-${index}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-green-200 ring-2 ring-green-100">
                                    <img src={preview} alt="New" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeNewImage(index)}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}

                            <button type="button" onClick={() => fileInputRef.current?.click()}
                                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors">
                                <Upload size={20} />
                                <span className="text-xs mt-1">Add Photo</span>
                            </button>
                            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white border-t mt-6">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
                        <button type="submit" disabled={updateMutation.isPending}
                            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-70 flex items-center">
                            {updateMutation.isPending ? <><Loader2 className="animate-spin mr-2" size={18} /> Saving...</> : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

