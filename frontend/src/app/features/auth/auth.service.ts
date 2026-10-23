import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { SocketService } from "../../core/services/socket.service";


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
            profilePicture: string | null;

        }
    };
}

export type CurrentUser = LoginResponse['data']['user'];


@Injectable({
    providedIn:'root'
})
export class AuthService{
    private http = inject(HttpClient);
    private socketService = inject(SocketService);
   
    private apiUrl='http://192.168.0.127:3000/api/auth';

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
    saveSession(response: LoginResponse): void {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem(
            'currentUser',
            JSON.stringify(response.data.user)
        );

        this.CurrentUserSubject.next(response.data.user);

        this.socketService.connect(response.data.token);
    }

    getToken():string | null{
        return localStorage.getItem('authToken');
    }

    getCurrentUser(): CurrentUser | null{
        const user =localStorage.getItem('currentUser');

        return user ? JSON.parse(user) as CurrentUser :null;
    }

    updateCurrentUserName(name: string, profilePicture?: string | null): void {
        const currentUser = this.getCurrentUser();

        if (!currentUser) return;

        const updatedUser: CurrentUser = {
            id: currentUser.id,
            name: name,
            email: currentUser.email,
            role: currentUser.role,
            profilePicture: profilePicture ?? currentUser.profilePicture
        };

        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.CurrentUserSubject.next(updatedUser);

    }

    logout(): void {
        this.socketService.disconnect();

        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');

        this.CurrentUserSubject.next(null);
    }

}