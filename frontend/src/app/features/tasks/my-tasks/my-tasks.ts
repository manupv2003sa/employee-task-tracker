import { Component, OnInit, inject ,ChangeDetectorRef, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {  TaskService } from '../task.service';
import { Task } from '../../../core/models/task.model';
import {ExcelExportService} from '../../../core/services/excel-export';

import { SocketService } from '../../../core/services/socket.service';
import { AuthService } from '../../auth/auth.service';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-tasks.html',
  styleUrl: './my-tasks.scss',
})
export class MyTasks implements OnInit,OnDestroy  {
  private taskService = inject(TaskService);
  private cdr =inject(ChangeDetectorRef);
  private excelExportService = inject(ExcelExportService);

  private socketService = inject(SocketService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  tasks: Task[] = [];

  loading = false;
  updatingTaskId: string | null = null;

  errorMessage = '';
  successMessage = '';

  statusFilter: '' | Task['status'] = '';

  ngOnInit(): void {

    const token = this.authService.getToken();

    if (token) {
      this.socketService.connect(token);
    }

    this.socketService.on<Task>('task:created', this.onTaskCreated);
    this.socketService.on<Task>('task:updated', this.onTaskUpdated);
    this.loadMyTasks();
  }

  ngOnDestroy(): void {
    this.socketService.off('task:created', this.onTaskCreated);
    this.socketService.off('task:updated', this.onTaskUpdated);
  }

  // Load tasks assigned to the logged-in user
  loadMyTasks(): void {
    this.loading = true;
    this.errorMessage = '';

    this.taskService.getMyTasks().subscribe({
      next: (response) => {
        this.tasks = response.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();

      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load your tasks.';
        this.loading = false;
        this.cdr.detectChanges();

      },
    });
  }

  get filteredTasks(): Task[] {
    return this.tasks.filter((task) => {
      return !this.statusFilter || task.status === this.statusFilter;
    });
  }

  // Task status counts
  get todoCount(): number {
    return this.tasks.filter(
      (task) => task.status === 'TODO'
    ).length;
  }

  get inProgressCount(): number {
    return this.tasks.filter(
      (task) => task.status === 'IN_PROGRESS'
    ).length;
  }

  get completedCount(): number {
    return this.tasks.filter(
      (task) => task.status === 'COMPLETED'
    ).length;
  }

  // Select a status filter
  setStatusFilter(status: '' | Task['status']): void {
    this.statusFilter = status;
  }

  // Update only the task status
  updateStatus(
    task: Task,
    newStatus: Task['status']
  ): void {
    if (
      task.status === newStatus ||
      this.updatingTaskId === task.id
    ) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.updatingTaskId = task.id;

    this.taskService
      .updateMyTaskStatus(task.id, newStatus)
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.tasks = this.tasks.map((item) =>
              item.id === task.id ? response.data! : item
            );
          }

          this.successMessage = response.message || 'Task status updated successfully.';

          this.updatingTaskId = null;
          this.cdr.detectChanges();

        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to update task status.';

          this.updatingTaskId = null;
          this.loadMyTasks();
          this.cdr.detectChanges();

        },
      });
  }

  exportTasksToExcel(): void {
    if (this.filteredTasks.length === 0) {
      this.errorMessage = 'No tasks available to export.';
      return;
    }

    this.errorMessage = '';
    this.excelExportService.exportTasks(
      this.filteredTasks,
      'my-tasks',
      false
    );
  }

  private onTaskCreated = (task: Task): void => {
    this.loadMyTasks();
  };

  private onTaskUpdated = (task: Task): void => {
    this.loadMyTasks();
  };
}
