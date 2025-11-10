import React from "react";

export type Column<T> = {
    header: string;
    render: (item: T) => React.ReactNode;
    align?: "left" | "right";
    width?: string;
};

export type AdminDataTableProps<T> = {
    title?: string;
    entityName?: string;
    columns: Column<T>[];
    data: T[];
    totalItems: number;
    itemsPerPage?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
};

function AdminDataTable<T extends { id: string | number }>({
    title = "Data Table",
    entityName = "records",
    columns,
    data,
    totalItems,
    itemsPerPage = 10,
    currentPage = 1,
    onPageChange = () => { },
}: AdminDataTableProps<T>) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startRange = (currentPage - 1) * itemsPerPage + 1;
    const endRange = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="overflow-x-auto">
            {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}

            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className={`px-6 py-3 ${col.align === "right" ? "text-right" : "text-left"}`}
                                style={{ width: col.width || "auto" }}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {data.map((item) => (
                        <tr key={item.id}>
                            {columns.map((col, colIndex) => (
                                <td
                                    key={colIndex}
                                    className={`px-6 py-4 whitespace-nowrap ${col.align === "right" ? "text-right" : "text-left"
                                        } text-gray-600`}
                                >
                                    {col.render(item)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>


            <div className="flex justify-between items-center pt-4 text-sm">
                <p className="text-gray-600">
                    Showing {startRange}–{endRange} of {totalItems} {entityName}
                </p>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => onPageChange(i + 1)}
                            className={`px-3 py-1 border rounded ${currentPage === i + 1
                                    ? "bg-green-500 text-white font-semibold"
                                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminDataTable;
