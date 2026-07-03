import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Welcome } from './welcome/welcome';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'welcome', component: Welcome }
];
