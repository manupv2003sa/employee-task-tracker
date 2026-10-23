import { Injectable,inject } from '@angular/core';
import { HttpClient , HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../core/models/api.model';

import {
  Task,
  TaskItem,
  TaskFilters,
  CreateTaskRequest,
  UpdateTaskRequest
} from '../../core/models/task.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn:"root"
})

export class TaskService {
    private http= inject(HttpClient);
    private apiUrl =`${environment.apiUrl}/tasks`;

    
        
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



