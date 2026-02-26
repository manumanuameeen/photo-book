
import { useState, useEffect } from 'react';
import { FileText, Shield, CheckCircle } from 'lucide-react';
import { rulesApi, type IRule } from '../../../services/api/rulesApi';
import PDFDownloadButton from '../../admin/components/PDFDownloadButton';

export default function RulesPage() {
    const [rules, setRules] = useState<IRule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRules = async () => {
            try {
                const data = await rulesApi.getAllRules();
                setRules(data);
            } catch (error) {
                console.error("Failed to fetch rules:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRules();
    }, []);

    const bookingRules = rules.filter(r => r.category === 'booking');
    const rentalRules = rules.filter(r => r.category === 'rental');

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <FileText className="text-blue-600" size={32} />
                        Platform Rules & Policies
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Official guidelines for Bookings and Equipment Rentals.
                    </p>
                </div>
                <div className="mt-4 md:mt-0">
                    <PDFDownloadButton elementId="rules-document" fileName="Platform-Rules" />
                </div>
            </div>

            <div id="rules-document" className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                
                <div className="bg-gray-50 border-b border-gray-200 p-8 text-center visible-print">
                    <h2 className="text-2xl font-bold text-gray-800">Terms of Service Addendum</h2>
                    <p className="text-sm text-gray-500 mt-1">Last Updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="p-8 md:p-12 space-y-12">

                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <CheckCircle size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">1. Booking Policies</h2>
                        </div>

                        <div className="pl-4 border-l-2 border-gray-100 space-y-6">
                            <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-100 text-sm text-blue-800 mb-6">
                                These rules apply to all photography sessions booked through the platform. By booking, you agree to these terms.
                            </div>

                            <div className="grid gap-6">
                                {bookingRules.length > 0 ? bookingRules.map((rule, index) => (
                                    <div key={rule._id} className="flex gap-4">
                                        <span className="font-mono text-gray-400 font-bold mt-1">1.{index + 1}</span>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900">{rule.title}</h3>
                                            <p className="text-gray-600 mt-1 leading-relaxed">{rule.description}</p>
                                            {rule.amount && (
                                                <span className="inline-block mt-2 text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded">
                                                    Penalty: ${rule.amount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-gray-500 italic">No specific booking rules defined yet.</p>
                                )}
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                <Shield size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">2. Equipment Rental Policies</h2>
                        </div>

                        <div className="pl-4 border-l-2 border-gray-100 space-y-6">
                            <div className="bg-purple-50/50 p-6 rounded-lg border border-purple-100 text-sm text-purple-800 mb-6">
                                Renters are fully responsible for equipment from the time of pickup until return. Physical inspection is mandatory.
                            </div>

                            <div className="grid gap-6">
                                {rentalRules.length > 0 ? rentalRules.map((rule, index) => (
                                    <div key={rule._id} className="flex gap-4">
                                        <span className="font-mono text-gray-400 font-bold mt-1">2.{index + 1}</span>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900">{rule.title}</h3>
                                            <p className="text-gray-600 mt-1 leading-relaxed">{rule.description}</p>
                                            {rule.amount && (
                                                <span className="inline-block mt-2 text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded">
                                                    Fine: ${rule.amount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-gray-500 italic">No specific rental rules defined yet.</p>
                                )}
                            </div>
                        </div>
                    </section>

                    <div className="mt-12 p-6 bg-gray-50 rounded-xl text-center">
                        <p className="text-gray-500 text-sm">
                            By continuing to use our services, you acknowledge that you have read and understood these rules.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

