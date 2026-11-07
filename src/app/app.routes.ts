import { Routes } from '@angular/router';
import { CompanyList } from './company-list/company-list';
import { CompanyForm } from './company-form/company-form';

export const routes: Routes = [
  { path: '', redirectTo: 'companies', pathMatch: 'full' },
  { path: 'companies', component: CompanyList, title: 'Įmonės · Mini CRM' },
  { path: 'companies/new', component: CompanyForm, title: 'Nauja įmonė · Mini CRM' },
  { path: '**', redirectTo: 'companies' },
];
