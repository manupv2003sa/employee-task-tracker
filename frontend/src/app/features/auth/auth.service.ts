import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";


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

export type CurrentUser = LoginResponse['data']['user'];


@Injectable({
    providedIn:'root'
})
export class AuthService{
    private http = inject(HttpClient);

   
    private apiUrl='http://localhost:3000/api/auth';

     private CurrentUserSubject = new BehaviorSubject<any | null>(
        this.getCurrentUser()
    );

    currentUser$=this.CurrentUserSubject.asObservable();


    login(email:String, password:string):Observable<LoginResponse>{
        return this.http.post<LoginResponse>(
            `${this.apiUrl}/login`,
            {email,password}
        );
    }
    saveSession(response:LoginResponse):void{
        localStorage.setItem('authToken',response.data.token);
        localStorage.setItem('currentUser',JSON.stringify(response.data.user));

        this.CurrentUserSubject.next(response.data.user);
    }

    getToken():string | null{
        return localStorage.getItem('authToken');
    }

    getCurrentUser(): CurrentUser | null{
        const user =localStorage.getItem('currentUser');

        return user ? JSON.parse(user) as CurrentUser :null;
    }

    updateCurrentUserName(name: string): void {
    const currentUser = this.getCurrentUser();

    if (!currentUser) return;

    const updatedUser: CurrentUser = {
        id: currentUser.id,
        name: name,
        email: currentUser.email,
        role: currentUser.role
    };

    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    this.CurrentUserSubject.next(updatedUser);

    }

    logout(): void {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');

        this.CurrentUserSubject.next(null);
    }


}