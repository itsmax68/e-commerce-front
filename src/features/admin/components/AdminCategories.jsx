import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { toast } from 'react-toastify';
import { axiosi } from '../../../config/axios';
import { useTheme } from '@mui/material/styles';

export const AdminCategories = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosi.get('/categories');
      setCategories(res.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const header = useMemo(() => {
    return (
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
      >
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight={900}>
            Categories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add, edit and delete categories
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'stretch', md: 'flex-end' }}>
          <TextField
            size="small"
            label="New category"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={async () => {
              const name = newName.trim();
              if (!name) return toast.error('Category name is required');
              try {
                await axiosi.post('/categories', { name });
                setNewName('');
                toast.success('Category added');
                await fetchCategories();
              } catch (error) {
                toast.error(error?.response?.data?.message || 'Failed to add category');
              }
            }}
          >
            Add
          </Button>
        </Stack>
      </Stack>
    );
  }, [newName]);

  const startEdit = (c) => {
    setEditId(c._id);
    setEditName(c.name || '');
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName('');
  };

  const saveEdit = async () => {
    const name = editName.trim();
    if (!name) return toast.error('Category name is required');
    try {
      await axiosi.patch(`/categories/${editId}`, { name });
      toast.success('Category updated');
      cancelEdit();
      await fetchCategories();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this category?');
    if (!ok) return;
    try {
      await axiosi.delete(`/categories/${id}`);
      toast.success('Category deleted');
      await fetchCategories();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <Stack spacing={2}>
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.85)' }}>
        {header}
      </Paper>

      <Box>
        {loading ? (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            Loading...
          </Typography>
        ) : (
          <TableContainer component={Paper} elevation={1}>
            <Table aria-label="categories table">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell align="left">Name</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((c, idx) => {
                  const isEditing = editId === c._id;
                  return (
                    <TableRow key={c._id} hover>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell align="left">
                        {isEditing ? (
                          <TextField size="small" value={editName} onChange={(e) => setEditName(e.target.value)} />
                        ) : (
                          c.name
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {isEditing ? (
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              variant="contained"
                              size="small"
                              sx={{ bgcolor: theme.palette.primary.main }}
                              onClick={saveEdit}
                            >
                              Save
                            </Button>
                            <Button variant="outlined" size="small" onClick={cancelEdit} color="inherit">
                              Cancel
                            </Button>
                          </Stack>
                        ) : (
                          <Stack direction="row" spacing={0}>
                            <IconButton onClick={() => startEdit(c)} aria-label="edit category">
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(c._id)} aria-label="delete category">
                              <DeleteOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!categories.length && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No categories found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Stack>
  );
};

