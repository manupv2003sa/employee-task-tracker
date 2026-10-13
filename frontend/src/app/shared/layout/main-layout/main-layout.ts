import { Component,inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { AuthService } from '../../../features/auth/auth';

interface NavigationItem{
  label:string;
  route:string;
  roles:string[];
}

@Component({
  imports: [
    RouterLinkActive,
    RouterLink,
    RouterOutlet,
  ],
  selector: 'app-main-layout',
  styleUrl: './main-layout.scss',
  templateUrl: './main-layout.html',
})
export class MainLayout {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser =this.authService.getCurrentUser();

  navigationItems: NavigationItem[]=[
    {
      label:"Dashoard",
      route:'/admin',
      roles:["ADMIN"]
    },
    {
      label:"Dashboard",
      route :"/manager",
      roles:["MANAGER"]
    },
      {
      label: 'Dashboard',
      route: '/user',
      roles: ['USER']
    },
    {
      label: 'Employees',
      route: '/employees',
      roles: ['ADMIN']
    },
    {
      label: 'All Tasks',
      route: '/tasks',
      roles: ['ADMIN', 'MANAGER']
    },
    {
      label:'My Tasks',
      route:'/my-tasks',
      roles:['MANAGER','USER']
    },
        {
      label: 'Profile',
      route: '/profile',
      roles: ['ADMIN', 'MANAGER', 'USER']
    },
    {
      label: 'Change Password',
      route: '/change-password',
      roles: ['ADMIN', 'MANAGER', 'USER']
    }
  ];

  get visibleNavigationItems():NavigationItem[]{
    const role=this.currentUser?.role;

    return this.navigationItems.filter(item=>
      item.roles.includes(role ?? '')
    );
  }

  logout(): void {
    this.authService.logout();
    this.currentUser = null;
    this.router.navigate(['/login']);
  }
}
