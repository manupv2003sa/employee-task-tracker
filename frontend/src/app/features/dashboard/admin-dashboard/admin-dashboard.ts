import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService, Employee, Task } from '../dashboard';
import { forkJoin } from 'rxjs';

@Component({
  imports: [RouterLink],
  selector: 'app-admin-dashboard',
  styleUrl: './admin-dashboard.scss',
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboard implements OnInit{

  private cdr = inject(ChangeDetectorRef);
  private dashboardService = inject(DashboardService);

  employees: Employee[] =[];
  tasks: Task[] = [];

  totalEmployees =0;
  totalTasks=0;
  inProgressTasks =0;
  completedTasks =0;

  isLoading= true;
  errorMessage='';

  ngOnInit(): void {
    this.loadDashboard();
  }

    
  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      employees: this.dashboardService.getEmployees(),
        tasks: this.dashboardService.getTasks()
      }).subscribe({
        next: ({ employees, tasks }) => {
          this.employees = employees.data.filter(
            employee => employee.isActive
          );
          this.totalEmployees = employees.pagination.total;          this.tasks = tasks.data;
          this.totalTasks = this.tasks.length;

          this.inProgressTasks = this.tasks.filter(
            task => task.status === 'IN_PROGRESS'
          ).length;

          this.completedTasks = this.tasks.filter(
            task => task.status === 'COMPLETED'
          ).length;

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Failed to load dashboard:', error);
          this.errorMessage = 'Unable to load dashboard data.';
          this.isLoading = false;
          this.cdr.detectChanges();

        }
      });
    }

  get recentTasks(): Task[] {
      return [...this.tasks]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() -
            new Date(a.updatedAt).getTime()
        )
        .slice(0, 5);
  }



}
