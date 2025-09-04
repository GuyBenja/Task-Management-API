export const PRIORITIES = ['LOW','MID','HIGH'] as const;
export const STATUSES = ['ALL','PENDING','LATE','DONE'] as const;
export const SORTS = ['id','dueDate','title','priority','status'] as const;

export type Priority = typeof PRIORITIES[number];
export type StatusFilter = typeof STATUSES[number];
export type SortKey = typeof SORTS[number];
