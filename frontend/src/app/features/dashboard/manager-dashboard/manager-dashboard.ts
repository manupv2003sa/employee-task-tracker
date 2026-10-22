import { Component, inject, OnInit, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Task } from '../../../core/models/task.model';
import { Employee } from '../../../core/models/employee.model';
import { forkJoin } from 'rxjs';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { TaskService } from '../../tasks/task.service';
import { EmployeeService } from '../../employees/employee.service';
import { TaskStatusChart } from '../../../shared/task-status-chart/task-status-chart';

@Component({
  imports: [RouterLink, DatePipe, CommonModule, TaskStatusChart],
  selector: 'app-manager-dashboard',
  styleUrl: '../admin-dashboard/admin-dashboard.scss',
  templateUrl: '../admin-dashboard/admin-dashboard.html'
})
export class ManagerDashboard  implements OnInit{

  private cdr = inject(ChangeDetectorRef);
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private taskService = inject(TaskService);



  currentRole = this.authService.getCurrentUser()?.role;

  //shared service for admin
  totalEmployees =0;


  employees: Employee[] =[];
  tasks: Task[] = [];

  myTasks =0;
  totalTasks=0;
  inProgressTasks =0;
  todoTasks =0;

  isLoading= true;
  errorMessage='';



  todayDate = new Date();

  tomorrowDate = new Date(
  new Date().setDate(new Date().getDate() + 1)
);
  ngOnInit(): void {
    this.loadDashboard();
  }

    
  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
        myTasks: this.taskService.getMyTasks(),
        tasks: this.taskService.getTasks()
      }).subscribe({
        next: ({ myTasks, tasks }) => {
          
          this.tasks = tasks.data ?? [];

          this.myTasks = myTasks.data?.length ?? 0;

          this.totalTasks = this.tasks.length;

          this.inProgressTasks = this.tasks.filter(
            task => task.status === 'IN_PROGRESS'
          ).length;

          this.todoTasks = this.tasks.filter(
            task => task.status === 'TODO'
          ).length;

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = 'Unable to load dashboard data.';
          this.isLoading = false;
          this.cdr.detectChanges();

        }
      });
    }

    get recentTasks(): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.tasks
      .filter(task => task.status !== 'COMPLETED')
      .sort((a, b) => {
        // Tasks with due dates come before tasks without due dates.
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();

        // Sort by nearest due date first.
        if (dateA !== dateB) {
          return dateA - dateB;
        }

        // If dates match, HIGH priority comes first.
        const priorityRank = {
          HIGH: 1,
          MEDIUM: 2,
          LOW: 3,
        };

        return priorityRank[a.priority] - priorityRank[b.priority];
      })
      .slice(0, 5);
  }



}
