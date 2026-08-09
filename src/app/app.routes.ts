
import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Virement } from './pages/virement/virement';
import { Historique } from './pages/historique/historique';
import { Compte } from './pages/compte/compte';
import { Parametre } from './pages/parametre/parametre';
import { Profil } from './pages/profil/profil';
import { Notifications } from './pages/notifications/notifications';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { SendToken } from './pages/send-token/send-token';


export const routes: Routes = [

  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {path: 'login', component:Login},
  {path: 'register', component:Register},
  {path: 'sendToken', component:SendToken},
  { path: 'dashboard', component: Dashboard },
  { path: 'notifications', component: Notifications },
  { path: 'virement', component: Virement },
  { path: 'historique', component: Historique },
  { path: 'compte', component: Compte },
  {path: 'parametre', component: Parametre},

  {path: 'profil', component: Profil},
  { path: '**', redirectTo: '/dashboard' }
];