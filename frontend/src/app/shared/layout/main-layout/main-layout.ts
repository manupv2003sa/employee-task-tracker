import { Component,inject,DestroyRef, OnInit ,ChangeDetectorRef } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../features/auth/auth.service';

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
export class MainLayout implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef =inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  currentUser =this.authService.getCurrentUser();

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user =>{
        this.currentUser =user;
        this.cdr.detectChanges();

      });
  }

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

  getProfilePictureUrl(): string {
    const profilePicture = this.currentUser?.profilePicture;

    if (!profilePicture) {
      return '/default-avatar.png';
    }

    return `http://localhost:3000${profilePicture}`;
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;

    if (!img.src.endsWith('/default-avatar.png')) {
      img.src = '/default-avatar.png';
    }
  }

  logout(): void {
    this.authService.logout();
    this.currentUser = null;
    this.router.navigate(['/login']);
  }
}
