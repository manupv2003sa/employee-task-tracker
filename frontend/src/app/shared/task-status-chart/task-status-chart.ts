
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import { BaseChartDirective } from 'ng2-charts';

import {
  ChartData,
  ChartOptions
} from 'chart.js';

@Component({
  selector: 'app-task-status-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './task-status-chart.html',
  styleUrl:  './task-status-chart.scss'
})
export class TaskStatusChart implements OnChanges {

  @Input() todo = 0;
  @Input() inProgress = 0;
  @Input() completed = 0;

  doughnutChartType: 'doughnut' = 'doughnut';

  doughnutChartData: ChartData<'doughnut', number[], string> = {
    labels: ['To Do', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: [
          '#F59E0B',
          '#3B82F6',
          '#10B981'
        ],
        hoverBackgroundColor: [
          '#D97706',
          '#2563EB',
          '#059669'
        ],
        borderWidth: 0,
        hoverOffset: 8
      }
    ]
  };

  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    this.doughnutChartData = {
      labels: ['To Do', 'In Progress', 'Completed'],
      datasets: [
        {
          data: [
            Number(this.todo) || 0,
            Number(this.inProgress) || 0,
            Number(this.completed) || 0
          ],
          backgroundColor: [
            '#F59E0B',
            '#3B82F6',
            '#10B981'
          ],
          hoverBackgroundColor: [
            '#D97706',
            '#2563EB',
            '#059669'
          ],
          borderWidth: 0,
          hoverOffset: 8
        }
      ]
    };
  }

  get totalTasks(): number {
    return this.todo + this.inProgress + this.completed;
  }
}
