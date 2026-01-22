import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Lock,
    Phone,
    Mail,
    Save,
    Loader2,
    AlertCircle,
    X,
    Camera,
    CheckCircle,
    ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import {
    useUpdateProfile,
    useChangePassword,
    useInitiateChangePassword,
    useVerifyOtp,
    useProfile,
} from "../hooks/useUser";
import { ROUTES } from "../../../constants/routes";
import { SmallLocationPicker } from "../../../components/MapLocationPicker";
import { BaseButton } from "../../../components/BaseButton";
import { userApi } from "../../../services/api/userApi";


const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").trim(),
    phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    bio: z.string().optional(),
    location: z.string().optional(),
    lat: z.number().nullable().optional(),
    lng: z.number().nullable().optional(),
});

const passwordSchema = z
    .object({
        currentPassword: z.string().min(8, "Password must be at least 8 characters"),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
        otp: z.string().min(6, "OTP must be 6 digits"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const EditProfilePage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
    const [otpSent, setOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);

    
    const { data: user, isLoading: isUserLoading } = useProfile();
    const updateProfileMutation = useUpdateProfile();
    const changePasswordMutation = useChangePassword();
    const initiateChangePasswordMutation = useInitiateChangePassword();
    const verifyOtpMutation = useVerifyOtp();

    
    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
    });

    
    useEffect(() => {
        if (user) {
            profileForm.reset({
                name: user.name || '',
                phone: user.phone || '',
                bio: user.bio || '',
                location: user.location || '',
                lat: user.lat,
                lng: user.lng,
            });
        }
    }, [user, profileForm]);

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
    });

    
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) { 
            toast.error("Image size should be less than 5MB");
            return;
        }

        const toastId = toast.loading("Uploading image...");

        try {


            await userApi.uploadProfileImage(file);
            toast.success("Profile image updated", { id: toastId });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error.response?.data?.message || "Failed to upload image", { id: toastId });
        }
    };

    const onProfileSubmit = (data: ProfileFormValues) => {
        updateProfileMutation.mutate(data, {
            onSuccess: () => {
                toast.success("Profile updated successfully");
                queryClient.invalidateQueries({ queryKey: ['profile'] });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to update profile");
            }
        });
    };

    const onSendOtp = () => {
        initiateChangePasswordMutation.mutate(undefined, {
            onSuccess: () => {
                toast.success("OTP sent to your email!");
                setOtpSent(true);
                setIsOtpVerified(false);
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to send OTP");
            }
        });
    };

    const onVerifyOtp = () => {
        const otp = passwordForm.getValues("otp");
        if (!otp || otp.length < 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        verifyOtpMutation.mutate(otp, {
            onSuccess: () => {
                toast.success("OTP Verified! You can now change your password.");
                setIsOtpVerified(true);
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Invalid OTP");
                setIsOtpVerified(false);
            }
        });
    };

    const onPasswordSubmit = (data: PasswordFormValues) => {
        changePasswordMutation.mutate({
            oldPassword: data.currentPassword,
            newPassword: data.newPassword,
            confirmPassword: data.confirmPassword,
            otp: data.otp,
        }, {
            onSuccess: () => {
                toast.success("Password changed successfully");
                passwordForm.reset();
                setOtpSent(false);
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to change password");
            }
        });
    };

    const handleCancel = () => {
        
        navigate({ to: ROUTES.USER.PROFILE });
    };

    if (isUserLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
            <div className="mx-auto max-w-5xl space-y-8">

                <button
                    onClick={handleCancel}
                    className="self-start flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Profile</span>
                </button>

                {}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
                        <p className="text-gray-500">Manage your profile details and security settings.</p>
                    </div>
                    <BaseButton
                        variant="secondary"
                        size="md"
                        onClick={handleCancel}
                        className="hidden md:flex"
                    >
                        <X size={18} className="mr-2" />
                        Close
                    </BaseButton>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-3 space-y-2"
                    >
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${activeTab === 'profile'
                                ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                                : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-green-600'
                                }`}
                        >
                            <User size={20} />
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${activeTab === 'security'
                                ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                                : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-green-600'
                                }`}
                        >
                            <Lock size={20} />
                            Security
                        </button>
                    </motion.div>

                    {}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-9"
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <AnimatePresence mode="wait">
                                {activeTab === 'profile' ? (
                                    <motion.div
                                        key="profile-form"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-start gap-6 border-b border-gray-100 pb-6 mb-6">
                                            {}
                                            <div className="relative w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-md group">
                                                {user?.profileImage ? (
                                                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-2xl text-gray-400 font-bold">{user?.name?.charAt(0)}</span>
                                                )}
                                                <label
                                                    htmlFor="profile-image-upload"
                                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                                >
                                                    <Camera size={20} className="text-white" />
                                                </label>
                                                <input
                                                    id="profile-image-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageUpload}
                                                />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
                                                <p className="text-sm text-gray-500 mt-1">Update your personal details below.</p>
                                            </div>
                                        </div>

                                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                                            {}
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium text-gray-700">Full Name</label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                                    <input
                                                        {...profileForm.register('name')}
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                                        placeholder="Your Name"
                                                    />
                                                </div>
                                                {profileForm.formState.errors.name && (
                                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                                        <AlertCircle size={14} /> {profileForm.formState.errors.name.message}
                                                    </p>
                                                )}
                                            </div>

                                            {}
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                                <div className="relative opacity-60 cursor-not-allowed">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                                    <input
                                                        disabled
                                                        value={user?.email || ''}
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-400">Email cannot be changed directly.</p>
                                            </div>

                                            {}
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                                    <input
                                                        {...profileForm.register('phone')}
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                                        placeholder="1234567890"
                                                    />
                                                </div>
                                                {profileForm.formState.errors.phone && (
                                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                                        <AlertCircle size={14} /> {profileForm.formState.errors.phone.message}
                                                    </p>
                                                )}
                                            </div>

                                            {}
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium text-gray-700">Location</label>

                                                {}
                                                <SmallLocationPicker
                                                    label="Select Your Location"
                                                    initialLat={profileForm.watch('lat') || undefined}
                                                    initialLng={profileForm.watch('lng') || undefined}
                                                    onLocationSelect={(loc) => {
                                                        profileForm.setValue('location', loc.address);
                                                        profileForm.setValue('lat', loc.lat);
                                                        profileForm.setValue('lng', loc.lng);
                                                    }}
                                                />
                                                <div className="relative mt-2">
                                                    <input
                                                        {...profileForm.register('location')}
                                                        readOnly 
                                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 outline-none"
                                                        placeholder="Selected location will appear here"
                                                    />
                                                </div>
                                            </div>


                                            {}
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium text-gray-700">Bio</label>
                                                <textarea
                                                    {...profileForm.register('bio')}
                                                    rows={4}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all resize-none"
                                                    placeholder="Tell us a little about yourself..."
                                                />
                                            </div>

                                            <div className="pt-4 flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={updateProfileMutation.isPending}
                                                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {updateProfileMutation.isPending ? (
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                    ) : (
                                                        <Save size={18} />
                                                    )}
                                                    Save Changes
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="security-form"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        <div className="border-b border-gray-100 pb-6 mb-6">
                                            <h2 className="text-xl font-bold text-gray-800">Security Settings</h2>
                                            <p className="text-sm text-gray-500 mt-1">Update your password to keep your account secure.</p>
                                            <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
                                                <strong>Note:</strong> You must verify your identity with an OTP sent to your email before changing the password.
                                            </div>
                                        </div>

                                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">

                                            {!otpSent && (
                                                <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                                    <p className="text-gray-600 mb-4 text-center max-w-sm">
                                                        Click the button below to receive a One-Time Password (OTP) to your registered email address.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={onSendOtp}
                                                        disabled={initiateChangePasswordMutation.isPending}
                                                        className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium flex items-center gap-2"
                                                    >
                                                        {initiateChangePasswordMutation.isPending ? <Loader2 className="animate-spin" /> : <Mail size={18} />}
                                                        Send OTP
                                                    </button>
                                                </div>
                                            )}

                                            <div className={otpSent ? "opacity-100 transition-opacity duration-500" : "opacity-40 pointer-events-none grayscale transition-all duration-500"}>
                                                {}
                                                <div className="mb-6">
                                                    <label className="text-sm font-medium text-gray-700 block mb-2">Verification Code (OTP)</label>
                                                    <div className="flex gap-2">
                                                        <div className="flex-1">
                                                            <input
                                                                {...passwordForm.register('otp')}
                                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all tracking-widest font-mono text-center text-lg max-w-xs"
                                                                placeholder="------"
                                                                maxLength={6}
                                                                disabled={isOtpVerified}
                                                            />
                                                            {passwordForm.formState.errors.otp && (
                                                                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                                                                    <AlertCircle size={14} /> {passwordForm.formState.errors.otp.message}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={onVerifyOtp}
                                                            disabled={verifyOtpMutation.isPending || isOtpVerified}
                                                            className={`px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${isOtpVerified
                                                                ? "bg-green-100 text-green-700 cursor-default"
                                                                : "bg-green-600 text-white hover:bg-green-700"
                                                                }`}
                                                        >
                                                            {verifyOtpMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : (isOtpVerified ? <CheckCircle size={18} /> : "Verify")}
                                                            {isOtpVerified ? "Verified" : ""}
                                                        </button>
                                                    </div>
                                                </div>

                                                <hr className="border-gray-100 mb-6" />

                                                {}
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium text-gray-700">Current Password</label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                                        <input
                                                            type="password"
                                                            {...passwordForm.register('currentPassword')}
                                                            disabled={!isOtpVerified}
                                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                    {passwordForm.formState.errors.currentPassword && (
                                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                                            <AlertCircle size={14} /> {passwordForm.formState.errors.currentPassword.message}
                                                        </p>
                                                    )}
                                                </div>

                                                {}
                                                <div className="grid gap-2 mt-4">
                                                    <label className="text-sm font-medium text-gray-700">New Password</label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                                        <input
                                                            type="password"
                                                            {...passwordForm.register('newPassword')}
                                                            disabled={!isOtpVerified}
                                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                    {passwordForm.formState.errors.newPassword && (
                                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                                            <AlertCircle size={14} /> {passwordForm.formState.errors.newPassword.message}
                                                        </p>
                                                    )}
                                                </div>

                                                {}
                                                <div className="grid gap-2 mt-4">
                                                    <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                                        <input
                                                            type="password"
                                                            {...passwordForm.register('confirmPassword')}
                                                            disabled={!isOtpVerified}
                                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                    {passwordForm.formState.errors.confirmPassword && (
                                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                                            <AlertCircle size={14} /> {passwordForm.formState.errors.confirmPassword.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="pt-4 flex justify-end">
                                                    <button
                                                        type="submit"
                                                        disabled={changePasswordMutation.isPending || !otpSent}
                                                        className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {changePasswordMutation.isPending ? (
                                                            <Loader2 className="h-5 w-5 animate-spin" />
                                                        ) : (
                                                            <Save size={18} />
                                                        )}
                                                        Update Password
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default EditProfilePage;