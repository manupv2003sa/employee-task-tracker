
import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskItem, TaskService } from '../../../core/services/task';
import { TaskForm } from '../task-form/task-form'; 

import { ToastService } from '../../../core/services/toast';


@Component({
  imports: [FormsModule, CommonModule,TaskForm],
  standalone: true,
  selector: 'app-task-list',
  styleUrl: './task-list.scss',
  templateUrl: './task-list.html',
})
export class TaskList implements OnInit {
  private taskService = inject(TaskService);
  private cdr = inject(ChangeDetectorRef);
  private toastService = inject (ToastService);


  tasks: TaskItem[] = [];
  loading = false;
  errorMessage = '';

  search = '';
  status = '';
  priority = '';
  sortBy = 'createdAt';
  order: 'asc' | 'desc' = 'desc';


  showCreateForm =false;
  selectedTask: TaskItem | null = null;

  openCreateTask():void{
    this.showCreateForm=true;
    this.selectedTask=null;
  }

  closeCreateTask() :void {
    this.showCreateForm=false;
    this.selectedTask =null;

  }

  openEditTask(task: TaskItem): void {
    this.selectedTask = task;
    this.showCreateForm = true;
  }

  onTaskSaved(): void {
    this.showCreateForm = false;
    this.selectedTask = null;
    this.loadTasks();
  }

  private readonly priorityRank: Record<string, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
  };

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.errorMessage = '';

    this.taskService.getTasks().subscribe({
      next: (response) => {
        this.tasks = response.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.toastService.success(error.error?.message || 'Failed to load tasks.');

        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get filteredTasks(): TaskItem[] {
    const term = this.search.trim().toLowerCase();

    const result = this.tasks.filter((task) => {
      const matchesSearch =
        !term || task.title.toLowerCase().includes(term) || (task.description ?? '').toLowerCase().includes(term);

      const matchesStatus = !this.status || task.status === this.status;

      const matchesPriority =
        !this.priority || task.priority === this.priority;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    const direction = this.order === 'asc' ? 1 : -1;

    return result.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;

        case 'priority':
          comparison =
            this.priorityRank[a.priority] -
            this.priorityRank[b.priority];
          break;

        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;

        case 'dueDate':
          comparison = this.compareDates(a.dueDate, b.dueDate);
          break;

        case 'createdAt':
        default:
          comparison = this.compareDates(a.createdAt, b.createdAt);
          break;
      }

      return comparison * direction;
    });
  }

  get sortLabel(): string {
    const labels: Record<string, string> = {
      createdAt: 'Date Created',
      dueDate: 'Due Date',
      title: 'Task Title',
      priority: 'Priority',
      status: 'Status',
    };

    return labels[this.sortBy] ?? 'Date Created';
  }

  private compareDates(
    first: string | null,
    second: string | null,
  ): number {
    // Keep tasks without dates at the bottom in either direction.
    if (!first && !second) return 0;
    if (!first) return 1;
    if (!second) return -1;

    return new Date(first).getTime() - new Date(second).getTime();
  }

  private startOfDay(value: string | Date): number {
    const date = new Date(value);

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ).getTime();
  }

  getDueDateClass(dueDate: string | null): string {
    if (!dueDate) return 'due-none';

    const due = this.startOfDay(dueDate);
    const today = this.startOfDay(new Date());

    if (due < today) return 'due-overdue';
    if (due === today) return 'due-today';

    return 'due-upcoming';
  }

  getDueDateLabel(dueDate: string | null): string {
    if (!dueDate) return 'Not set';

    const due = this.startOfDay(dueDate);
    const today = this.startOfDay(new Date());

    if (due < today) return 'Overdue';
    if (due === today) return 'Due today';

    const days = Math.round(
      (due - today) / (24 * 60 * 60 * 1000),
    );

    return days === 1 ? 'Tomorrow' : `In ${days} days`;
  }

 
  clearFilters(): void {
    this.search = '';
    this.status = '';
    this.priority = '';
    this.sortBy = 'createdAt';
    this.order = 'desc';
  }
}
