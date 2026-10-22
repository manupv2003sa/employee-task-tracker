import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskStatusChart } from './task-status-chart';

describe('TaskStatusChart', () => {
  let component: TaskStatusChart;
  let fixture: ComponentFixture<TaskStatusChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskStatusChart],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskStatusChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
