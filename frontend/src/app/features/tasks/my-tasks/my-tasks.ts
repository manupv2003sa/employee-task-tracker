import { Component, OnInit, inject ,ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {  TaskService } from '../task.service';
import { Task } from '../../../core/models/task.model';
import {ExcelExportService} from '../../../core/services/excel-export';

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-tasks.html',
  styleUrl: './my-tasks.scss',
})
export class MyTasks implements OnInit {
  private taskService = inject(TaskService);
  private cdr =inject(ChangeDetectorRef);
  private excelExportService = inject(ExcelExportService);

  tasks: Task[] = [];

  loading = false;
  updatingTaskId: string | null = null;

  errorMessage = '';
  successMessage = '';

  statusFilter: '' | Task['status'] = '';

  ngOnInit(): void {
    this.loadMyTasks();
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
}
