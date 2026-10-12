
import { Component, inject, OnInit, ChangeDetectorRef  } from '@angular/core';
import { DashboardService, Employee } from '../../dashboard/dashboard';

@Component({
    selector: 'app-employee-list',
    standalone: true,
    imports: [],
    templateUrl: './employee-list.html',
    styleUrl: './employee-list.scss'
  })
export class EmployeeList implements OnInit {
    private dashboardService = inject(DashboardService);
    private cdr = inject(ChangeDetectorRef);


    employees: Employee[] = [];
    isLoading = true;
    errorMessage = '';

    ngOnInit(): void {
      this.dashboardService.getEmployees().subscribe({
        next: (response) => {
          this.employees = response.data.filter(
            employee => employee.isActive
          );
          this.isLoading = false;
          this.cdr.detectChanges();

        },
        error: (error) => {
          console.error('Failed to load employees:', error);
          this.errorMessage = 'Unable to load employees.';
          this.isLoading = false;
          this.cdr.detectChanges();

        }
      });
    }
}
