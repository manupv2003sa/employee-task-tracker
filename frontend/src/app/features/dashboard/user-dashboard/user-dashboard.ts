
import { Component, OnInit, inject ,ChangeDetectorRef} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskItem, TaskService } from '../../tasks/task.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.scss',
})
export class UserDashboard implements OnInit {
  private taskService = inject(TaskService);
  private cdr =inject(ChangeDetectorRef);

  tasks: TaskItem[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    this.taskService.getMyTasks().subscribe({
      next: (response) => {
        this.tasks = response.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Failed to load your dashboard.';
        this.loading = false;
        this.cdr.detectChanges();

      },
    });
  }

  get totalCount(): number {
    return this.tasks.length;
  }

  get todoCount(): number {
    return this.tasks.filter(task => task.status === 'TODO').length;
  }

  get inProgressCount(): number {
    return this.tasks.filter(task => task.status === 'IN_PROGRESS').length;
  }

  get completedCount(): number {
    return this.tasks.filter(task => task.status === 'COMPLETED').length;
  }

  get recentTasks(): TaskItem[] {
    return [...this.tasks]
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }
}
