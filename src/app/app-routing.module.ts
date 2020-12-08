import { DriveComponent } from './components/drive/drive.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './services/auth-guard.service';

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'drive/:id', component: DriveComponent, canActivate: [AuthGuard] },
  // { path: 'second-component', component: SecondComponent },
  // { path: 'third-component/:id/:name', component: ThirdComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
