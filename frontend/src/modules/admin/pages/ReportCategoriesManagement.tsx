import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, IconButton, TextField, Dialog, DialogTitle, DialogContent,
    DialogActions, TablePagination, Chip, Box, Typography, Switch, FormControlLabel
} from '@mui/material';
import { Edit, Trash, Plus, ShieldAlert, X } from 'lucide-react';
import { toast } from 'sonner';
import { adminReportCategoryApi, type IReportCategory, type CreateReportCategoryDTO } from '../../../services/api/adminReportCategoryApi';
import { confirm } from '../../../components/ConfirmToaster';

export default function ReportCategoriesManagement() {
    const [categories, setCategories] = useState<IReportCategory[]>([]);
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [currentCategory, setCurrentCategory] = useState<Partial<IReportCategory>>({
        name: '',
        description: '',
        isActive: true,
        subReasons: []
    });

    const [newSubreasonName, setNewSubreasonName] = useState('');

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await adminReportCategoryApi.getCategories();
            // Assuming data is an array
            setCategories(data || []);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            toast.error('Failed to fetch report categories');
        }
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpen = (category?: IReportCategory) => {
        if (category) {
            setCurrentCategory(JSON.parse(JSON.stringify(category)));
            setIsEditing(true);
        } else {
            setCurrentCategory({
                name: '',
                description: '',
                isActive: true,
                subReasons: []
            });
            setIsEditing(false);
        }
        setNewSubreasonName('');
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentCategory({});
        setIsEditing(false);
    };

    const handleAddSubreason = () => {
        if (!newSubreasonName.trim()) {
            toast.error('Sub-reason name is required');
            return;
        }

        const updatedSubreasons = [...(currentCategory.subReasons || [])];
        updatedSubreasons.push(newSubreasonName.trim());

        setCurrentCategory({ ...currentCategory, subReasons: updatedSubreasons });
        setNewSubreasonName('');
    };

    const handleRemoveSubreason = (index: number) => {
        const updatedSubreasons = [...(currentCategory.subReasons || [])];
        updatedSubreasons.splice(index, 1);
        setCurrentCategory({ ...currentCategory, subReasons: updatedSubreasons });
    };

    const handleSave = async () => {
        try {
            if (!currentCategory.name) {
                toast.error("Category name is required");
                return;
            }

            const dto: CreateReportCategoryDTO & { isActive?: boolean } = {
                name: currentCategory.name,
                description: currentCategory.description,
                subReasons: currentCategory.subReasons,
                isActive: currentCategory.isActive
            };

            if (isEditing && currentCategory._id) {
                await adminReportCategoryApi.updateCategory(currentCategory._id, dto);
                toast.success('Category updated successfully');
            } else {
                await adminReportCategoryApi.createCategory(dto);
                toast.success('Category created successfully');
            }
            fetchCategories();
            handleClose();
        } catch (error: unknown) {
            console.error("Failed to save category:", error);
            const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to save report category';
            toast.error(errorMessage);
        }
    };

    const handleDelete = async (id: string) => {
        confirm('Are you sure you want to delete this category?', async () => {
            try {
                await adminReportCategoryApi.deleteCategory(id);
                toast.success('Category deleted successfully');
                fetchCategories();
            } catch (error) {
                console.error("Failed to delete category:", error);
                toast.error('Failed to delete report category');
            }
        }, () => { });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                        <ShieldAlert size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Report Categories</h1>
                        <p className="text-sm text-gray-500">Manage dynamic report categories and sub-reasons for users</p>
                    </div>
                </div>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={() => handleOpen()}
                    sx={{ backgroundColor: '#2563eb', '&:hover': { backgroundColor: '#1d4ed8' }, textTransform: 'none', px: 3, py: 1 }}
                >
                    Add Category
                </Button>
            </div>

            <TableContainer component={Paper} className="shadow-sm border rounded-xl overflow-hidden">
                <Table>
                    <TableHead className="bg-gray-50">
                        <TableRow>
                            <TableCell className="font-bold text-gray-700">Category Name</TableCell>
                            <TableCell className="font-bold text-gray-700">Status</TableCell>
                            <TableCell className="font-bold text-gray-700">Sub-reasons</TableCell>
                            <TableCell className="font-bold text-gray-700">Description</TableCell>
                            <TableCell className="font-bold text-gray-700 text-right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((category) => (
                            <TableRow key={category._id} hover>
                                <TableCell className="font-medium text-gray-900">{category.name}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={category.isActive ? "Active" : "Inactive"}
                                        color={category.isActive ? "success" : "default"}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                        {category.subReasons && category.subReasons.length > 0 ? (
                                            category.subReasons.map((sub, idx) => (
                                                <Chip key={idx} label={sub} size="small" variant="outlined" />
                                            ))
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">No sub-reasons</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-500 max-w-xs truncate" title={category.description}>
                                    {category.description || '-'}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleOpen(category)} size="small" className="text-blue-600">
                                        <Edit size={18} />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(category._id)} size="small" className="text-red-500 hover:bg-red-50">
                                        <Trash size={18} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {categories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                    No categories found. Click 'Add Category' to create one.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={categories.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle className="font-bold border-b pb-4">
                    {isEditing ? 'Edit Report Category' : 'Create New Category'}
                </DialogTitle>
                <DialogContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextField
                            label="Category Name"
                            fullWidth
                            value={currentCategory.name || ''}
                            onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                            variant="outlined"
                            required
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={currentCategory.isActive !== false} // default true
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, isActive: e.target.checked })}
                                    color="primary"
                                />
                            }
                            label="Active Status"
                        />
                    </div>

                    <TextField
                        label="Description (Optional)"
                        fullWidth
                        multiline
                        rows={2}
                        value={currentCategory.description || ''}
                        onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                        variant="outlined"
                    />

                    <Box className="border rounded-xl p-4 bg-gray-50">
                        <Typography variant="subtitle1" className="font-bold mb-3 flex items-center justify-between">
                            Sub-reasons
                            <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                                {currentCategory.subReasons?.length || 0} items
                            </span>
                        </Typography>

                        <div className="space-y-3 mb-4 max-h-[250px] overflow-y-auto pr-2">
                            {currentCategory.subReasons && currentCategory.subReasons.map((sub, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm">
                                    <p className="font-medium text-sm text-gray-900">{sub}</p>
                                    <IconButton size="small" onClick={() => handleRemoveSubreason(idx)} className="text-red-500 hover:bg-red-50" aria-label="Remove subreason">
                                        <X size={16} />
                                    </IconButton>
                                </div>
                            ))}
                            {(!currentCategory.subReasons || currentCategory.subReasons.length === 0) && (
                                <p className="text-sm text-gray-500 italic text-center py-4 bg-white rounded-lg border border-dashed">
                                    No sub-reasons added yet.
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start border-t border-gray-200 pt-4">
                            <div className="md:col-span-10">
                                <TextField
                                    label="Sub-reason Name"
                                    fullWidth
                                    size="small"
                                    value={newSubreasonName}
                                    onChange={(e) => setNewSubreasonName(e.target.value)}
                                    placeholder="e.g. Scams & Fraud"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={handleAddSubreason}
                                    disabled={!newSubreasonName.trim()}
                                    sx={{ height: '40px' }}
                                >
                                    Add
                                </Button>
                            </div>
                        </div>
                    </Box>

                </DialogContent>
                <DialogActions className="p-4 border-t bg-gray-50">
                    <Button onClick={handleClose} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={!currentCategory.name}
                        sx={{ backgroundColor: '#2563eb', '&:hover': { backgroundColor: '#1d4ed8' } }}
                    >
                        Save Category
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
