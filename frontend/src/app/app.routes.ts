import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { AdminDashboard } from './features/dashboard/admin-dashboard/admin-dashboard';
import { ManagerDashboard } from './features/dashboard/manager-dashboard/manager-dashboard';
import { UserDashboard } from './features/dashboard/user-dashboard/user-dashboard';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import {MainLayout} from './shared/layout/main-layout/main-layout';
import { EmployeeList } from './features/employees/employee-list/employee-list';
import { ProfileComponent } from './features/profile/profile/profile';
import { ChangePassword } from './features/profile/change-password/change-password';
import { TaskList } from './features/tasks/task-list/task-list';
import { TaskForm } from './features/tasks/task-form/task-form';
import { MyTasks } from './features/tasks/my-tasks/my-tasks';


export const routes: Routes = [

    {
        path:'login',
        
        component:Login
    },
    {
        path: '',
        redirectTo :'login',
        pathMatch :'full'
    },
    {
        path:"",
        component : MainLayout,
        canActivate:[authGuard],
        children:[
            {
                path:'admin',
                component:AdminDashboard,
                canActivate:[authGuard,roleGuard],
                data:{roles:['ADMIN']}
            },
            {
                path:"manager",
                component:ManagerDashboard,
                canActivate:[authGuard,roleGuard],
                data:{roles:['MANAGER']}
            },
            {
                path:'user',
                component:UserDashboard,
                canActivate:[authGuard,roleGuard],
                data:{roles:['USER']}
            },
            {
                path:'employees',
                component:EmployeeList,
                canActivate:[roleGuard],
                data:{roles:['ADMIN']}
            },
            {
                path:'profile',
                component:ProfileComponent,
                canActivate:[authGuard]

            },
            {
                path:'change-password',
                component:ChangePassword ,
                canActivate:[authGuard]

            },

            {
                path: 'tasks',
                component: TaskList,
                canActivate: [authGuard, roleGuard],
                data: { roles: ['ADMIN', 'MANAGER'] }
            },
            {
                path: 'tasks/create',
                component: TaskForm,
                canActivate: [authGuard, roleGuard],
                data: { roles: ['ADMIN', 'MANAGER'] }
            },
            {
                path: 'my-tasks',
                component: MyTasks,
                canActivate: [authGuard, roleGuard],
                data: { roles: ['USER',"MANAGER"] }
            }
        ]
    },
    {
        path:'**',
        redirectTo:'login'
    }
];
