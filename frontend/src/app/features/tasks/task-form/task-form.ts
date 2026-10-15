
import { Component, OnInit, inject, ChangeDetectorRef , Output, EventEmitter, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DashboardService, Employee } from '../../dashboard/dashboard';
import { TaskService, CreateTaskRequest } from '../../../core/services/task';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
})
export class TaskForm implements OnInit {
  private dashboardService = inject(DashboardService);
  private taskService = inject(TaskService);
  private cdr = inject(ChangeDetectorRef);
  
  
  @Output() cancel =new EventEmitter<void>();

  cancelCreateTask():void{
    this.cancel.emit();
  }

  employees: Employee[] = [];
  isLoadingEmployees = false;
  isSubmitting = false;

  errorMessage = '';
  successMessage = '';

  task = {
    title: '',
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    assignedTo: '',
    dueDate: '',
  };

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoadingEmployees = true;
    this.errorMessage = '';

    this.dashboardService
      .getEmployees(1, 100, '', '', 'active', 'name', 'asc')
      .subscribe({
        next: (response) => {
          this.employees = response.data.filter(
            (employee) => employee.isActive
          );

          this.isLoadingEmployees = false;
          this.cdr.detectChanges();
        },
        error: (error: unknown) => {
          console.error('Failed to load employees:', error);
          this.errorMessage = 'Unable to load employees.';
          this.isLoadingEmployees = false;
          this.cdr.detectChanges();
        },
      });
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.isSubmitting) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;

    const taskData: CreateTaskRequest = {
      title: this.task.title.trim(),
      description: this.task.description.trim(),
      priority: this.task.priority,
      assignedTo: this.task.assignedTo,
      ...(this.task.dueDate ? { dueDate: this.task.dueDate } : {}),
    };

    this.taskService.createTask(taskData).subscribe({
      next: () => {
        this.successMessage = 'Task created successfully.';

        this.task = {
          title: '',
          description: '',
          priority: 'MEDIUM',
          assignedTo: '',
          dueDate: '',
        };

        form.resetForm(this.task);
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        console.error('Failed to create task:', error);

        this.errorMessage =
          error instanceof HttpErrorResponse
            ? error.error?.message || 'Unable to create task.'
            : 'Unable to create task.';

        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
    });
  }
}