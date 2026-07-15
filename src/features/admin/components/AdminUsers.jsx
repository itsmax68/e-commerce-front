import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { axiosi } from '../../../config/axios';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    isVerified: false,
    isAdmin: false,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosi.get('/users');
      setUsers(res.data || []);
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to fetch users';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (user) => {
    setEditId(user._id);
    setForm({
      name: user.name || '',
      email: user.email || '',
      isVerified: !!user.isVerified,
      isAdmin: !!user.isAdmin,
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ name: '', email: '', isVerified: false, isAdmin: false });
  };

  const handleSave = async () => {
    try {
      await axiosi.patch(`/users/${editId}`, form);
      toast.success('User updated');
      cancelEdit();
      await fetchUsers();
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to update user';
      toast.error(message);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this user?');
    if (!ok) return;

    try {
      await axiosi.delete(`/users/${id}`);
      toast.success('User deleted');
      await fetchUsers();
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to delete user';
      toast.error(message);
    }
  };

  const verifiedChip = (isVerified) => (
    <Chip
      size="small"
      variant="outlined"
      label={isVerified ? 'Verified' : 'Not verified'}
      color={isVerified ? 'success' : 'default'}
    />
  );

  const adminChip = (isAdmin) => (
    <Chip
      size="small"
      variant="outlined"
      label={isAdmin ? 'Admin' : 'User'}
      color={isAdmin ? 'primary' : 'default'}
    />
  );

  const content = useMemo(() => {
    if (loading) {
      return (
        <Stack p={4} justifyContent="center" alignItems="center">
          <Typography variant="h6">Loading users...</Typography>
        </Stack>
      );
    }

    if (!users.length) {
      return (
        <Stack p={4} justifyContent="center" alignItems="center">
          <Typography variant="h6">No users found</Typography>
        </Stack>
      );
    }

    return (
      <TableContainer component={Paper} elevation={2}>
        <Table aria-label="users table">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell align="left">Name</TableCell>
              <TableCell align="left">Email</TableCell>
              <TableCell align="left">Verified</TableCell>
              <TableCell align="left">Admin</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, index) => {
              const isEditing = editId === user._id;
              return (
                <TableRow key={user._id} hover>
                  <TableCell component="th" scope="row">
                    {index + 1}
                  </TableCell>

                  <TableCell align="left" sx={{ width: 220 }}>
                    {isEditing ? (
                      <TextField
                        size="small"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    ) : (
                      user.name
                    )}
                  </TableCell>

                  <TableCell align="left" sx={{ width: 280 }}>
                    {isEditing ? (
                      <TextField
                        size="small"
                        value={form.email}
                        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      />
                    ) : (
                      user.email
                    )}
                  </TableCell>

                  <TableCell align="left" sx={{ width: 180 }}>
                    {isEditing ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Switch
                          checked={form.isVerified}
                          onChange={(e) => setForm((prev) => ({ ...prev, isVerified: e.target.checked }))}
                        />
                        <Typography variant="body2">{form.isVerified ? 'Yes' : 'No'}</Typography>
                      </Stack>
                    ) : (
                      verifiedChip(user.isVerified)
                    )}
                  </TableCell>

                  <TableCell align="left" sx={{ width: 140 }}>
                    {isEditing ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Switch
                          checked={form.isAdmin}
                          onChange={(e) => setForm((prev) => ({ ...prev, isAdmin: e.target.checked }))}
                        />
                        <Typography variant="body2">{form.isAdmin ? 'Yes' : 'No'}</Typography>
                      </Stack>
                    ) : (
                      adminChip(user.isAdmin)
                    )}
                  </TableCell>

                  <TableCell align="right" sx={{ width: 240 }}>
                    {isEditing ? (
                      <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <Button variant="contained" size="small" onClick={handleSave}>
                          Save
                        </Button>
                        <Button variant="outlined" size="small" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      </Stack>
                    ) : (
                      <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <IconButton onClick={() => startEdit(user)} aria-label="edit user">
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(user._id)} aria-label="delete user">
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }, [loading, users, editId, form]);

  return <Stack p={3}>{content}</Stack>;
};

