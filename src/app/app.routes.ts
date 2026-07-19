
import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Virement } from './pages/virement/virement';
import { Historique } from './pages/historique/historique';
import { Compte } from './pages/compte/compte';
import { Parametre } from './pages/parametre/parametre';
import { Profil } from './pages/profil/profil';
import { Notifications } from './pages/notifications/notifications';

export const routes: Routes = [

  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
    { path: 'notifications', component: Notifications },
  { path: 'virement', component: Virement },
  { path: 'historique', component: Historique },
  { path: 'compte', component: Compte },
  {path: 'parametre', component: Parametre},

  {path: 'profil', component: Profil},
  { path: '**', redirectTo: '/dashboard' }
];