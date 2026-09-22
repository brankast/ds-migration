import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { AssessmentService } from '../../assessment.service';

@Component({
  selector: 'app-assurance',
  imports: [MatButtonModule, MatChipsModule, MatTableModule],
  templateUrl: './assurance.html',
  styleUrl: './assurance.scss',
})
export class Assurance {
  protected readonly assessmentService = inject(AssessmentService);
  protected readonly columns = ['component', 'api', 'action', 'files'];

  eventFor(changeId: string) {
    return this.assessmentService
      .assessment()
      ?.changeEvents.find((event) => event.id === changeId);
  }

  reload(): void {
    this.assessmentService.loadLatest();
  }
}
