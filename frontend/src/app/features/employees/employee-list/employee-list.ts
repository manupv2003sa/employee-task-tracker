
import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef,
  ElementRef,
  HostListener,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { EmployeeService } from '../employee.service';
import { EmployeeForm } from '../employee-form/employee-form';
import { AuthService } from '../../auth/auth.service';
import { ToastService } from '../../../core/services/toast';
import { Employee } from '../../../core/models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [FormsModule, EmployeeForm],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss'
})
export class EmployeeList implements OnInit {
  private toastService = inject(ToastService);
  private employeeService = inject(EmployeeService);
  private cdr = inject(ChangeDetectorRef);
  private elementRef = inject(ElementRef);
  private authService = inject(AuthService);

  currentUser = this.authService.getCurrentUser();

  employees: Employee[] = [];

  // Shared Add/Edit modal state
  showEmployeeForm = signal(false);
  selectedEmployee = signal<Employee | null>(null);

  isLoading = true;
  errorMessage = '';

  currentPage = 1;
  pageSize = 5;
  totalEmployees = 0;
  totalPages = 0;
  searchTerm = '';

  // Filter menu state
  isFilterOpen = false;
  activeSubmenu = '';

  // Selected filters
  selectedRole = '';
  selectedStatus = '';

  // Sorting
  sortBy = '';
  sortOrder = 'asc';

  successMessage = '';



  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isFilterOpen) {
      return;
    }

    const clickedInside = this.elementRef.nativeElement
      .querySelector('.filter-wrapper')
      ?.contains(event.target as Node);

    if (!clickedInside) {
      this.closeFilterMenu();
    }
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  // Open the shared form in Add mode
  openAddEmployee(): void {
    this.selectedEmployee.set(null);
    this.showEmployeeForm.set(true);
  }

  // Open the shared form in Edit mode
  editEmployee(employee: Employee): void {
    this.selectedEmployee.set(employee);
    this.showEmployeeForm.set(true);
  }

  closeEmployeeForm(): void {
    this.showEmployeeForm.set(false);
    this.selectedEmployee.set(null);
  }

  // Called when the shared form successfully saves
  onEmployeeSaved(): void {
    const isAdding = this.selectedEmployee() === null;

    this.closeEmployeeForm();

    if (isAdding) {
      this.currentPage = 1;
    }

    this.loadEmployees();
  }

  // Filter methods
  toggleFilterMenu(): void {
    this.isFilterOpen = !this.isFilterOpen;

    if (!this.isFilterOpen) {
      this.activeSubmenu = '';
    }
  }

  toggleSubmenu(name: string): void {
    this.activeSubmenu =
      this.activeSubmenu === name ? '' : name;
  }

  setFilter(key: 'role' | 'status', value: string): void {
    if (key === 'role') {
      this.selectedRole = value;
    } else {
      this.selectedStatus = value;
    }

    this.currentPage = 1;
    this.loadEmployees();
  }

  clearAllFilters(): void {
    this.selectedRole = '';
    this.selectedStatus = '';
    this.sortBy = '';
    this.sortOrder = 'asc';
    this.activeSubmenu = '';

    this.currentPage = 1;
    this.loadEmployees();
  }

  closeFilterMenu(): void {
    this.isFilterOpen = false;
    this.activeSubmenu = '';
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.employeeService.getEmployees(
      this.currentPage,
      this.pageSize,
      this.searchTerm,
      this.selectedRole,
      this.selectedStatus,
      this.sortBy || 'createdAt',
      this.sortOrder
    ).subscribe({
      next: (response) => {
        this.employees = response.data;
        this.totalEmployees = response.pagination.total;
        this.totalPages = response.pagination.totalPages;
        this.isLoading = false;


        console.log('Employees from API:', this.employees);

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

  onSearch(): void {
    this.currentPage = 1;
    this.loadEmployees();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.loadEmployees();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadEmployees();
  }

  deleteEmployee(employee: Employee): void {
    const confirmed = confirm(
      `Are you sure you want to delete ${employee.name}?`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.employeeService.deactivateEmployee(employee.id).subscribe({
      next: () => {
        this.employees = this.employees.filter(
          item => item.id !== employee.id
        );

        this.totalEmployees = Math.max(0, this.totalEmployees - 1);

        this.totalPages = Math.ceil(
          this.totalEmployees / this.pageSize
        );

        this.toastService.success('Employee deleted successfully.');
        this.cdr.detectChanges();

        if (this.currentPage > this.totalPages && this.currentPage > 1) {
          this.currentPage--;
          this.loadEmployees();
        }
      },
      error: (error: unknown) => {
        console.error('Failed to delete employee:', error);
        this.toastService.error('Unable to delete employee.');
      }
    });
  }



  onProfileImageError(event: Event): void {
    (event.target as HTMLImageElement).src = '/default-avatar.png';
  }
}
