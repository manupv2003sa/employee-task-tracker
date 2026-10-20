
import { Component, inject, OnInit, ChangeDetectorRef, ElementRef, HostListener} from '@angular/core';
import { DashboardService, Employee } from '../../dashboard/dashboard';
import { FormsModule } from '@angular/forms';
import { EmployeeAdd } from '../employee-add/employee-add';
import { AuthService } from '../../auth/auth';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [FormsModule, EmployeeAdd],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss'
})

export class EmployeeList implements OnInit {

  private toastService = inject (ToastService);
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);
  private elementRef=inject(ElementRef);
  

  private authService= inject(AuthService);
  currentUser=this.authService.getCurrentUser();

  employees: Employee[] = [];

  //create User Properties
  showAddEmployee = false;

  openAddEmployee(): void {
    this.showAddEmployee = true;
  }

  closeAddEmployee(): void {
    this.showAddEmployee = false;
  }

  isLoading = true;
  errorMessage = '';

  currentPage = 1;
  pageSize = 5;
  totalEmployees = 0;
  totalPages = 0;
  searchTerm: string = '';

 // Filter menu state
  isFilterOpen = false;
  activeSubmenu = '';

  // Selected filters
  selectedRole = '';
  selectedStatus = '';

  // Sorting
  sortBy = '';
  sortOrder = 'asc';

  //Edit Option properties
  selectedEmployee :Employee | null=null;
  editName='';
  editEmail='';
  editRole='';

  isSaving=false;
  editError='';
  editSuccess='';
  editIsActive = true;

  //Deactivate Handler
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

  setFilter(
    key: 'role' | 'status',
    value: string
  ): void {
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

    this.dashboardService
      .getEmployees(this.currentPage, this.pageSize, this.searchTerm,  this.selectedRole,
            this.selectedStatus,  this.sortBy || 'createdAt',   this.sortOrder

      )
      .subscribe({
        next: (response) => {
          this.employees = response.data;

          this.totalEmployees = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
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

  onSearch():void{
    this.currentPage=1;
    this.loadEmployees();
  }


  //Create employee
  onEmployeeAdded():void{
    this.showAddEmployee=false;
    this.currentPage=1;
    this.loadEmployees();
  }




// Edit employee tab
  editEmployee(employee: Employee): void {
    this.selectedEmployee = employee;
    this.editName=employee.name;
    this.editEmail = employee.email;
    this.editRole = employee.role;

    this.editError = '';
    this.editSuccess = '';
    this.editIsActive = employee.isActive;

  }
  hasEditChanges(): boolean {
    if (!this.selectedEmployee) {
      return false;
    }

    return (
      this.editName !== this.selectedEmployee.name ||
      this.editEmail !== this.selectedEmployee.email ||
      this.editRole !== this.selectedEmployee.role ||
      this.editIsActive !== this.selectedEmployee.isActive
    );
  }

  saveEmployee():void{
    if(!this.selectedEmployee || this.isSaving){
      return;
    }

    const employeeData={
      name:this.editName.trim(),
      email:this.editEmail.trim(),
      role:this.editRole,
      isActive: this.editIsActive

    };

    if(!employeeData.name || !employeeData.email || !employeeData.role){
      this.editError="Plese fill in all fields";
      return ;
    }
    this.isSaving= true;
    this.editError='';
    this.editSuccess='';

    this.dashboardService
      .updateEmployee(this.selectedEmployee.id,employeeData)
      .subscribe({
        next:()=>{
          this.isSaving=false;
          this.toastService.success('Employee updated successfully');
          this.selectedEmployee = null;
          this.loadEmployees();

          this.cdr.detectChanges();

        },
        error:(error)=>{

          this.isSaving=false;

          this.toastService.error(error.error?.message || 'Failed to update employee');
          this.cdr.detectChanges();
        }
      });
  }

  onNameChange(value: string): void {
    this.editName = value;
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

    if (!confirmed) return;
    this.errorMessage = '';
    this.successMessage = '';

    this.dashboardService.deactivateEmployee(employee.id).subscribe({
      next: () => {

        // Remove the soft-deleted employee from the current screen
        this.employees = this.employees.filter(
          item => item.id !== employee.id
        );

        this.totalEmployees = Math.max(0, this.totalEmployees - 1);

        // Recalculate the number of pages
        this.totalPages = Math.ceil(
          this.totalEmployees / this.pageSize
        );
        this.cdr.detectChanges();

         this.toastService.success('Employee deleted successfully.');

        // Move back if the current page is now beyond the last page
        if (this.currentPage > this.totalPages && this.currentPage > 1) {
          this.currentPage--;
          this.loadEmployees();
        }
      },
      error: (error: unknown) => {
        console.error('Failed to delete employee:', error);
         this.toastService.success('Unable to delete employee');
      }
    });
  }

}