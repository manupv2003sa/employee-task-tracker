
export type EmployeeRole = 'ADMIN' | 'MANAGER' | 'USER';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  isActive: boolean;
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  password: string;
  role: EmployeeRole;
}

export interface UpdateEmployeeRequest {
  name: string;
  email: string;
  role: EmployeeRole;
  isActive: boolean;
}
