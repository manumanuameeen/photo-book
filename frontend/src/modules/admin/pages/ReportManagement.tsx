import React, { useEffect, useState } from 'react';
import { adminReportApi, type IAdminReport } from '../../../services/api/adminReportApi';
import { toast } from 'sonner';
import { Loader2, XCircle, Send, MessageSquare, Image as ImageIcon, AlertTriangle } from 'lucide-react';

const ReportManagement: React.FC = () => {
    const [reports, setReports] = useState<IAdminReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const [forwardModalOpen, setForwardModalOpen] = useState(false);
    const [selectedReportForForward, setSelectedReportForForward] = useState<IAdminReport | null>(null);
    const [forwardMessage, setForwardMessage] = useState('');
    const [forwardRecipientType, setForwardRecipientType] = useState<'reporter' | 'owner'>('owner');
    const [isForwarding, setIsForwarding] = useState(false);

    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedDetailReport, setSelectedDetailReport] = useState<IAdminReport | null>(null);

    const [penaltyModalOpen, setPenaltyModalOpen] = useState(false);
    const [selectedPenaltyAction, setSelectedPenaltyAction] = useState<'warn' | 'block' | 'resolve' | null>(null);
    const [penaltyReason, setPenaltyReason] = useState('');
    const [penaltyDuration, setPenaltyDuration] = useState<number | ''>('');
    const [isApplyingPenalty, setIsApplyingPenalty] = useState(false);

    const openPenaltyModal = (action: 'warn' | 'block' | 'resolve') => {
        setSelectedPenaltyAction(action);
        setPenaltyReason('');
        setPenaltyDuration(action === 'block' ? 7 : '');
        setPenaltyModalOpen(true);
    };

    const handleApplyPenalty = async () => {
        if (!selectedDetailReport || !selectedPenaltyAction) return;
        if (!penaltyReason.trim()) {
            toast.error("Reason logging is required for this action");
            return;
        }

        try {
            setIsApplyingPenalty(true);

            let actionTaken: 'warning' | 'block' | 'resolved' | 'false_report_dismissed' = 'warning';
            if (selectedPenaltyAction === 'warn') actionTaken = 'warning';
            else if (selectedPenaltyAction === 'block') actionTaken = 'block';
            else if (selectedPenaltyAction === 'resolve') actionTaken = 'resolved';

            let suspensionEndDate: Date | undefined;
            if (selectedPenaltyAction === 'block' && penaltyDuration) {
                const date = new Date();
                date.setDate(date.getDate() + Number(penaltyDuration));
                suspensionEndDate = date;
            }

            await adminReportApi.applyPenalty(selectedDetailReport._id, {
                actionTaken,
                adminNotes: penaltyReason,
                suspensionEndDate
            });

            toast.success(`Action '${selectedPenaltyAction}' applied successfully`);
            setPenaltyModalOpen(false);
            setDetailsModalOpen(false);
            fetchReports();
        } catch (error: unknown) {
            console.error("Penalty failed", error);
            toast.error((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to finalize report action");
        } finally {
            setIsApplyingPenalty(false);
        }
    };

    const fetchReports = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await adminReportApi.getReports(page, limit, statusFilter);
            setReports(data?.reports || []);
            setTotalPages(Math.ceil((data?.total || 0) / limit));
        } catch (error: unknown) {
            console.error("Failed to fetch reports", error);
            toast.error("Failed to load reports");
        } finally {
            setIsLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            setIsUpdating(id);
            await adminReportApi.updateReportStatus(id, newStatus);
            toast.success("Report status updated");
            fetchReports();
            if (selectedDetailReport?._id === id) {

                setDetailsModalOpen(false);
            }
        } catch (error: unknown) {
            console.error("Update failed", error);
            toast.error("Failed to update status");
        } finally {
            setIsUpdating(null);
        }
    };

    const handleOpenForwardModal = (report: IAdminReport) => {
        setSelectedReportForForward(report);
        setForwardMessage(
            `Regarding your ${report.targetType} "${report.targetName || report.targetId}":\n\n` +
            `We received a report for the following reason: ${report.reason.replace('_', ' ')}.\n\n` +
            `Search Details:\n${report.description}\n\n` +
            `[Please provide clarification or take necessary action.]`
        );
        setForwardModalOpen(true);
    };

    const handleOpenDetailsModal = (report: IAdminReport) => {
        setSelectedDetailReport(report);
        setDetailsModalOpen(true);
    };

    const handleForwardReport = async () => {
        if (!selectedReportForForward) return;
        if (!forwardMessage.trim()) {
            toast.error("Please enter a message");
            return;
        }

        try {
            setIsForwarding(true);
            await adminReportApi.forwardReportToChat(selectedReportForForward._id, forwardMessage, forwardRecipientType);
            toast.success(`Message sent to ${forwardRecipientType === 'reporter' ? 'Reporter' : 'Owner'} successfully`);
            setForwardModalOpen(false);
            setForwardMessage('');
            fetchReports(); // Refresh to see admin notes updated
        } catch (error: unknown) {
            console.error("Forward failed", error);
            toast.error("Failed to forward report");
        } finally {
            setIsForwarding(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'reviewed': return 'bg-blue-100 text-blue-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'dismissed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 relative">
            <h1 className="text-2xl font-bold mb-6">Report Management</h1>

            <div className="mb-6 flex gap-4">
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="p-2 border rounded-lg bg-white shadow-sm"
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                </select>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
            ) : (
                <>
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reports?.map((report) => (
                                    <tr key={report._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {report.reporterId?.firstName} {report.reporterId?.lastName}
                                            </div>
                                            <div className="text-sm text-gray-500">{report.reporterId?.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {report.targetMetadata?.image && (
                                                    <img src={report.targetMetadata.image} alt="Target" className="w-10 h-10 rounded object-cover border" />
                                                )}
                                                <div>
                                                    <div className="text-sm text-gray-900 font-medium capitalize">{report.targetType}</div>
                                                    <div className="text-sm text-gray-500 truncate max-w-[150px]">{report.targetMetadata?.name || report.targetName || report.targetId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 font-medium capitalize">{report.reason.replace('_', ' ')}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-xs">{report.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                                            <button
                                                onClick={() => handleOpenDetailsModal(report)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="View Details"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleOpenForwardModal(report)}
                                                title="Forward to Chat"
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <MessageSquare size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!isLoading && reports.length === 0 && (
                            <div className="p-8 text-center text-gray-500">No reports found.</div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-4">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className={`px-4 py-2 border rounded-md ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-700">Page {page} of {totalPages}</span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                className={`px-4 py-2 border rounded-md ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {detailsModalOpen && selectedDetailReport && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-2xl font-bold text-gray-800">Report Details</h2>
                            <button onClick={() => setDetailsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={28} />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">

                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Current Status</div>
                                    <div className={`mt-1 inline-flex px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(selectedDetailReport.status)}`}>
                                        {selectedDetailReport.status.toUpperCase()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Report Date</div>
                                    <div className="text-gray-800 font-medium">{new Date(selectedDetailReport.createdAt).toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Reporter Information</h3>
                                    <div className="flex items-center gap-4">
                                        {selectedDetailReport.reporterId ? (
                                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
                                                {selectedDetailReport.reporterId.firstName?.[0]}
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl">
                                                ?
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-semibold text-gray-900">{selectedDetailReport.reporterId?.firstName} {selectedDetailReport.reporterId?.lastName}</div>
                                            <div className="text-sm text-gray-500">{selectedDetailReport.reporterId?.email}</div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Owner Information</h3>
                                    {selectedDetailReport.ownerDetails ? (
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl">
                                                {selectedDetailReport.ownerDetails.firstName?.[0]}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{selectedDetailReport.ownerDetails.firstName} {selectedDetailReport.ownerDetails.lastName}</div>
                                                <div className="text-sm text-gray-500">{selectedDetailReport.ownerDetails.email}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-gray-500 italic p-2 bg-gray-50 rounded">Owner details not available</div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Reported Item ({selectedDetailReport.targetType})</h3>
                                <div className="bg-gray-50 rounded-lg p-4 flex gap-4 items-start">
                                    {selectedDetailReport.targetMetadata?.image && (
                                        <img src={selectedDetailReport.targetMetadata.image} alt="Reported Item" className="w-24 h-24 rounded-lg object-cover shadow-sm" />
                                    )}
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900 text-lg mb-1">{selectedDetailReport.targetMetadata?.name || selectedDetailReport.targetName || 'Unknown Item'}</div>
                                        <div className="text-sm text-gray-500 mb-2">ID: {selectedDetailReport.targetId}</div>
                                        {selectedDetailReport.targetMetadata?.price && (
                                            <div className="text-sm text-gray-700 font-medium">Price: ${selectedDetailReport.targetMetadata.price}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Report Reason & Description</h3>
                                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                    <div className="font-semibold text-red-800 mb-2 capitalize">
                                        {selectedDetailReport.reason.replace('_', ' ')}
                                        {selectedDetailReport.subReason && <span className="text-red-600 font-normal"> - {selectedDetailReport.subReason}</span>}
                                    </div>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedDetailReport.description}</p>

                                    {selectedDetailReport.evidenceUrls && selectedDetailReport.evidenceUrls.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-red-200">
                                            <h4 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
                                                <ImageIcon size={16} /> Attached Evidence
                                            </h4>
                                            <div className="flex gap-3 overflow-x-auto pb-2">
                                                {selectedDetailReport.evidenceUrls.map((url, idx) => (
                                                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block flex-shrink-0">
                                                        <img src={url} alt={`Evidence ${idx + 1}`} className="h-28 w-auto rounded-lg border border-gray-200 hover:opacity-80 transition-opacity shadow-sm" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedDetailReport.adminNotes && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Admin Activity Log</h3>
                                    <div className="bg-gray-100 p-3 rounded text-sm text-gray-600 font-mono whitespace-pre-wrap">
                                        {selectedDetailReport.adminNotes}
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex flex-wrap justify-end gap-2 sticky bottom-0 z-20">
                            {selectedDetailReport.status === 'pending' || selectedDetailReport.status === 'reviewed' ? (
                                <>
                                    <button
                                        onClick={() => handleOpenForwardModal(selectedDetailReport)}
                                        className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-medium transition-colors flex items-center gap-1.5"
                                    >
                                        <MessageSquare size={16} /> Send Message
                                    </button>
                                    <div className="w-full sm:w-auto flex-1 md:flex-none" />

                                    <button
                                        onClick={() => handleUpdateStatus(selectedDetailReport._id, 'dismissed')}
                                        disabled={isUpdating === selectedDetailReport._id}
                                        className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        {isUpdating === selectedDetailReport._id && <Loader2 className="animate-spin" size={16} />}
                                        Dismiss
                                    </button>
                                    <button
                                        onClick={() => openPenaltyModal('warn')}
                                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-1"
                                    >
                                        Warn
                                    </button>
                                    <button
                                        onClick={() => openPenaltyModal('block')}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-1"
                                    >
                                        Block
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedDetailReport._id, 'resolved')}
                                        disabled={isUpdating === selectedDetailReport._id}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        {isUpdating === selectedDetailReport._id && <Loader2 className="animate-spin" size={16} />}
                                        Resolve
                                    </button>
                                </>
                            ) : (
                                <div className="text-gray-500 italic py-2">This report is closed ({selectedDetailReport.status}).</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {forwardModalOpen && selectedReportForForward && (
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-200">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl border border-gray-100 transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Send Message</h2>
                            <button
                                onClick={() => setForwardModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Recipient</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="recipientType"
                                        value="reporter"
                                        checked={forwardRecipientType === 'reporter'}
                                        onChange={() => setForwardRecipientType('reporter')}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-800 font-medium">Reporter (User who submitted)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="recipientType"
                                        value="owner"
                                        checked={forwardRecipientType === 'owner'}
                                        onChange={() => setForwardRecipientType('owner')}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-800 font-medium">Target Owner (Reported User)</span>
                                </label>
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4 mb-4 text-sm text-blue-800 border border-blue-100">
                            {forwardRecipientType === 'reporter' ? (
                                <>You are about to send a message to the <strong>Reporter</strong> of this {selectedReportForForward.targetType} (e.g. to ask for more proof). </>
                            ) : (
                                <>You are about to send a message to the <strong>Owner</strong> of this {selectedReportForForward.targetType} (e.g. to issue a warning). </>
                            )}
                        </div>

                        <div className="mb-6">
                            <label htmlFor="forward-message" className="block text-sm font-semibold text-gray-700 mb-2">Message Content</label>
                            <textarea
                                id="forward-message"
                                value={forwardMessage}
                                onChange={(e) => setForwardMessage(e.target.value)}
                                className="w-full h-40 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700 bg-gray-50"
                                placeholder="Type your message here..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setForwardModalOpen(false)}
                                className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                disabled={isForwarding}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleForwardReport}
                                disabled={isForwarding}
                                className={`px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 ${isForwarding ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isForwarding ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                Send Forward
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {penaltyModalOpen && selectedPenaltyAction && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] transition-all duration-200">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-100 relative">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 capitalize">
                                <AlertTriangle className={selectedPenaltyAction === 'block' ? 'text-red-600' : 'text-orange-500'} />
                                {selectedPenaltyAction} User
                            </h2>
                            <button onClick={() => setPenaltyModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            You are about to issue a formal <strong className="capitalize">{selectedPenaltyAction}</strong> against this user. This action will be logged and the user will be notified.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Reason / Admin Note</label>
                            <textarea
                                value={penaltyReason}
                                onChange={(e) => setPenaltyReason(e.target.value)}
                                className="w-full h-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                                placeholder="Why is this penalty being applied?"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setPenaltyModalOpen(false)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApplyPenalty}
                                disabled={isApplyingPenalty || !penaltyReason.trim()}
                                className={`px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-sm flex items-center gap-2 ${isApplyingPenalty ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isApplyingPenalty && <Loader2 className="animate-spin" size={16} />}
                                Confirm Action
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportManagement;
