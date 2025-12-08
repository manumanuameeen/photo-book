import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ROUTES } from "../../../constants/routes";
import AdminDataTable, { type Column } from "../../../components/tables/admin/admin.Table";
import SearchBar from "../../../components/common/SearchBat";
import { BaseButton } from "../../../components/BaseButton";
import { Eye, Lock, Unlock, MessageSquare, Bell, Loader2 } from "lucide-react";
import { confirm } from "../../../components/ConfirmToaster";
import { usePhotographerManagement } from "../hooks/usePhotographerManagement";
import type { Photographer } from "../types/photographer.types";

interface PhotographerTableData {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    businessName: string;
    isBlocked: boolean;
    status: "PENDING" | "APPROVED" | "REJECTED";
}

const PhotographerManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const {
        usePhotographers,
        blockPhotographer,
        unblockPhotographer
    } = usePhotographerManagement();

    const [page, setPage] = useState(1);

    const {
        data,
        isLoading: loading,
        error
    } = usePhotographers({
        search: debouncedSearch || undefined,
        page: page,
        status: "APPROVED"
    });

    const photographers = data?.photographers || [];


    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleBlock = (id: string) => {
        confirm("Are you sure you want to block this photographer?", async () => {
            try {
                await blockPhotographer({ id });
            } catch (error) {
            }
        });
    };

    const handleUnblock = (id: string) => {
        confirm("Are you sure you want to unblock this photographer?", async () => {
            try {
                await unblockPhotographer(id);
            } catch (error) {
            }
        });
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const tableData: PhotographerTableData[] = photographers.map((photographer: Photographer) => ({
        id: photographer.id,
        name: photographer.personalInfo.name,
        email: photographer.personalInfo.email,
        phone: photographer.personalInfo.phone,
        location: photographer.personalInfo.location,
        businessName: photographer.businessInfo.businessName,
        isBlocked: photographer.isBlock,
        status: photographer.status
    }));

    const columns: Column<PhotographerTableData>[] = [
        {
            header: "Photographer",
            render: (item) => (
                <div className="flex items-center gap-3">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`}
                        alt={item.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.email}</p>
                    </div>
                </div>
            ),
        },
        {
            header: "Business",
            render: (item) => (
                <div>
                    <p className="font-medium text-gray-700">{item.businessName}</p>
                    <p className="text-xs text-gray-500">{item.location}</p>
                </div>
            ),
        },
        {
            header: "Contact",
            render: (item) => <span className="text-sm text-gray-600">{item.phone}</span>,
        },
        {
            header: "Status",
            render: (item) => (
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${item.isBlocked
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                    }`}>
                    {item.isBlocked ? "Blocked" : "Active"}
                </span>
            ),
        },
        {
            header: "Actions",
            align: "right",
            render: (item) => (
                <div className="flex justify-end gap-2">
                    <Link
                        to="/admin/photographers/$id"
                        params={{ id: item.id }}
                        className="p-2 rounded-md bg-blue-100/50 hover:bg-blue-100 text-blue-600 transition-colors"
                        title="View Details"
                    >
                        <Eye size={18} />
                    </Link>
                    <button
                        className="p-2 rounded-md bg-purple-100/50 hover:bg-purple-100 text-purple-600 transition-colors"
                        title="Chat"
                    >
                        <MessageSquare size={18} />
                    </button>

                    {item.isBlocked ? (
                        <button
                            onClick={() => handleUnblock(item.id)}
                            className="p-2 rounded-md bg-green-100/50 hover:bg-green-100 text-green-600 transition-colors"
                            title="Unblock"
                        >
                            <Unlock size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={() => handleBlock(item.id)}
                            className="p-2 rounded-md bg-red-100/50 hover:bg-red-100 text-red-600 transition-colors"
                            title="Block"
                        >
                            <Lock size={18} />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Photographer Management</h1>
                    <p className="text-sm text-gray-500">Manage photographers and view their activities</p>
                </div>

                <div className="flex gap-3">
                    <Link to={ROUTES.ADMIN.APPLICATIONS} className="relative group">
                        <BaseButton variant="secondary" className="flex items-center gap-2">
                            <Bell size={18} />
                            Pending Applications
                        </BaseButton>
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm border border-white">
                            3
                        </span>
                    </Link>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search photographers..."
                    />
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error instanceof Error ? error.message : "An error occurred"}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-gray-600">Loading photographers...</span>
                    </div>
                ) : (
                    <AdminDataTable
                        columns={columns}
                        data={tableData}
                        totalItems={data?.total || 0}
                        currentPage={page}
                        onPageChange={handlePageChange}
                        entityName="photographers"
                    />
                )}
            </div>
        </div>
    );
};

export default PhotographerManagement;
