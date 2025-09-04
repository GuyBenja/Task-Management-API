import type { Priority } from '../constants/index';

export type Task = {
  id: string;
  title: string;
  content: string;
  dueDate: number;       // epoch ms
  priority: Priority;
  status: 'PENDING' | 'LATE' | 'DONE';
};
