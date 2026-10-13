
import { Component, inject, OnInit, ChangeDetectorRef, } from '@angular/core';
import { DashboardService, Employee } from '../../dashboard/dashboard';
import { FormsModule } from '@angular/forms';
import { EmployeeAdd } from '../employee-add/employee-add';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [FormsModule, EmployeeAdd],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss'
})
export class EmployeeList implements OnInit {
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);
  

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
  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService
      .getEmployees(this.currentPage, this.pageSize)
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
    console.log('Selected employee for editing:', employee);

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
          this.selectedEmployee = null;
          this.loadEmployees();
        },
        error:(error)=>{
          this.isSaving=false;
          this.editError=error.error?.message || 'Failed to update employee'

        }
      });
  }

  onNameChange(value: string): void {
    this.editName = value;
    console.log('Name changed:', value);
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
        console.log('Delete successful. Removing employee:', employee.id);

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

        this.successMessage = 'Employee deleted successfully.';

        // Move back if the current page is now beyond the last page
        if (this.currentPage > this.totalPages && this.currentPage > 1) {
          this.currentPage--;
          this.loadEmployees();
        }
      },
      error: (error: unknown) => {
        console.error('Failed to delete employee:', error);
        this.errorMessage = 'Unable to delete employee.';
      }
    });
  }

}