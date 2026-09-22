import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Assessment, Impact } from './models/assessment';

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private readonly http = inject(HttpClient);

  readonly assessment = signal<Assessment | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly affectedImpacts = computed(() => {
    const assessment = this.assessment();
    if (!assessment) {
      return [] as Impact[];
    }
    return assessment.impacts.filter((impact) => impact.action !== 'none');
  });

  loadLatest(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<Assessment>('/assessments/latest.json').subscribe({
      next: (assessment) => {
        this.assessment.set(assessment);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(
          'No assessment found. Run `npm run assure -- run` to generate data/assessments/latest.json.',
        );
        this.loading.set(false);
      },
    });
  }
}
