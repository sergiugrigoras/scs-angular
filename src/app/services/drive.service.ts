import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const apiUrl: string = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class DriveService {

  constructor(private http: HttpClient, private router: Router) { }

  getFso(id: any) {
    if (id) {
      this.http.get(apiUrl + '/api/fso/' + id).subscribe(response => {
        console.log(response);
      });
    }
  }
}
