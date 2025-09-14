import { Routes } from '@angular/router';
import { Homepage } from './homepage/homepage';
import { Login } from './login/login';
import { Register } from './register/register';
import { UserDashbord } from './user/user-dashbord/user-dashbord';
import { UserOffre } from './user/user-offre/user-offre';
import { AuthGuard } from './auth/auth-guard';
import { DashboardComponent } from './admin/dashboard/dashboard.component';

export const routes: Routes = [
{path : "",  component: Homepage},
{path : "login",  component: Login},
{path : "register", component: Register},
{path : "Dashboard", component: UserDashbord, canActivate: [AuthGuard]},
{path : "admin/Dashboard", component: DashboardComponent},
{path : "addOffre", component: UserOffre}

];
