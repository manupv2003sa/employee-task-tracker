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


    createEmployee(employee:{
        name:string;
        email:string;
        password:string;
        role:string;
    }): Observable<ApiResponse<Employee>>{
        return this.http.post<ApiResponse<Employee>>(
            `${this.apiUrl}/users`,
            employee
        );      
    };
  
    getEmployees(
        page: number = 1,
        limit: number = 5,
        search: string='',
        role:string='',
        status: string = '',
        sortBy: string = 'createdAt',
        sortOrder: string = 'desc'
    ): Observable<EmployeeResponse> {
        const params: Record<string,string>={
            page:page.toString(),
            limit:limit.toString(),
            search: search.trim(),            
            sortBy,
            sortOrder,
        };
        if (role){
            params['role']=role
        }
        if (status) {
            params['status'] = status;
        }

        return this.http.get<EmployeeResponse>(
            `${this.apiUrl}/users`,
            { params }
        );
    }

    updateEmployee(
        id:string,
        employee:{
            name:string;
            email:string;
            role:string;
            isActive: boolean;

        }
    ):Observable<ApiResponse<Employee>>{
        return this.http.put<ApiResponse<Employee>>(
            `${this.apiUrl}/users/${id}`,
            employee
        );
    }

    getTasks(): Observable<ApiResponse<Task[]>> {
        return this.http.get<ApiResponse<Task[]>>(
        `${this.apiUrl}/tasks`
        );
    }


    deactivateEmployee(id:string):Observable<ApiResponse<Employee>>{
        return this.http.patch<ApiResponse<Employee>>(
            `${this.apiUrl}/users/${id}/deactivate`,
            {}
        );
    }
}
