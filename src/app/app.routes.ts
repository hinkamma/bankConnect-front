
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
import { AccountSelection } from './pages/account-selection/account-selection';
import { authGuard } from './guards/auth-guard';
import { AccountTypeSelection } from './pages/account-type-selection/account-type-selection';




export const routes: Routes = [

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {path: 'login', component:Login},
  {path: 'register', component:Register},

  
  {path: 'sendToken', component:SendToken, canActivate:[authGuard]},
  {path: 'accountTypeSelection', component:AccountTypeSelection,canActivate:[authGuard]},

  { path: 'dashboard', component: Dashboard, canActivate:[authGuard] },
  { path: 'notifications', component: Notifications, canActivate:[authGuard]},
  { path: 'virement', component: Virement,canActivate:[authGuard]},
  { path: 'historique', component: Historique,canActivate:[authGuard] },
  { path: 'compte', component: Compte,canActivate:[authGuard]},
  {path: 'parametre', component: Parametre,},
  {path: 'profil', component: Profil,canActivate:[authGuard]},


  {path: 'accountSelection',component:AccountSelection},


  { path: '**', redirectTo: '/login' }
];
