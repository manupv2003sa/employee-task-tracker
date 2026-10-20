import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  ApiResponse,
  PaginatedApiResponse
} from '../../core/models/api.model';

import {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest
} from '../../core/models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  createEmployee(
    employee: CreateEmployeeRequest
  ): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(
      `${this.apiUrl}/users`,
      employee
    );
  }

  getEmployees(
    page: number = 1,
    limit: number = 5,
    search: string = '',
    role: string = '',
    status: string = '',
    sortBy: string = 'createdAt',
    sortOrder: string = 'desc'
  ): Observable<PaginatedApiResponse<Employee[]>> {
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
      search: search.trim(),
      sortBy,
      sortOrder
    };

    if (role) {
      params['role'] = role;
    }

    if (status) {
      params['status'] = status;
    }

    return this.http.get<PaginatedApiResponse<Employee[]>>(
      `${this.apiUrl}/users`,
      { params }
    );
  }

  getAssignableUsers(): Observable<ApiResponse<Employee[]>> {
    return this.http.get<ApiResponse<Employee[]>>(
      `${this.apiUrl}/tasks/assignable-users`
    );
  }

  updateEmployee(
    id: string,
    employee: UpdateEmployeeRequest
  ): Observable<ApiResponse<Employee>> {
    return this.http.put<ApiResponse<Employee>>(
      `${this.apiUrl}/users/${id}`,
      employee
    );
  }

  deactivateEmployee(
    id: string
  ): Observable<ApiResponse<Employee>> {
    return this.http.patch<ApiResponse<Employee>>(
      `${this.apiUrl}/users/${id}/deactivate`,
      {}
    );
  }
}
