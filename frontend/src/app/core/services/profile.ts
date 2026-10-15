import { inject, Injectable} from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";


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
    private apiUrl ='http://localhost:3000/api/profile';
    
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

}