import React from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PDFDownloadButtonProps {
    elementId: string;
    fileName?: string;
}

const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({ elementId, fileName = 'report' }) => {
    const [loading, setLoading] = React.useState(false);

    const handleDownload = async () => {
        const element = document.getElementById(elementId);
        if (!element) return;

        try {
            setLoading(true);

            const dataUrl = await toPng(element, {
                cacheBust: true,
                style: {
                    backgroundColor: 'white', 
                }
            });

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [element.offsetWidth, element.offsetHeight] 
            });

            pdf.addImage(dataUrl, 'PNG', 0, 0, element.offsetWidth, element.offsetHeight);
            pdf.save(`${fileName}-${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success("Report downloaded successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate PDF");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors text-sm font-medium"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Export PDF
        </button>
    );
};

export default PDFDownloadButton;
