import { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, IconButton, TextField, Dialog, DialogTitle, DialogContent,
    DialogActions, Select, MenuItem, InputLabel, FormControl, TablePagination
} from '@mui/material';

import { Edit, Trash, Plus } from 'lucide-react';
import axiosInstance from '../../../services/apiClient';
import { API_ROUTES } from '../../../constants/apiRoutes';
import { toast } from 'sonner';

interface Rule {
    _id: string;
    title: string;
    description: string;
    category: 'booking' | 'rental' | 'general';
    type: 'reschedule' | 'cancel' | 'fine' | 'info';
    amount?: number;
    icon: string;
    isActive: boolean;
}

export default function RulesManagement() {
    const [rules, setRules] = useState<Rule[]>([]);
    const [open, setOpen] = useState(false);
    const [currentRule, setCurrentRule] = useState<Partial<Rule>>({
        title: '',
        description: '',
        category: 'booking',
        type: 'info',
        amount: 0,
        icon: 'info',
        isActive: true
    });
    const [isEditing, setIsEditing] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const response = await axiosInstance.get(API_ROUTES.RULES.BASE);
            setRules(response.data.data || response.data);
        } catch {
            toast.error('Failed to fetch rules');
        }
    };

    const handleOpen = (rule?: Rule) => {
        if (rule) {
            setCurrentRule(rule);
            setIsEditing(true);
        } else {
            setCurrentRule({
                title: '',
                description: '',
                category: 'booking',
                type: 'info',
                amount: 0,
                icon: 'info',
                isActive: true
            });
            setIsEditing(false);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentRule({});
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            if (isEditing && currentRule._id) {
                await axiosInstance.put(`${API_ROUTES.RULES.BASE}/${currentRule._id}`, currentRule);
                toast.success('Rule updated successfully');
            } else {
                await axiosInstance.post(API_ROUTES.RULES.BASE, currentRule);
                toast.success('Rule created successfully');
            }
            fetchRules();
            handleClose();
        } catch {
            toast.error('Failed to save rule');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this rule?')) {
            try {
                await axiosInstance.delete(`${API_ROUTES.RULES.BASE}/${id}`);
                toast.success('Rule deleted successfully');
                fetchRules();
            } catch {
                toast.error('Failed to delete rule');
            }
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Rules & Policies Management</h1>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={() => handleOpen()}
                    sx={{ backgroundColor: '#2563eb', '&:hover': { backgroundColor: '#1d4ed8' } }}
                >
                    Add New Rule
                </Button>
            </div>

            <TableContainer component={Paper} className="shadow-sm border rounded-xl overflow-hidden">
                <Table>
                    <TableHead className="bg-gray-50">
                        <TableRow>
                            <TableCell className="font-bold">Title</TableCell>
                            <TableCell className="font-bold">Category</TableCell>
                            <TableCell className="font-bold">Type</TableCell>
                            <TableCell className="font-bold">Amount</TableCell>
                            <TableCell className="font-bold">Description</TableCell>
                            <TableCell className="font-bold text-right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rules.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((rule) => (
                            <TableRow key={rule._id} hover>
                                <TableCell className="font-medium text-gray-900">{rule.title}</TableCell>
                                <TableCell>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${rule.category === 'booking' ? 'bg-blue-100 text-blue-700' :
                                        rule.category === 'rental' ? 'bg-purple-100 text-purple-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {rule.category}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="capitalize text-sm text-gray-600">{rule.type}</span>
                                </TableCell>
                                <TableCell>
                                    {rule.amount ? <span className="text-red-600 font-bold">${rule.amount}</span> : '-'}
                                </TableCell>

                                <TableCell className="text-gray-500 max-w-md truncate" title={rule.description}>
                                    {rule.description}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleOpen(rule)} size="small" className="text-blue-600">
                                        <Edit size={18} />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(rule._id)} size="small" className="text-red-500 hover:bg-red-50">
                                        <Trash size={18} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={rules.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle className="font-bold border-b">
                    {isEditing ? 'Edit Rule' : 'Create New Rule'}
                </DialogTitle>
                <DialogContent className="space-y-4 pt-6 mt-4">
                    <TextField
                        label="Rule Title"
                        fullWidth
                        value={currentRule.title}
                        onChange={(e) => setCurrentRule({ ...currentRule, title: e.target.value })}
                        variant="outlined"
                    />

                    <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={currentRule.category}
                            label="Category"
                            onChange={(e) => setCurrentRule({ ...currentRule, category: e.target.value })}
                        >
                            <MenuItem value="booking">Booking</MenuItem>
                            <MenuItem value="rental">Rental</MenuItem>
                            <MenuItem value="general">General</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Rule Type</InputLabel>
                        <Select
                            value={currentRule.type}
                            label="Rule Type"
                            onChange={(e) => setCurrentRule({ ...currentRule, type: e.target.value  })}
                        >
                            <MenuItem value="info">Information</MenuItem>
                            <MenuItem value="reschedule">Reschedule</MenuItem>
                            <MenuItem value="cancel">Cancellation</MenuItem>
                            <MenuItem value="fine">Fine / Penalty</MenuItem>
                        </Select>
                    </FormControl>

                    {currentRule.type === 'fine' && (
                        <TextField
                            label="Fine Amount ($)"
                            type="number"
                            fullWidth
                            value={currentRule.amount}
                            onChange={(e) => setCurrentRule({ ...currentRule, amount: Number(e.target.value) })}
                            variant="outlined"
                        />
                    )}

                    <FormControl fullWidth>
                        <InputLabel>Icon</InputLabel>
                        <Select
                            value={currentRule.icon}
                            label="Icon"
                            onChange={(e) => setCurrentRule({ ...currentRule, icon: e.target.value })}
                        >
                            <MenuItem value="info">Info (Default)</MenuItem>
                            <MenuItem value="clock">Clock</MenuItem>
                            <MenuItem value="shield">Shield</MenuItem>
                            <MenuItem value="alert">Alert</MenuItem>
                            <MenuItem value="credit card">Credit Card</MenuItem>
                            <MenuItem value="check circle">Check Circle</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        value={currentRule.description}
                        onChange={(e) => setCurrentRule({ ...currentRule, description: e.target.value })}
                        variant="outlined"
                        placeholder="Enter the full text of the policy..."
                    />
                </DialogContent>
                <DialogActions className="p-4 border-t bg-gray-50">
                    <Button onClick={handleClose} color="inherit">Cancel</Button>
                    <Button onClick={handleSave} variant="contained" disabled={!currentRule.title || !currentRule.description}>
                        Save Rule
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
