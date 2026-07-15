import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Grid, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { ProductCard } from '../../products/components/ProductCard';
import { fetchAllCategoriesAsync, selectCategories } from '../../categories/CategoriesSlice';
import { fetchProducts } from '../../products/ProductApi';
import { Link } from 'react-router-dom';

export const CategoryCollections = () => {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);

  const theme = useTheme();
  const is600 = useMediaQuery(theme.breakpoints.down(600));

  const topCategories = useMemo(() => (categories || []).slice(0, 4), [categories]);
  const [loadingMap, setLoadingMap] = useState({});
  const [collectionMap, setCollectionMap] = useState({});

  useEffect(() => {
    dispatch(fetchAllCategoriesAsync());
  }, [dispatch]);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (!topCategories.length) return;

      // Fetch products per category (small limits for fast UI).
      setLoadingMap((prev) => {
        const next = { ...prev };
        topCategories.forEach((c) => {
          next[c._id] = true;
        });
        return next;
      });

      const results = await Promise.all(
        topCategories.map(async (cat) => {
          const res = await fetchProducts({
            category: [cat._id],
            pagination: { page: 1, limit: is600 ? 3 : 6 },
            user: true, // only non-deleted products
          });
          return { catId: cat._id, products: res.data || [] };
        })
      );

      if (!alive) return;
      const nextMap = {};
      results.forEach(({ catId, products }) => {
        nextMap[catId] = products;
      });
      setCollectionMap(nextMap);
      setLoadingMap({});
    };

    run();

    return () => {
      alive = false;
    };
  }, [topCategories, is600]);

  if (!topCategories.length) {
    return (
      <Paper sx={{ p: 2.5, borderRadius: 4, mt: 2, backgroundColor: '#fff' }}>
        <Typography color="text.secondary">Loading collections...</Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={3} sx={{ mt: 4, mb: 4 }}>
      {topCategories.map((cat) => (
        <Stack key={cat._id} spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1 }}>
            <Typography variant="h5" fontWeight={900}>
              {cat.name}
            </Typography>
            <Button size="small" variant="outlined" component={Link} to="/">
              Shop All
            </Button>
          </Stack>

          <Box sx={{ overflowX: 'auto', px: 1 }}>
            <Grid
              container
              spacing={2}
              wrap="nowrap"
              sx={{
                flexWrap: 'nowrap',
                minWidth: 'max-content',
              }}
            >
              {(loadingMap[cat._id] ? Array.from({ length: is600 ? 3 : 6 }) : collectionMap[cat._id] || []).map(
                (p, idx) => {
                  if (!p) {
                    return (
                      <Grid item key={`sk-${cat._id}-${idx}`}>
                        <Paper sx={{ width: is600 ? 170 : 210, height: 260, bgcolor: '#f3f4f6' }} />
                      </Grid>
                    );
                  }

                  return (
                    <Grid item key={p._id}>
                      <ProductCard
                        id={p._id}
                        title={p.title}
                        thumbnail={p.thumbnail}
                        brand={p.brand?.name}
                        price={p.price}
                        stockQuantity={p.stockQuantity}
                        isAdminCard={false}
                        isWishlistCard={false}
                      />
                    </Grid>
                  );
                }
              )}
            </Grid>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
};

