import { inject, Injectable} from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from '../../../environments/environment';


interface ApiResponse<T>{
    success : Boolean;
    data : T;
    message? : string;
}

export interface Profile{
    id: string;
    name:string;
    email:string;
    role:string;
    isActive:boolean;
    profilePicture: string | null;
    createdAt: string;
    updatedAt:string;
}

export interface UpdateProfileRequest{
    name:string;
}

export interface ChangePasswordRequest{
    currentPassword:string;
    newPassword: string;
    confirmPassword :string;
}

@Injectable({
    providedIn:'root'
})
export class ProfileService{

    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/profile`;    
    getProfile(): Observable<ApiResponse<Profile>>{
        return this.http.get<ApiResponse<Profile>>(this.apiUrl);
    }

    updateProfile(
        profile :UpdateProfileRequest
    ):Observable<ApiResponse<Profile>>{
        return this.http.put<ApiResponse<Profile>>(
            this.apiUrl,
            profile
        );
    }

    changePassword(data: ChangePasswordRequest):Observable<ApiResponse<unknown>>{
        return this.http.put<ApiResponse<unknown>>(
            `${this.apiUrl}/change-password`,
            data
        );
    }


    uploadProfilePicture(file: File) {
        const formData = new FormData();

        formData.append('profilePicture', file);

        return this.http.post<{
            message: string;
            data: {profilePicture: string};
        }>(
            `${environment.apiUrl}/profile/picture`,
            formData
        );
    }

}