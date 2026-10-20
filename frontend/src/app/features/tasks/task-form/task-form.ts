
import { Component, OnInit, inject, ChangeDetectorRef , Output, EventEmitter,Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DashboardService, Employee } from '../../dashboard/dashboard';
import { TaskService, CreateTaskRequest, TaskItem ,UpdateTaskRequest} from '../task.service';
import { TaskList } from '../task-list/task-list';
import { ToastService } from '../../../core/services/toast';


@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
})
export class TaskForm implements OnInit,OnChanges {
  private dashboardService = inject(DashboardService);
  private taskService = inject(TaskService);
  private cdr = inject(ChangeDetectorRef);
  private toastService = inject (ToastService);

  

  @Input() selectedTask: TaskItem | null=null;
  @Output() saved =new EventEmitter();

  @Output() cancel =new EventEmitter<void>();


  get isEditMode(): boolean{
    return !!this.selectedTask
  }
  cancelCreateTask():void{
    console.log('Cancel button clicked');

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

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['selectedTask'] && this.selectedTask){
      this.task={
        title:this.selectedTask.title,
        description: this.selectedTask.description ??'',
        priority:this.selectedTask.priority,
        assignedTo:this.selectedTask.assignedTo,
        dueDate:this.selectedTask.dueDate ?? '',
      };
    }
  }

  loadEmployees(): void {
    this.isLoadingEmployees = true;
    this.errorMessage = '';

    this.dashboardService
      .getAssignableUsers()
      .subscribe({
        next: (response) => {
          this.employees = response.data

          this.isLoadingEmployees = false;
          this.cdr.detectChanges();
        },
        error: (error: unknown) => {
          console.error('Failed to load employees:', error);
            this.toastService.error('Unable to load employees.');
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
    //ternary
    const request = 
          this.isEditMode && this.selectedTask 
          ? this.taskService.updateTask(this.selectedTask.id,taskData) 
          : this.taskService.createTask(taskData);

    request.subscribe({
      next:()=> {
          this.toastService.success(this.isEditMode ? 'Task updated successfully' : "Task created successfully");

        this.isSubmitting=false;
        this.cdr.detectChanges();

        this.saved.emit();

        if(!this.isEditMode){
          this.task = {
            title: '',
            description: '',
            priority: 'MEDIUM',
            assignedTo: '',
            dueDate: '',
          };

        form.resetForm(this.task);
        }

      },
      error:(error:unknown)=>{
        console.error('Failed to save task:',error);

          this.toastService.error(error instanceof HttpErrorResponse
            ? error.error?.message || 'Unable to create task.'
            : 'Unable to create task.');
           this.isSubmitting = false;
           this.cdr.detectChanges();
      },
    });
  }
}