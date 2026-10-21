import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class ExcelExportService {

  exportTasks(
    tasks: Task[],
    fileName: string,
    includeAssignee: boolean = true,
  ): void {

    const excelData = tasks.map((task) => {
      const row: Record<string, string> = {
        'Task Title': task.title,
        Description: task.description || 'No description provided',
        Priority: task.priority,
        Status: task.status.replace('_', ' '),
        'Due Date': this.formatExcelDate(task.dueDate),
      };

      if (includeAssignee) {
        row['Assigned To'] = task.assignee?.name || 'Unassigned';
      }

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet['!cols'] = includeAssignee
      ? [
          { wch: 30 },
          { wch: 45 },
          { wch: 12 },
          { wch: 18 },
          { wch: 18 },
          { wch: 25 },
        ]
      : [
          { wch: 30 },
          { wch: 45 },
          { wch: 12 },
          { wch: 18 },
          { wch: 18 },
        ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');

    const today = new Date();
    const date = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');

    XLSX.writeFile(workbook, `${fileName}-${date}.xlsx`);
  }

  private formatExcelDate(dueDate: string | null): string {
    if (!dueDate) {
      return 'Not set';
    }

    const [year, month, day] = dueDate
      .split('T')[0]
      .split('-')
      .map(Number);

    return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}