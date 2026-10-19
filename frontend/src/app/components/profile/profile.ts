import { Component,OnInit,inject,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../features/auth/auth';

import { ProfileService, Profile } from '../../core/services/profile';
@Component({
  imports: [FormsModule, CommonModule],
  standalone: true,
  selector: 'app-profile',
  styleUrl: './profile.scss',
  templateUrl: './profile.html',
})
export class ProfileComponent implements OnInit{
  private profileService = inject(ProfileService);
  private cdr = inject(ChangeDetectorRef);
  private authService= inject(AuthService);


  profile : Profile | null = null;
  editedName= '';

  isEditing =false;
  isLoading =false;
  isSaving =false;

  successMessage='';
  errorMessage= '';

  ngOnInit(): void {
    this.profileLoad();
  }

  profileLoad():void{
    this.isLoading=true;
    this.errorMessage='';

    this.profileService.getProfile().subscribe({
      next:(response)=>{
        this.profile= response.data ?? null;
        this.editedName =this.profile?.name ?? '';
        this.isLoading=false;
        this.cdr.detectChanges();

      },
      error:(error)=>{

      console.error('Profile error:', error);


        this.errorMessage= error.error?.message || 'Failed to load profile.';
        this.isLoading= false;
        this.cdr.detectChanges();

      }
    });
  }

  startEditing(): void{
    if(!this.profile){
      return;
    }
    this.editedName=this.profile.name;
    this.isEditing=true;
    this.successMessage='';
    this.errorMessage='';
  }

  cancelEditing(): void{
    this.editedName= this.profile?.name ?? '' ;
    this.isEditing =false;
    this.errorMessage= '';
  }

  saveProfile():void{
    const name= this.editedName.trim();

    if(!name){
      this.errorMessage ="Name is required";
      return;
    }
    if (name.length > 100) {
      this.errorMessage = 'Name must not exceed 100 characters.';
      return;
    }

    this.isSaving=true;
    this.successMessage='';
    this.errorMessage='';

    this.profileService.updateProfile({name}).subscribe({
      next:(response)=>{
        if(response.data){
          this.profile=response.data;
          this.authService.updateCurrentUserName(response.data.name);
        }else{
          this.profileLoad();
        }

        this.editedName=response.data?.name ?? name;
        this.isEditing=false;
        this.isSaving=false;
        this.cdr.detectChanges();

        this.successMessage=response.message || 'Profile updated successfully.';
      },
      error:(error)=>{
        this.errorMessage= error.error?.message || "Failed to update profile" ;
        this.isSaving=false;
        this.cdr.detectChanges();

      }
    });
  }
}


