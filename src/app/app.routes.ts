import { Routes } from '@angular/router';
import { FormPage } from './pages/form/form';
import { Assurance } from './pages/assurance/assurance';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'checkout' },
  { path: 'checkout', component: FormPage },
  { path: 'assurance', component: Assurance },
];
