
import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../core/services/profile';
import { finalize } from 'rxjs';
import { ToastService } from '../../core/services/toast';


@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss'
})
export class ChangePassword {
  private profileService = inject(ProfileService);
  private toastService = inject (ToastService);

  private cdr = inject(ChangeDetectorRef);




  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  errorMessage = '';
  successMessage = '';
  isSaving = false;

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  changePassword(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage = 'New password must be at least 8 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'New password and confirmation do not match.';
      return;
    }

    if (this.currentPassword === this.newPassword) {
      this.errorMessage = 'New password must be different from the current password.';
      return;
    }

    this.isSaving = true;


    this.profileService.changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
      
    })
    
    .pipe(finalize(() => this.isSaving = false))
    .subscribe({
      next: (response) => {
         this.toastService.success(response.message || 'Password changed successfully.');

        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.cdr.detectChanges();

      },
      error: (error) => {
          this.toastService.error(
          error.error?.message || 'Unable to change password. Please try again.');
          this.cdr.detectChanges();

      }
    });
  }
}


