import { api } from './client';
import type { ApiResponse } from '../types/api';
import type { Task } from '../types/task';
import type { Priority, SortKey, StatusFilter } from '../constants';

export async function createTask(input: { title: string; content: string; dueDate: number; priority: Priority; }) {
  const res = await api.post<ApiResponse<{ task: Task }>>('/tasks/new', input);
  return res.data;
}

export async function getTasks(params: { status?: StatusFilter; sortBy?: SortKey; limit?: number; skip?: number; }) {
  const res = await api.get<ApiResponse<{ tasks: Task[]; meta?: any }>>('/tasks/content', { params });
  return res.data;
}

export async function getSize(status: StatusFilter) {
  const res = await api.get<ApiResponse<{ count: number }>>('/tasks/size', { params: { status } });
  return res.data;
}

export async function updateStatus(id: string, newStatus: Task['status']) {
  const res = await api.put<ApiResponse<{}>>('/tasks/status', null, { params: { id, status: newStatus } });
  return res.data;
}

export async function updatePriority(id: string, newPriority: Priority) {
  const res = await api.put<ApiResponse<{}>>('/tasks/priority', null, { params: { id, priority: newPriority } });
  return res.data;
}

export async function deleteTask(id: string) {
  const res = await api.delete<ApiResponse<{ left: number }>>('/tasks', { params: { id } });
  return res.data;
}
