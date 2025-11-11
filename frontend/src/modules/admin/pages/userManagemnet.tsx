import React, { useState } from "react";
import type { Column } from "../../../components/tables/admin/admin.Table";
import AdminDataTable from "../../../components/tables/admin/admin.Table";
import { useAdminUser, useBlockUser, useUnblockUser } from "../hooks/useUser";
import toast, { Toaster } from "react-hot-toast";
import Loader from "../../../components/Loader";
import type { IUser } from "../types/admin.type";
import { Eye, Lock, Unlock } from "lucide-react";

interface UserTableData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  isBlock: boolean;
  avatar?: string;
}

const UserManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error, isError } = useAdminUser(currentPage, 10, "");
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();

  if (isLoading) {
    return <Loader text="user loading" />;
  }

  if (isError) {
    console.error("Error details:", error);
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-4">
              {(error as any)?.response?.data?.message || (error as Error)?.message || "Failed to load users"}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Status: {(error as any)?.response?.status || "Unknown"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  let usersArray: IUser[] = [];

  if (data?.users?.users && Array.isArray(data.users.users)) {
    usersArray = data.users.users;
    console.log(" Found users at data.users.users");
  }

  const users: UserTableData[] = usersArray.map((u) => ({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.isBlocked ? "inActive" : "Active",
    isBlock: u.isBlocked,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`,
  }));

  const handleBlock = (id: string) => {
    blockUser.mutate(id, {
      onSuccess: () => {
        toast.success("User blocked successfully");
        console.log("✅ User blocked:", id);
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || "Failed to block user";
        toast.error(errorMessage);
        console.error(" Block error:", error);
      },
    });
  };

  const handleUnblock = (id: string) => {
    unblockUser.mutate(id, {
      onSuccess: () => {
        toast.success("User unblocked successfully");
        console.log(" User unblocked:", id);
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || "Failed to unblock user";
        toast.error(errorMessage);
        console.error(" Unblock error:", error);
      },
    });
  };

  const columns: Column<UserTableData>[] = [
    {
      header: "Name",
      render: (user) => (
        <div className="flex items-center space-x-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full border-2 border-gray-200"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name
              )}&background=random`;
            }}
          />
          <span className="font-medium text-gray-800">{user.name}</span>
        </div>
      ),
    },
    {
      header: "Email",
      render: (user) => <span className="text-gray-700">{user.email}</span>,
    },
    {
      header: "Role",
      render: (user) => (
        <span className="capitalize font-medium text-gray-800 bg-blue-100 px-3 py-1 rounded-full text-sm">
          {user.role}
        </span>
      ),
    },
    {
      header: "Status",
      render: (user) => (
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${
            user.status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {user.status}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (user) => (
        <div className="flex items-center justify-end gap-3">
          <button
            className="p-2 rounded-md bg-blue-500 hover:bg-blue-600 transition-colors text-white"
            title="View Profile"
          >
            <Eye className="h-4 w-4" />
          </button>

          {user.isBlock === false ? (
            <button
              onClick={() => handleBlock(user.id)}
              disabled={blockUser.isPending}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Block User"
            >
              {blockUser.isPending ? (
                <>
                  <Lock className="h-4 w-4 animate-pulse" /> Blocking...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Block
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => handleUnblock(user.id)}
              disabled={unblockUser.isPending}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Unblock User"
            >
              {unblockUser.isPending ? (
                <>
                  <Unlock className="h-4 w-4 animate-pulse" /> Unblocking...
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" /> Unblock
                </>
              )}
            </button>
          )}
        </div>
      ),
      align: "right",
    },
  ];

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      
      <AdminDataTable
        title="User Management"
        entityName="users"
        columns={columns}
        data={users}
        totalItems={data?.users?.total ?? 0}
        currentPage={currentPage}
        itemsPerPage={10}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default UserManagement;
