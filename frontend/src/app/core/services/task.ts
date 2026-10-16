import { Injectable,inject } from '@angular/core';
import { HttpClient , HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../../features/dashboard/dashboard';


export interface TaskItem{
    id:string;
    title: string;
    description: string | null;
    priority: 'LOW' |'MEDIUM' | 'HIGH';
    status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
    createdBy:string;
    assignedTo:string;

    assignee:{
        id:string,
        name:string,
    } | null;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse<T>{
    success :boolean;
    data: T;
    message?: string;
}

export interface TaskFilters{
    search?: string;
    status?: string;
    priority?:string;
    sortBy?:string;
    order?: 'asc' | 'desc';
}


export interface CreateTaskRequest{
    title:string;
    description?: string;
    priority: 'LOW' |"MEDIUM" |"HIGH";
    assignedTo: string;

}


export interface UpdateTaskRequest{
    title?:string;
    description?: string;
    priority?: 'LOW' |"MEDIUM" |"HIGH";
    status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
    dueDate?: string;
}


@Injectable({
    providedIn:"root"
})

export class TaskService {
    private http= inject(HttpClient);
    private apiUrl = 'http://localhost:3000/api/tasks';

    
        
    getTasks(filters: TaskFilters = {}): Observable<ApiResponse<TaskItem[]>> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value);
        }
    });

    return this.http.get<ApiResponse<TaskItem[]>>(
        this.apiUrl,
        { params }
    );
    }


    createTask(data: CreateTaskRequest):Observable<ApiResponse<TaskItem>>{
        return this.http.post<ApiResponse<TaskItem>>(
            this.apiUrl,
            data
        );
    }

    updateTask(id:string,data:UpdateTaskRequest):Observable<ApiResponse<TaskItem>>{
        return this.http.put<ApiResponse<TaskItem>>(
            `${this.apiUrl}/${id}`,
            data
        );
    }

    assignTask(id:string,assignedTo:string):Observable<ApiResponse<TaskItem>>{
        return this.http.patch<ApiResponse<TaskItem>>(
            `${this.apiUrl}/${id}/assign`, { assignedTo }
        );
    }

    getMyTasks(): Observable<ApiResponse<TaskItem[]>> {
        return this.http.get<ApiResponse<TaskItem[]>>(
            `${this.apiUrl}/my`
        );
    }
    updateMyTaskStatus(id: string, status: TaskItem['status']): Observable<ApiResponse<TaskItem>> {
        return this.http.patch<ApiResponse<TaskItem>>(
            `${this.apiUrl}/${id}/status`, { status }
        );
    }


}



