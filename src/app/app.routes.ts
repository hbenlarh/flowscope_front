import { Routes } from '@angular/router';
import { Homepage } from './homepage/homepage';
import { Login } from './login/login';
import { Register } from './register/register';
import { UserDashbord } from './user/user-dashbord/user-dashbord';

export const routes: Routes = [
{path : "",  component: Homepage},
{path : "login",  component: Login},
{path : "register", component: Register},
{path : "Dashboard", component: UserDashbord}
];
