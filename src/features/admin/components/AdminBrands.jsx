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

export const AdminBrands = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);

  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await axiosi.get('/brands');
      setBrands(res.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
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
            Brands
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add, edit and delete brands
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'stretch', md: 'flex-end' }}>
          <TextField
            size="small"
            label="New brand"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={async () => {
              const name = newName.trim();
              if (!name) return toast.error('Brand name is required');
              try {
                await axiosi.post('/brands', { name });
                setNewName('');
                toast.success('Brand added');
                await fetchBrands();
              } catch (error) {
                toast.error(error?.response?.data?.message || 'Failed to add brand');
              }
            }}
          >
            Add
          </Button>
        </Stack>
      </Stack>
    );
  }, [newName]);

  const startEdit = (b) => {
    setEditId(b._id);
    setEditName(b.name || '');
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName('');
  };

  const saveEdit = async () => {
    const name = editName.trim();
    if (!name) return toast.error('Brand name is required');
    try {
      await axiosi.patch(`/brands/${editId}`, { name });
      toast.success('Brand updated');
      cancelEdit();
      await fetchBrands();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update brand');
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this brand?');
    if (!ok) return;
    try {
      await axiosi.delete(`/brands/${id}`);
      toast.success('Brand deleted');
      await fetchBrands();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete brand');
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
            <Table aria-label="brands table">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell align="left">Name</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {brands.map((b, idx) => {
                  const isEditing = editId === b._id;
                  return (
                    <TableRow key={b._id} hover>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell align="left">
                        {isEditing ? (
                          <TextField size="small" value={editName} onChange={(e) => setEditName(e.target.value)} />
                        ) : (
                          b.name
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
                            <IconButton onClick={() => startEdit(b)} aria-label="edit brand">
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(b._id)} aria-label="delete brand">
                              <DeleteOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!brands.length && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No brands found.
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

