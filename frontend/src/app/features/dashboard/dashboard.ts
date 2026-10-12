import { inject,Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ApiResponse<T>{
    success:boolean;
    data:T;
}

export interface Employee{
    id : string;
    name: string;
    email: string;
    role: string;
    isActive:boolean;
}

export interface Task{
    id:string;
    title:string;
    description:string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
    createdBy: string;
    assignedTo: string;
    createdAt: string;
    updatedAt: string;
}

interface EmployeeResponse{
    success:boolean;
    data:Employee[];
    pagination:{
        page:number;
        limit:number;
        total:number;
        totalPages: number;
    };
}

@Injectable({
    providedIn: 'root'
})

export class DashboardService {
    private http=inject(HttpClient);

    private apiUrl= 'http://localhost:3000/api';

    getEmployees():Observable<EmployeeResponse>{
        return this.http.get<EmployeeResponse>(
            `${this.apiUrl}/users`
        );
    }
    getTasks(): Observable<ApiResponse<Task[]>> {
        return this.http.get<ApiResponse<Task[]>>(
        `${this.apiUrl}/tasks`
        );
    }
}
