import { Component,ChangeDetectorRef ,inject,Output, EventEmitter} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DashboardService } from '../../dashboard/dashboard';
@Component({
  imports: [FormsModule],
  selector: 'app-employee-add',
  standalone: true,
  styleUrl: './employee-add.scss',
  templateUrl: './employee-add.html',
})
export class EmployeeAdd {

  @Output() employeeAdded = new EventEmitter<void>();

  private dashboardService= inject(DashboardService);
  private cdr= inject(ChangeDetectorRef);
  employee = {
    name: '',
    email: '',
    password: '',
    role: 'USER',
  };

  errorMessage= "";
  successMessage="";
  isSubmitting=false;

  onSubmit(form:NgForm):void{
    if (form.invalid || this.isSubmitting){
      return;
    }

    this.errorMessage= '';
    this.successMessage='';
    this.isSubmitting=true;
    
    const employeeData={
      name :this.employee.name.trim(),
      email:this.employee.email.trim(),
      password:this.employee.password,
      role:this.employee.role,
    };

    this.dashboardService.createEmployee(employeeData).subscribe({
      next:()=>{
        this.employeeAdded.emit();
        this.successMessage="Employee added successfully";
        
        this.employee={
          name: '',
          email: '',
          password: '',
          role: 'USER',
        };

        form.resetForm(this.employee);
        this.isSubmitting=false;
        this.cdr.detectChanges();
      },

      error:(error:unknown)=>{
        console.error('Failed to add employee',error);

        this.errorMessage='Unable to add employee. Please try again';
        this.isSubmitting=false;
        this.cdr.detectChanges();
      },
    })
  
  
  }

}


