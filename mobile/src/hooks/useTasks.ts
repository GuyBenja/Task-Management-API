import { useCallback, useEffect, useState } from 'react';
import { deleteTask, getSize, getTasks, updatePriority, updateStatus } from '../api/tasks';
import type { Task } from '../types/task';
import type { SortKey, StatusFilter } from '../constants';

export function useTasks(initial: { status: StatusFilter; sortBy: SortKey; pageSize?: number }) {
  const [status, setStatus] = useState<StatusFilter>(initial.status);
  const [sortBy, setSortBy] = useState<SortKey>(initial.sortBy);
  const pageSize = initial.pageSize ?? 10;

  const [data, setData] = useState<Task[]>([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [counts, setCounts] = useState<Record<string, number>>({ ALL: 0, PENDING: 0, LATE: 0, DONE: 0 });

  const loadCounts = useCallback(async () => {
    const [a, p, l, d] = await Promise.all([
      getSize('ALL'), getSize('PENDING'), getSize('LATE'), getSize('DONE')
    ]);
    setCounts({
      ALL: a.data?.count ?? 0,
      PENDING: p.data?.count ?? 0,
      LATE: l.data?.count ?? 0,
      DONE: d.data?.count ?? 0,
    });
  }, []);

  const loadPage = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const nextSkip = reset ? 0 : skip;
      const res = await getTasks({ status, sortBy, limit: pageSize, skip: nextSkip });
      const items = res.data?.tasks ?? [];
      const meta = res.data?.meta ?? { hasMore: false };
      setData(prev => reset ? items : [...prev, ...items]);
      setSkip(nextSkip + items.length);
      setHasMore(!!meta.hasMore);
    } finally {
      setLoading(false);
    }
  }, [status, sortBy, skip, pageSize]);

  useEffect(() => {
    setSkip(0);
    setHasMore(true);
    setData([]);
    loadCounts();
    loadPage(true);
  }, [status, sortBy]);

  const onDelete = useCallback(async (id: string) => {
    await deleteTask(id);
    setData(prev => prev.filter(t => t.id !== id));
    loadCounts();
  }, [loadCounts]);

  const onStatus = useCallback(async (id: string, s: Task['status']) => {
    await updateStatus(id, s);
    setData(prev => prev.map(t => t.id === id ? { ...t, status: s } : t));
    loadCounts();
  }, [loadCounts]);

  const onPriority = useCallback(async (id: string, p: Task['priority']) => {
    await updatePriority(id, p);
    setData(prev => prev.map(t => t.id === id ? { ...t, priority: p } : t));
  }, []);

  return {
    tasks: data, counts, status, sortBy, skip, hasMore, loading,
    setStatus, setSortBy, loadMore: () => hasMore && !loading && loadPage(false),
    refresh: () => loadPage(true),
    onDelete, onStatus, onPriority,
  };
}
