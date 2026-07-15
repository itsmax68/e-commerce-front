import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrdersAsync, selectOrders } from '../../order/OrderSlice';
import { selectCategories, fetchAllCategoriesAsync } from '../../categories/CategoriesSlice';
import { axiosi } from '../../../config/axios';
import { fetchProducts } from '../../products/ProductApi';

const STATUS_COLORS = {
  Pending: { bg: '#ede7ff', fg: '#5b35b6' },
  Dispatched: { bg: '#fff2c2', fg: '#7a5a00' },
  'Out for delivery': { bg: '#dff5ff', fg: '#1f6f8b' },
  Delivered: { bg: '#dbffe8', fg: '#0b6b2f' },
  Cancelled: { bg: '#ffe0e0', fg: '#b42318' },
};

function formatMoney(n) {
  const num = Number(n || 0);
  return num.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const svgSize = { w: 720, h: 220, pad: 32 };

export const AdminStats = () => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const orders = useSelector(selectOrders);
  const categories = useSelector(selectCategories);

  const [loading, setLoading] = useState(true);
  const [usersCount, setUsersCount] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState([]);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        setLoading(true);

        // Fetch in parallel where possible.
        const [usersRes, productsRes] = await Promise.all([
          axiosi.get('/users'),
          fetchProducts({ pagination: { page: 1, limit: 1 } }),
        ]);

        if (!alive) return;
        setUsersCount((usersRes.data || []).length);
        setTotalProducts(Number(productsRes.totalResults || 0));

        // Orders + categories via redux
        dispatch(getAllOrdersAsync());
        dispatch(fetchAllCategoriesAsync());

        // Category distribution (counts via X-Total-Count).
        const cats = categories?.length ? categories : [];
        if (cats.length) {
          const counts = [];
          for (const cat of cats) {
            // Keep it simple: ask only page=1,limit=1 and read totalResults.
            const res = await fetchProducts({
              category: [cat._id],
              pagination: { page: 1, limit: 1 },
            });
            counts.push({ category: cat.name, count: Number(res.totalResults || 0) });
          }
          if (alive) setCategoryCounts(counts.sort((a, b) => b.count - a.count).slice(0, 6));
        } else {
          setCategoryCounts([]);
        }
      } catch (e) {
        // If something fails, still allow dashboard to render partial data.
        // eslint-disable-next-line no-console
        console.log(e);
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After categories arrive, compute distribution.
  useEffect(() => {
    let alive = true;
    const compute = async () => {
      if (!categories?.length) return;
      try {
        setLoading(true);
        const counts = [];
        for (const cat of categories) {
          const res = await fetchProducts({
            category: [cat._id],
            pagination: { page: 1, limit: 1 },
          });
          counts.push({ category: cat.name, count: Number(res.totalResults || 0) });
        }
        if (alive) {
          setCategoryCounts(counts.sort((a, b) => b.count - a.count).slice(0, 6));
        }
      } finally {
        if (alive) setLoading(false);
      }
    };
    compute();
    return () => {
      alive = false;
    };
  }, [categories, dispatch]);

  const stats = useMemo(() => {
    const totalOrders = orders?.length || 0;
    const revenue = (orders || []).reduce((sum, o) => sum + Number(o.total || 0), 0);

    const statusCounts = {};
    for (const o of orders || []) {
      const s = o.status || 'Pending';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    }

    // Last 7 days revenue
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => addDays(today, -(6 - i)));
    const dayKey = (d) => d.toISOString().slice(0, 10);

    const revByDay = {};
    for (const d of days) revByDay[dayKey(d)] = 0;
    for (const o of orders || []) {
      const dt = o.createdAt ? new Date(o.createdAt) : null;
      if (!dt) continue;
      const key = dayKey(dt);
      if (key in revByDay) revByDay[key] += Number(o.total || 0);
    }

    const lineData = days.map((d) => ({
      key: dayKey(d),
      label: d.toLocaleDateString(undefined, { weekday: 'short' }),
      value: revByDay[dayKey(d)],
    }));

    const recentOrders = [...(orders || [])]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return { totalOrders, revenue, statusCounts, lineData, recentOrders };
  }, [orders]);

  const statusMax = useMemo(() => {
    const values = Object.values(stats.statusCounts || {});
    return values.length ? Math.max(...values) : 1;
  }, [stats.statusCounts]);

  const linePoints = useMemo(() => {
    const { w, h, pad } = svgSize;
    const values = stats.lineData.map((p) => p.value);
    const max = Math.max(...values, 0) || 1;
    const min = Math.min(...values, 0);

    const xStep = (w - pad * 2) / Math.max(stats.lineData.length - 1, 1);
    const y = (v) => {
      const t = (v - min) / (max - min || 1);
      return pad + (1 - t) * (h - pad * 2);
    };

    const pts = stats.lineData.map((p, i) => {
      const x = pad + i * xStep;
      const yy = y(p.value);
      return { x, y: yy, value: p.value };
    });

    const polyline = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const areaPath = `M ${pad},${h - pad} L ${polyline} L ${pad + (pts.length - 1) * xStep},${h - pad} Z`;

    return { pts, polyline, areaPath };
  }, [stats.lineData]);

  return (
    <Stack spacing={2} sx={{ px: { xs: 1.5, md: 2.5 }, py: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Admin Dashboard
          </Typography>
          <Typography color="text.secondary">
            Stats, trends, and quick management overview
          </Typography>
        </Box>
        <Paper
          elevation={0}
          sx={{
            px: 2,
            py: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Total Revenue
          </Typography>
          <Typography variant="h6" fontWeight={900}>
            {formatMoney(stats.revenue)}
          </Typography>
        </Paper>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography color="text.secondary">Total Products</Typography>
            <Typography variant="h5" fontWeight={900}>
              {loading ? '...' : totalProducts}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography color="text.secondary">Total Orders</Typography>
            <Typography variant="h5" fontWeight={900}>
              {stats.totalOrders}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography color="text.secondary">Total Users</Typography>
            <Typography variant="h5" fontWeight={900}>
              {loading ? '...' : usersCount}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography color="text.secondary">Revenue (all time)</Typography>
            <Typography variant="h5" fontWeight={900}>
              {formatMoney(stats.revenue)}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography fontWeight={800}>Revenue Trend (last 7 days)</Typography>
              <Typography variant="body2" color="text.secondary">
                {loading ? 'Loading...' : 'Based on order totals'}
              </Typography>
            </Stack>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ overflowX: 'auto' }}>
              <svg width="100%" viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}>
                <defs>
                  <linearGradient id="adminRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                  </linearGradient>
                </defs>

                {/* area */}
                <path d={linePoints.areaPath} fill="url(#adminRevenueGradient)" stroke="none" />
                {/* line */}
                <polyline points={linePoints.polyline} fill="none" stroke={theme.palette.primary.main} strokeWidth="3" />
                {linePoints.pts.map((p, idx) => (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.y} r="5" fill={theme.palette.primary.main} />
                  </g>
                ))}
              </svg>
            </Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
              {stats.lineData.map((p) => (
                <Typography key={p.key} variant="caption" color="text.secondary">
                  {p.label}
                </Typography>
              ))}
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography fontWeight={800}>Order Status</Typography>
              <Typography variant="body2" color="text.secondary">
                {orders?.length ? `${orders.length} orders` : '—'}
              </Typography>
            </Stack>
            <Divider sx={{ my: 1.5 }} />
            <Stack spacing={1} sx={{ mt: 0.5 }}>
              {Object.keys(STATUS_COLORS).map((status) => {
                const count = stats.statusCounts[status] || 0;
                const pct = Math.round((count / statusMax) * 100);
                const cfg = STATUS_COLORS[status];
                return (
                  <Stack key={status} spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">{status}</Typography>
                      <Typography variant="body2" fontWeight={800}>
                        {count}
                      </Typography>
                    </Stack>
                    <Box sx={{ height: 12, bgcolor: cfg.bg, borderRadius: 999, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: cfg.fg }} />
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography fontWeight={800}>Top Categories</Typography>
              <Typography variant="body2" color="text.secondary">
                {loading ? 'Loading...' : 'Products by category'}
              </Typography>
            </Stack>
            <Divider sx={{ my: 1.5 }} />
            {!categoryCounts.length ? (
              <Typography color="text.secondary">No category stats yet.</Typography>
            ) : (
              <Stack spacing={1}>
                {categoryCounts.map((c) => {
                  const max = Math.max(...categoryCounts.map((x) => x.count), 1);
                  const pct = Math.round((c.count / max) * 100);
                  return (
                    <Stack key={c.category} spacing={0.5}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>
                          {c.category}
                        </Typography>
                        <Typography variant="body2" fontWeight={800}>
                          {c.count}
                        </Typography>
                      </Stack>
                      <Box sx={{ height: 12, bgcolor: 'rgba(25,118,210,0.12)', borderRadius: 999, overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: theme.palette.primary.main }} />
                      </Box>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography fontWeight={800}>Recent Orders</Typography>
              <Typography variant="body2" color="text.secondary">
                Latest 5
              </Typography>
            </Stack>
            <Divider sx={{ my: 1.5 }} />
            {stats.recentOrders.length ? (
              <Stack spacing={1}>
                {stats.recentOrders.map((o) => (
                  <Stack
                    key={o._id}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 1.5, py: 1 }}
                  >
                    <Stack>
                      <Typography variant="body2" fontWeight={800}>
                        {o.paymentMode || 'Payment'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(o.createdAt).toLocaleString()}
                      </Typography>
                    </Stack>
                    <Stack alignItems="flex-end" spacing={0.25}>
                      <Typography variant="body2" fontWeight={900}>
                        {formatMoney(o.total)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Status: {o.status}
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">No orders yet.</Typography>
            )}
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};

