import { Component,OnInit,inject,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { ToastService } from '../../../core/services/toast';
import { ProfileService, Profile } from '../profile.service';
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
  private toastService = inject (ToastService);



  profile : Profile | null = null;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isUploadingPhoto = false;



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

        this.toastService.error(error.error?.message || 'Failed to load profile.');
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

          this.toastService.success(response.message || 'Profile updated successfully.');
      },
      error:(error)=>{
          this.toastService.error(error.error?.message || "Failed to update profile") ;
        this.isSaving=false;
        this.cdr.detectChanges();

      }
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.toastService.error('Choose a JPEG, PNG, or WebP image.');
      input.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.toastService.error('Photo must be smaller than 2 MB.');
      input.value = '';
      return;
    }

    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);
  }

  uploadPhoto(): void {
    if (!this.selectedFile || this.isUploadingPhoto) return;

    this.isUploadingPhoto = true;

    this.profileService.uploadProfilePicture(this.selectedFile).subscribe({
      next: (response) => {
        if (this.profile) {
          this.profile = {
            ...this.profile,
            profilePicture: response.data.profilePicture
          };

          this.authService.updateCurrentUserName(
            this.profile.name,
            response.data.profilePicture
          );
        }

        this.selectedFile = null;

        if (this.previewUrl) {
          URL.revokeObjectURL(this.previewUrl);
          this.previewUrl = null;
        }

        this.isUploadingPhoto = false;
        this.cdr.detectChanges();

        this.toastService.success(
          response.message || 'Profile picture updated successfully.'
        );
      },

      error: (error) => {
        this.isUploadingPhoto = false;
        this.toastService.error(
          error.error?.message || 'Failed to upload profile picture.'
        );
      }
  });
}
      
          
    

  getProfilePictureUrl(): string {
    const path = this.profile?.profilePicture;

    return path ? `http://192.168.0.127:3000${path}` : '';
  }
}


