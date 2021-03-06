import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';

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
import { AppErrorHandler } from './model/app-error-handler';
import { PathbarComponent } from './components/pathbar/pathbar.component';
import { DiskinfoComponent } from './components/diskinfo/diskinfo.component';
import { NotesComponent } from './components/notes/notes.component';
import { NoteComponent } from './components/note/note.component';
import { NoteEditorComponent } from './components/note-editor/note-editor.component';
import { ToastsComponent } from './components/toasts/toasts.component';
import { FsoAltComponent } from './components/fso-alt/fso-alt.component';
import { UploadProgressComponent } from './components/progress-bar/progress-bar.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ViewNoteComponent } from './components/view-note/view-note.component';
import { SharedFilesComponent } from './components/shared-files/shared-files.component';
import { SharedFsoComponent } from './components/shared-fso/shared-fso.component';
import { SharesComponent } from './components/shares/shares.component';

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
    ToolbarComponent,
    PathbarComponent,
    DiskinfoComponent,
    NotesComponent,
    NoteComponent,
    NoteEditorComponent,
    ToastsComponent,
    FsoAltComponent,
    UploadProgressComponent,
    ProfileComponent,
    ResetPasswordComponent,
    ViewNoteComponent,
    SharedFilesComponent,
    SharedFsoComponent,
    SharesComponent,
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
    },
    {
      provide: ErrorHandler,
      useClass: AppErrorHandler
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
