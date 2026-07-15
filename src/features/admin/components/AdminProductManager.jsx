import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ProductCard } from '../../products/components/ProductCard';
import {
  deleteProductByIdAsync,
  fetchProductsAsync,
  selectProductFetchStatus,
  selectProducts,
  selectProductTotalResults,
} from '../../products/ProductSlice';
import { fetchAllCategoriesAsync, selectCategories } from '../../categories/CategoriesSlice';
import { ITEMS_PER_PAGE } from '../../../constants';

export const AdminProductManager = () => {
  const dispatch = useDispatch();

  const categories = useSelector(selectCategories);
  const products = useSelector(selectProducts);
  const totalResults = useSelector(selectProductTotalResults);
  const productFetchStatus = useSelector(selectProductFetchStatus);

  const [categoryId, setCategoryId] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    // Populate categories dropdown.
    dispatch(fetchAllCategoriesAsync());
  }, [dispatch]);

  useEffect(() => {
    setPage(1);
  }, [categoryId]);

  useEffect(() => {
    const filters = {
      pagination: { page, limit: ITEMS_PER_PAGE },
    };

    if (categoryId !== 'all') {
      filters.category = [categoryId];
    }

    dispatch(fetchProductsAsync(filters));
  }, [dispatch, categoryId, page]);

  const emptyState = useMemo(() => {
    if (productFetchStatus === 'pending') return null;
    if (!products?.length) return 'No products found for the selected category.';
    return null;
  }, [productFetchStatus, products]);

  const handleDelete = async (productId) => {
    if (
      !window.confirm(
        'Delete this product permanently? It will be removed from the database and cannot be undone.'
      )
    ) {
      return;
    }
    try {
      const actionResult = dispatch(deleteProductByIdAsync(productId));
      if (typeof actionResult?.unwrap === 'function') {
        await actionResult.unwrap();
      } else {
        await actionResult;
      }
      toast.success('Product deleted permanently');
      const filters = {
        pagination: { page, limit: ITEMS_PER_PAGE },
      };
      if (categoryId !== 'all') {
        filters.category = [categoryId];
      }
      dispatch(fetchProductsAsync(filters));
    } catch (e) {
      const msg = e?.message || e?.response?.data?.message || 'Failed to delete product';
      toast.error(msg);
    }
  };

  return (
    <Stack spacing={2} p={{ xs: 1.25, md: 2 }} sx={{ pb: 5 }}>
      {/* Header (no border) */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        sx={{
          px: { xs: 1.25, md: 2 },
          py: 1.5,
          borderRadius: 3,
          bgcolor: 'rgba(255,255,255,0.85)',
          boxShadow: 1,
          backdropFilter: 'blur(8px)',
        }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight={900}>
            Products
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Filter by category and manage products
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ width: { xs: '100%', md: 'auto' } }}>
          <FormControl size="small" sx={{ minWidth: 240 }}>
            <InputLabel id="admin-product-category-label">Category</InputLabel>
            <Select
              labelId="admin-product-category-label"
              value={categoryId}
              label="Category"
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <MenuItem value="all">All categories</MenuItem>
              {categories?.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" component={Link} to="/admin/add-product" sx={{ whiteSpace: 'nowrap' }}>
            Add Product
          </Button>
        </Stack>
      </Stack>

      {/* Products */}
      {emptyState ? (
        <Stack
          sx={{
            borderRadius: 3,
            bgcolor: 'rgba(255,255,255,0.7)',
            p: 3,
          }}
          alignItems="center"
        >
          <Typography color="text.secondary">{emptyState}</Typography>
        </Stack>
      ) : (
        <Grid container spacing={2}>
          {(products || []).map((product) => (
            <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
              <Stack>
                <ProductCard
                  id={product._id}
                  title={product.title}
                  thumbnail={product.thumbnail}
                  brand={product.brand?.name}
                  price={product.price}
                  stockQuantity={product.stockQuantity}
                  isAdminCard={true}
                />

                <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
                  <Button
                    component={Link}
                    to={`/admin/product-update/${product._id}`}
                    size="small"
                    variant="contained"
                  >
                    Update
                  </Button>

                  <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(product._id)}>
                    Delete
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ pt: 2 }}>
        <Pagination
          size="small"
          page={page}
          onChange={(e, newPage) => setPage(newPage)}
          count={Math.max(Math.ceil(totalResults / ITEMS_PER_PAGE), 1)}
          variant="outlined"
          shape="rounded"
        />
      </Stack>

      <Typography variant="caption" color="text.secondary">
        Showing {(page - 1) * ITEMS_PER_PAGE + 1} to{' '}
        {Math.min(page * ITEMS_PER_PAGE, totalResults)} of {totalResults} results
      </Typography>
    </Stack>
  );
};

