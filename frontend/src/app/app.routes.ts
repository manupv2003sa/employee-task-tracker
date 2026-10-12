import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { AdminDashboard } from './features/dashboard/admin-dashboard/admin-dashboard';
import { ManagerDashboard } from './features/dashboard/manager-dashboard/manager-dashboard';
import { UserDashboard } from './features/dashboard/user-dashboard/user-dashboard';
import { authGuard } from './features/auth/auth-guard';
import { roleGuard } from './features/auth/role-guard';
import { MainLayout } from './shared/layout/main-layout/main-layout';
import { EmployeeList } from './features/employees/employee-list/employee-list';



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
            }
        ]
    },
    {
        path:'**',
        redirectTo:'login'
    }
];
