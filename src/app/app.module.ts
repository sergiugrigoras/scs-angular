import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RegisterComponent } from './components/register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { AuthInterceptor } from './services/auth.interceptor';
import { DriveComponent } from './components/drive/drive.component';
import { AuthGuard } from './services/auth-guard.service';
import { JwtModule } from '@auth0/angular-jwt';
import { NavigationComponent } from './components/navigation/navigation.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { FsoComponent } from './components/fso/fso.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReadableBytesPipe } from './pipes/readable-bytes.pipe';
import { ToolbarComponent } from './components/toolbar/toolbar.component';

function tokenGetter() {
  return localStorage.getItem("jwt");
}

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    DriveComponent,
    NavigationComponent,
    FooterComponent,
    HomeComponent,
    FsoComponent,
    ReadableBytesPipe,
    ToolbarComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    CommonModule,
    AppRoutingModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter
      }
    })
  ],
  providers: [
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
