
import React, { useState } from "react";
import type { Column } from "../../../components/tables/admin/admin.Table";
import AdminDataTable from "../../../components/tables/admin/admin.Table";
import { useAdminUser, useBlockUser, useUnblockUser } from "../hooks/useUser";
import toast from "react-hot-toast";
import AdminHeader from "../../../layouts/user/admin/AdminHeader";
import AdminSidebar from "../../../layouts/user/admin/AdminSIdeBar";


interface UserTableData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
}

const UserManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading } = useAdminUser(currentPage, 10, "");
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();

  if (isLoading) return <div>Loading...</div>;

  const users: UserTableData[] = data?.users?.users?.map((u) => ({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.isBlocked ? "Blocked" : "Active",
  })) || [];

  const handleBlock = (id: string) => {
    blockUser.mutate(id, {
      onSuccess: () => toast.success("User blocked"),
      onError: () => toast.error("Failed to block user"),
    });
  };

  const handleUnblock = (id: string) => {
    unblockUser.mutate(id, {
      onSuccess: () => toast.success("User unblocked"),
      onError: () => toast.error("Failed to unblock user"),
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
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
            }}
          />
          <span className="font-medium text-gray-800">{user.name}</span>
        </div>
      ),
    },
    { 
      header: "Email", 
      render: (user) => <span className="text-gray-700">{user.email}</span>
    },
    { 
      header: "Role", 
      render: (user) => (
        <span className="capitalize font-medium text-gray-800">{user.role}</span>
      )
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
        <div className="flex gap-2 justify-end">
          {user.status === "Active" ? (
            <button
              onClick={() => handleBlock(user.id)}
              disabled={blockUser.isPending}
              className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            >
              {blockUser.isPending ? "Blocking..." : "Block"}
            </button>
          ) : (
            <button
              onClick={() => handleUnblock(user.id)}
              disabled={unblockUser.isPending}
              className="px-3 py-1 text-sm font-medium text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
            >
              {unblockUser.isPending ? "Unblocking..." : "Unblock"}
            </button>
          )}
        </div>
      ),
      align: "right",
    },
  ];

  return (

    <div className="p-6 min-h-screen bg-gray-100">
      <AdminHeader/>
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
        <AdminSidebar/>
    </div>
  );
};

export default UserManagement;