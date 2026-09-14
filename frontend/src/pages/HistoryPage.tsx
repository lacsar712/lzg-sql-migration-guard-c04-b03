import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Chip,
  Link,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useApi } from '../api/client';

const PAGE_SIZE = 20;
const DIALECTS = [
  'postgresql',
  'mysql',
  'mariadb',
  'sqlite',
  'transactsql',
];

export default function HistoryPage() {
  const api = useApi();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [dialect, setDialect] = useState('');
  const [ok, setOk] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .history({
        dialect: dialect || undefined,
        ok: ok === '' ? undefined : ok === 'true',
        page,
        pageSize: PAGE_SIZE,
      })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items || []);
        setTotal(res.total || 0);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialect, ok, page]);

  // 筛选条件变化时回到第一页，避免停留在超出范围的页码
  const changeFilter = (next: { dialect?: string; ok?: string }) => {
    setPage(1);
    if (next.dialect !== undefined) setDialect(next.dialect);
    if (next.ok !== undefined) setOk(next.ok);
  };

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        历史记录
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Stack direction="row" spacing={2}>
        <TextField
          select
          size="small"
          label="方言"
          value={dialect}
          onChange={(e) => changeFilter({ dialect: e.target.value })}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">全部方言</MenuItem>
          {DIALECTS.map((d) => (
            <MenuItem key={d} value={d}>
              {d}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="结果"
          value={ok}
          onChange={(e) => changeFilter({ ok: e.target.value })}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">全部结果</MenuItem>
          <MenuItem value="true">ok</MenuItem>
          <MenuItem value="false">fail</MenuItem>
        </TextField>
        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
          共 {total} 条
        </Typography>
      </Stack>
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>时间</TableCell>
              <TableCell>方言</TableCell>
              <TableCell>摘要</TableCell>
              <TableCell>结果</TableCell>
              <TableCell>findings</TableCell>
              <TableCell>用户</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>
                  {new Date(item.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>{item.dialect}</TableCell>
                <TableCell>
                  <Link component={RouterLink} to={`/history/${item.id}`}>
                    {item.sqlSummary}
                  </Link>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={item.ok ? 'ok' : 'fail'}
                    color={item.ok ? 'success' : 'error'}
                  />
                </TableCell>
                <TableCell>{item.findingCount}</TableCell>
                <TableCell>{item.username || '-'}</TableCell>
              </TableRow>
            ))}
            {!loading && !items.length && (
              <TableRow>
                <TableCell colSpan={6}>暂无历史</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
      {pageCount > 1 && (
        <Stack direction="row" justifyContent="flex-end">
          <Pagination
            count={pageCount}
            page={page}
            color="primary"
            onChange={(_, value) => setPage(value)}
          />
        </Stack>
      )}
    </Stack>
  );
}
