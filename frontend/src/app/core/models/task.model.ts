
export type TaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export type TaskPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  createdBy: string;
  assignedTo: string;

  assignee: {
    id: string;
    name: string;
    profilePicture?: string | null;
  } | null;

  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  search?: string;
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  assignedTo: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
}

// Temporary alias to avoid breaking components
// that still import TaskItem.
export type TaskItem = Task;
