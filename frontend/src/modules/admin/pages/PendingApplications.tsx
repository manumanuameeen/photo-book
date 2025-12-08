import React, { useState, useEffect } from 'react';
import { ROUTES } from "../../../constants/routes";
import { ArrowLeft, Calendar, Eye, Loader2 } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import AdminDataTable, { type Column } from '../../../components/tables/admin/admin.Table';
import { useApplicationManagement } from '../hooks/useApplicationManagement';
import type { Photographer } from '../types/photographer.types';

interface ApplicationTableData {
    id: string;
    name: string;
    email: string;
    date: string;
    status: string;
}

const PendingApplications: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;
    const navigate = useNavigate();

    const { useApplications } = useApplicationManagement();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading, error } = useApplications({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: "PENDING"
    });

    const applications = data?.photographers || [];
    const pagination = {
        total: data?.total || 0,
        page: data?.page || 1,
        limit: data?.limit || 10,
        totalPages: data?.totalPages || 0
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const tableData: ApplicationTableData[] = applications.map((app: Photographer) => ({
        id: app.id,
        name: app.personalInfo.name,
        email: app.personalInfo.email,
        date: new Date(app.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }),
        status: app.status
    }));

    const columns: Column<ApplicationTableData>[] = [
        {
            header: "Applicant",
            render: (app) => (
                <div className="flex items-center gap-3">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&background=random`}
                        alt={app.name}
                        className="w-10 h-10 rounded-full border border-gray-200"
                    />
                    <div>
                        <p className="font-medium text-gray-900">{app.name}</p>
                        <p className="text-xs text-gray-500">{app.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Applied Date",
            render: (app) => (
                <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    {app.date}
                </div>
            )
        },
        {
            header: "Status",
            render: (app) => (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold uppercase">
                    {app.status}
                </span>
            )
        },
        {
            header: "Actions",
            align: "right",
            render: (app) => {
                return (
                    <button
                        onClick={() => navigate({ to: ROUTES.ADMIN.APPLICATION_DETAILS, params: { id: app.id } })}
                        className="px-3 py-1 text-sm font-semibold rounded-lg transition-colors duration-200 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Eye size={16} /> Check Application
                    </button>
                );
            }
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to={ROUTES.ADMIN.PHOTOGRAPHERS}>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={18} />
                        <span className="font-medium">Back to Photographers</span>
                    </button>
                </Link>
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Pending Applications</h1>
                    <p className="text-sm text-gray-500">Review and manage pending photographer requests</p>
                </div>
                <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium border border-yellow-100">
                    {pagination.total} Pending Requests
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">Failed to load applications</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-gray-600">Loading applications...</span>
                    </div>
                ) : (
                    <AdminDataTable
                        columns={columns}
                        data={tableData}
                        totalItems={pagination.total}
                        currentPage={pagination.page}
                        onPageChange={handlePageChange}
                        entityName="applications"
                    />
                )}
            </div>
        </div>
    );
};

export default PendingApplications;
