import { DiskModel } from './../interfaces/disk.interface';
import { FsoModel } from './../interfaces/fso.interface';
import { environment } from './../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';

const apiUrl: string = environment.apiUrl;
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
}
@Injectable({
  providedIn: 'root'
})
export class DriveService {

  constructor(private http: HttpClient, private router: Router) { }

  getFso(id: any) {
    return this.http.get<FsoModel>(apiUrl + '/api/fso/' + id);
  }

  getFolderContent(id: any) {
    return this.http.get<FsoModel[]>(apiUrl + '/api/fso/folder/' + id);
  }

  getFullPath(id: any) {
    return this.http.get<FsoModel[]>(apiUrl + '/api/fso/fullpath/' + id);
  }

  getUserDrive() {
    return this.http.get<FsoModel>(apiUrl + '/api/fso/getuserdrive');
  }

  getUserDiskInfo() {
    return this.http.get<DiskModel>(apiUrl + '/api/fso/getuserdiskinfo');
  }
  addFolder(fso: FsoModel) {
    return this.http.post<FsoModel>(apiUrl + '/api/fso/addfolder', fso, httpOptions);
  }

  delete(list: string[]) {
    let csv = list.join(',');
    return this.http.delete(apiUrl + '/api/fso/delete', {
      headers: { 'Content-Type': 'application/json' }, params: { fsoIdcsv: csv }
    }).pipe(retry(3), map(data => {
      return data;
    }));
  }
  rename(fso: FsoModel) {
    return this.http.put(apiUrl + '/api/fso/rename', fso, httpOptions);
  }

  upload(formData: FormData) {
    return this.http.post<FsoModel[]>(apiUrl + '/api/fso/upload', formData, { observe: 'body' });
  }
  download(list: string[], root: FsoModel) {
    let csv = list.join(',');
    let formData = new FormData();
    formData.append('rootId', String(root.id!));
    formData.append('fsoIdcsv', csv);
    return this.http.post<Blob>(apiUrl + '/api/fso/download', formData, {
      observe: 'body',
      responseType: 'blob' as 'json',
    });
  }
}
