import { useEffect } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Camera,
  CreditCard,
  User,
  Pencil,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useProfile } from "../hooks/useUser";
import Loader from "../../../components/Loader";
import { useNavigate } from "@tanstack/react-router";
import { ROUTES } from "../../../constants/routes";
import { useApplicationStore } from "../../photographer/store/useApplicationStore";

const Profile = () => {
  const navigate = useNavigate();
  const { applicationStatus, setApplicationStatus } = useApplicationStore();
  const { data, isLoading, isError } = useProfile();

  useEffect(() => {
    if (data?.applicationStatus) {
      const status = data.applicationStatus.toLowerCase() as 'pending' | 'approved' | 'rejected' | 'none';
      if (status !== applicationStatus) {
        setApplicationStatus(status);
      }
    }
  }, [data, applicationStatus, setApplicationStatus]);

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
        Failed to load profile. Please try again later.
      </div>
    );
  }

  const handleEditProfile = () => {
    navigate({ to: ROUTES.USER.EDIT_PROFILE });
  };

  const handleApplyNow = () => {
    navigate({ to: ROUTES.PHOTOGRAPHER.APPLY });
  };

  const handleDashboard = () => {
    navigate({ to: ROUTES.PHOTOGRAPHER.DASHBOARD });
  };

  // Helper for Application Status Badge in new design
  const StatusBadge = () => {
    if (applicationStatus === 'pending') {
      return (
        <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-md text-xs font-medium border border-yellow-200">
          <Clock size={14} /> Application Pending
        </div>
      );
    }
    if (applicationStatus === 'approved') {
      return (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-md text-xs font-medium border border-green-200">
          <CheckCircle size={14} /> Photographer Verified
        </div>
      );
    }
    if (applicationStatus === 'rejected') {
      return (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-md text-xs font-medium border border-red-200">
          <XCircle size={14} /> Application Rejected
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

      {/* --- Top Navigation Bar --- */}
      <div className="bg-[#1E5631] h-16 w-full shadow-sm"></div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* --- Breadcrumb & Header --- */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Account Information</h1>
              <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                Member since {new Date(data.createdAt).getFullYear()}
                <StatusBadge />
              </div>
            </div>

            <div className="flex gap-3">
              {/* Modify buttons based on status */}
              {(applicationStatus === 'none' || applicationStatus === 'rejected') && (
                <button
                  onClick={handleApplyNow}
                  className="flex items-center gap-2 bg-white text-green-700 border border-green-700 px-6 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-green-50 transition-colors"
                >
                  <Camera size={16} />
                  Become a Photographer
                </button>
              )}

              {applicationStatus === 'approved' && (
                <button
                  onClick={handleDashboard}
                  className="flex items-center gap-2 bg-white text-green-700 border border-green-700 px-6 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-green-50 transition-colors"
                >
                  <Briefcase size={16} />
                  Dashboard
                </button>
              )}

              <button
                onClick={handleEditProfile}
                className="flex items-center gap-2 bg-[#1E5631] text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-[#164024] transition-colors"
              >
                <Pencil size={16} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* --- Main Grid Content --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* === LEFT COLUMN === */}
          <div className="space-y-6">

            {/* Personal Identity Card */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-700 mb-6">Personal Identity</h2>
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300 overflow-hidden">
                  {/* Avatar: Check if we have an image URL in data, otherwise placeholder */}
                  <User size={48} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{data.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{data.role}</p>
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-700 mb-6">Contact Details</h2>
              <div className="space-y-5">
                <InfoField
                  label="Email Address"
                  value={data.email}
                  icon={Mail}
                />
                <InfoField
                  label="Phone Number"
                  value={data.phone || "Not provided"}
                  icon={Phone}
                />
                <InfoField
                  label="Base Location"
                  value={data.location || "Not provided"}
                  icon={MapPin}
                />
              </div>
            </div>
          </div>

          {/* === RIGHT COLUMN === */}
          <div className="space-y-6">

            {/* Business & Platform Information - Only show fetching from bio or static or hide if not photographer */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-700 mb-6">About Me</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {data.bio || "No bio information provided yet."}
              </p>
            </div>

            {/* Just a placeholder block since User Profile usually doesn't have business info unless it's the fetched photographer profile. 
                Keeping it simple for User Profile view as per user request to map fields. 
             */}
            {/* If we had more user-specific fields like wallet balance, we could show them here */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-700 mb-6">Account Status</h2>
              <div className="space-y-5">
                <InfoField
                  label="Wallet Balance"
                  value={`$${data.walletBalance || 0}`}
                  icon={CreditCard}
                />
                <InfoField
                  label="Account Type"
                  value={data.role.toUpperCase()}
                  icon={User}
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

// --- Helper Component for Fields ---
const InfoField = ({ label, value, icon: Icon, isLink = false }: { label: string, value: string | number, icon: any, isLink?: boolean }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">{label}</label>
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-50
      ${isLink ? 'bg-green-50/50 text-green-700' : 'bg-gray-50 text-gray-800'}
    `}>
      <Icon size={18} className={isLink ? 'text-green-600' : 'text-gray-400'} />
      <span className={`text-sm font-medium ${isLink ? 'hover:underline cursor-pointer' : ''}`}>
        {value}
      </span>
    </div>
  </div>
);

export default Profile;