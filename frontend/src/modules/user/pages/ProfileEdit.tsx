import React, { useState, useEffect } from "react"; // Removed unused 'useRef'
import { motion } from "framer-motion";
import {
    User,
    Camera,
    X,
    Save,
    Lock,
    MapPin,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { SmallLocationPicker } from "../../../components/MapLocationPicker";
import { AppCard } from "../../../components/common/AppCard";
import { MotionWrapper } from "../../../components/common/MotionWrapper";
import { FormInput } from "../../../components/common/FormInput";
import { BaseButton } from "../../../components/BaseButton";
import { useProfile, useUpdateProfile } from "../hooks/useUser";
import { useNavigate } from "@tanstack/react-router";
import Loader from "../../../components/Loader";
import { ROUTES } from "../../../constants/routes";

const SectionHeader: React.FC<{ title: string; Icon: React.ElementType }> = ({
    title,
    Icon,
}) => (
    <h3 className="flex items-center text-xl font-bold text-gray-800 mb-5 mt-8 border-b border-gray-100 pb-3">
        <Icon className="mr-3 text-green-700" size={22} />
        {title}
    </h3>
);

const ProfilePictureEditor: React.FC<{ imageUrl: string }> = ({ imageUrl }) => (
    <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-2xl">
            <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera size={28} className="text-white" />
            </div>
            <div className="absolute bottom-2 right-2 w-10 h-10 bg-green-600 rounded-full border-4 border-white flex items-center justify-center shadow-lg hover:bg-green-700 transition">
                <Camera size={18} className="text-white" />
            </div>
        </div>
        <BaseButton
            variant="secondary"
            size="sm"
            className="mt-4 text-green-700 border-green-700 hover:bg-green-50"
            onClick={() => alert("Photo upload coming soon!")}
        >
            Change Photo
        </BaseButton>
    </div>
);

const EditProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { data, isLoading, isError } = useProfile();
    const updateProfile = useUpdateProfile();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        bio: "",
        location: "",
        lat: null as number | null,
        lng: null as number | null,
    });

    // Load user data
    useEffect(() => {
        if (data) {
            setFormData({
                name: data.name || "",
                email: data.email || "",
                phone: data.phone || "",
                bio: data.bio || "",
                location: data.location || "",
                lat: data.lat || null,
                lng: data.lng || null,
            });
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        updateProfile.mutate(
            {
                name: formData.name,
                phone: formData.phone,
                location: formData.location || undefined,
                lat: formData.lat || undefined,
                lng: formData.lng || undefined,
            },
            {
                onSuccess: () => {
                    alert("Profile updated successfully!");
                    navigate({ to: ROUTES.USER.PROFILE });
                },
                onError: () => {
                    alert("Failed to update profile");
                },
            }
        );
    };

    const handleCancel = () => {
        navigate({ to: ROUTES.USER.PROFILE });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="p-10 text-center text-red-500 text-lg bg-gray-50 min-h-screen">
                Failed to load profile.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="bg-gradient-to-br from-green-800 via-green-900 to-emerald-900 text-white shadow-xl"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Edit Profile</h1>
                        <BaseButton
                            variant="secondary"
                            size="md"
                            className="!bg-white/10 hover:!bg-white/20 !border-0 text-white"
                            onClick={handleCancel}
                        >
                            <X size={22} className="mr-2" />
                            Close
                        </BaseButton>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <MotionWrapper className="max-w-5xl mx-auto">
                    <AppCard className="p-8 shadow-2xl">
                        <div className="flex flex-col md:flex-row gap-10 mb-10">
                            <ProfilePictureEditor imageUrl="/default-avatar.png" />

                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    About You (Bio)
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder="Tell photographers and clients about yourself..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>

                        <hr className="my-10 border-gray-200" />

                        <SectionHeader title="Basic Information" Icon={User} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="Email Address"
                                name="email"
                                value={formData.email}
                                disabled
                                className="bg-gray-100"
                            />
                        </div>

                        <div className="mt-6">
                            <FormInput
                                label="Phone Number"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+91 1234567890"
                            />
                        </div>

                        <SectionHeader title="Contact & Location" Icon={MapPin} />

                        {/* 🎉 100% FREE MAP - No API Key, No Credit Card Needed! */}
                        <SmallLocationPicker
                            label="Select Your Location"
                            initialLat={formData.lat || 20.5937}
                            initialLng={formData.lng || 78.9629}
                            onLocationSelect={(loc) => {
                                setFormData(prev => ({
                                    ...prev,
                                    location: loc.address,
                                    lat: loc.lat,
                                    lng: loc.lng,
                                }));
                            }}
                        />

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mt-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-gray-800 flex items-center">
                                        <Lock className="mr-2 text-amber-600" size={20} />
                                        Change Password
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">Use secure password reset flow</p>
                                </div>
                                <BaseButton
                                    variant="secondary"
                                    className="text-amber-700 border-amber-400 hover:bg-amber-100"
                                >
                                    Change Password
                                </BaseButton>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-12">
                            <BaseButton variant="secondary" size="lg" onClick={handleCancel}>
                                Cancel
                            </BaseButton>
                            <BaseButton
                                variant="primary"
                                size="lg"
                                onClick={handleSave}
                                disabled={updateProfile.isPending}
                            >
                                {updateProfile.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} className="mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </BaseButton>
                        </div>
                    </AppCard>
                </MotionWrapper>
            </div>
        </div>
    );
};

export default EditProfilePage;