import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Login } from "./login/login";
import { LOCATION_UPGRADE_CONFIGURATION } from "@angular/common/upgrade";

export interface LoginResponse{
    success: boolean;
    message: string;
    data:{
        token : string;
        user:{
            id:string;
            name:string;
            email:string;
            role : 'ADMIN' | 'MANAGER' | 'USER';
        }
    };
}

@Injectable({
    providedIn:'root'
})
export class AuthService{
    private http = inject(HttpClient);

    private apiUrl='http://localhost:3000/api/auth';

    login(email:String, password:String):Observable<LoginResponse>{
        return this.http.post<LoginResponse>(
            `${this.apiUrl}/login`,
            {email,password}
        );
    }
    saveSession(response:LoginResponse):void{
        localStorage.setItem('authToken',response.data.token);
        localStorage.setItem('currentUser',JSON.stringify(response.data.user));
    }

    getToken():string | null{
        return localStorage.getItem('authToken');
    }

    getCurrentUser(): LoginResponse['data']['user'] | null{
        const user =localStorage.getItem('currentUser');

        return user ? JSON.parse(user):null;
    }
    
    logout(): void {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    }
}