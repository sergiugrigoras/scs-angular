import { RegGuard } from './services/reg-guard.service';
import { DriveComponent } from './components/drive/drive.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './services/auth-guard.service';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent, canActivate: [RegGuard] },
  { path: 'login', component: LoginComponent, canActivate: [RegGuard] },
  { path: 'drive/:id', component: DriveComponent, canActivate: [AuthGuard] },
  { path: 'drive', component: DriveComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
