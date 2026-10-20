import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from './shared/components/toast/toast';
import { ToastService } from './core/services/toast';

@Component({
  imports: [RouterOutlet,Toast],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('employee-task-tracker-frontend');

 
}
