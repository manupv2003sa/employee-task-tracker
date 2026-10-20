
import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { EmployeeService } from '../employee.service';
import {
  CreateEmployeeRequest,
  Employee,
  EmployeeRole,
  UpdateEmployeeRequest
} from '../../../core/models/employee.model';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.scss',
})
export class EmployeeForm {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private toastService = inject(ToastService);

  // null means Add mode; an employee means Edit mode.
  employee = input<Employee | null>(null);

  saved = output<void>();
  cancelled = output<void>();

  isEditMode = computed(() => this.employee() !== null);
  isSubmitting = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.pattern(/.*\S.*/)
    ]],
    email: ['', [
      Validators.required,
      Validators.email
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(8)
    ]],
    role: ['USER' as EmployeeRole, Validators.required],
    isActive: [{ value: true, disabled: true }]
  });

  constructor() {
    effect(() => {
      const employee = this.employee();
      const password = this.form.controls.password;
      const isActive = this.form.controls.isActive;

      if (employee) {
        this.form.patchValue({
          name: employee.name,
          email: employee.email,
          role: employee.role,
          isActive: employee.isActive,
          password: ''
        });

        password.clearValidators();
        password.disable({ emitEvent: false });
        isActive.enable({ emitEvent: false });
      } else {
        this.form.reset({
          name: '',
          email: '',
          password: '',
          role: 'USER',
          isActive: true
        });

        password.setValidators([
          Validators.required,
          Validators.minLength(8)
        ]);
        password.enable({ emitEvent: false });
        isActive.disable({ emitEvent: false });
      }

      password.updateValueAndValidity({ emitEvent: false });
      this.form.updateValueAndValidity({ emitEvent: false });
    });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    const value = this.form.getRawValue();
    const employee = this.employee();

    if (employee) {
      const employeeData: UpdateEmployeeRequest = {
        name: value.name.trim(),
        email: value.email.trim(),
        role: value.role,
        isActive: value.isActive
      };

      this.employeeService
        .updateEmployee(employee.id, employeeData)
        .subscribe({
          next: () => {
            this.toastService.success('Employee updated successfully');
            this.isSubmitting.set(false);
            this.saved.emit();
          },
          error: (error: unknown) => {
            this.showError(error, 'Failed to update employee');
          }
        });

      return;
    }

    const employeeData: CreateEmployeeRequest = {
      name: value.name.trim(),
      email: value.email.trim(),
      password: value.password,
      role: value.role
    };

    this.employeeService.createEmployee(employeeData).subscribe({
      next: () => {
        this.toastService.success('Employee added successfully');
        this.isSubmitting.set(false);
        this.saved.emit();
      },
      error: (error: unknown) => {
        this.showError(error, 'Unable to add employee. Please try again');
      }
    });
  }

  onCancel(): void {
    if (!this.isSubmitting()) {
      this.cancelled.emit();
    }
  }

  private showError(error: unknown, fallbackMessage: string): void {
    const message = error instanceof HttpErrorResponse
      ? error.error?.message || fallbackMessage
      : fallbackMessage;

    this.toastService.error(message);
    this.isSubmitting.set(false);
  }
}
