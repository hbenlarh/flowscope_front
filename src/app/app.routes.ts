import { Routes } from '@angular/router';
import { Homepage } from './homepage/homepage';
import { Login } from './login/login';
import { Register } from './register/register';
import { UserDashbord } from './user/user-dashbord/user-dashbord';
import { UserOffre } from './user/user-offre/user-offre';
import { AuthGuard } from './auth/auth-guard';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { AdminGuard } from './auth/admin-auth-guard';
import { AdminUsersComponent } from './admin/users/users.component';
import { AdminContainersComponent } from './admin/containers/containers.component';
import { AdminCategoriesComponent } from './admin/categories/categories.component';
import { AdminOffersComponent } from './admin/offers/offers.component';
import { UserMyOffers } from './user/my-offers/my-offers';

export const routes: Routes = [
{path : "",  component: Homepage},
{path : "login",  component: Login},
{path : "register", component: Register},
{path : "Dashboard", component: UserDashbord, canActivate: [AuthGuard]},
{path : "admin/Dashboard", component: DashboardComponent,canActivate: [AdminGuard]},
{path : "admin/users", component: AdminUsersComponent, canActivate: [AdminGuard]},
{path : "admin/containers", component: AdminContainersComponent, canActivate: [AdminGuard]},
{path : "admin/categories", component: AdminCategoriesComponent, canActivate: [AdminGuard]},
{path : "admin/offers", component: AdminOffersComponent, canActivate: [AdminGuard]},
{path : "addOffre", component: UserOffre, canActivate: [AuthGuard]}
,{path : "my-offers", component: UserMyOffers, canActivate: [AuthGuard]}

];
