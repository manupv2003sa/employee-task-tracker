import { Component,inject, signal  } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth';
import { Router } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule],
  standalone:true,
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private router = inject(Router);
  private fb= inject(FormBuilder);
  private authService =inject(AuthService);

  loginForm =this.fb.group({
      email:['',[Validators.required,Validators.email]],
      password:['',Validators.required]
    });

  isLoading = signal(false);
  errorMessage = signal('');

  showPassword = false;
  
  onSubmit(): void{
    if (this.loginForm.invalid || this.isLoading()){
      this.loginForm.markAllAsTouched();
      return;
    }

    const {email,password} =this.loginForm.getRawValue();

    if (!email || !password){
      return ;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(email,password).subscribe({
      next:(response)=>{
        this.isLoading.set(false);

        this.authService.saveSession(response);

        const role= response.data.user.role;

        if (role === 'ADMIN') {
            this.router.navigate(['/admin']);
          } 
        else if (role === 'MANAGER') {
            this.router.navigate(['/manager']);
          } 
        else {
            this.router.navigate(['/user']);
          }
      },
      error: (error) => {

  this.isLoading.set(false);
  this.errorMessage.set(
    error.error?.message || 'Login failed. Please try again');

}
    });

  }  
}

