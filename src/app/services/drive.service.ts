import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { FsoModel } from '../interfaces/fso.interface';

const apiUrl: string = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class DriveService {

  constructor(private http: HttpClient, private router: Router) { }

  getFso(id: any) {
    return this.http.get<FsoModel | FsoModel[]>(apiUrl + '/api/fso/' + id);
  }

  getUserDrive() {
    return this.http.get(apiUrl + '/api/fso/getuserdriveid');
  }
}
