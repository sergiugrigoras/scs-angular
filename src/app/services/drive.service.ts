import { DiskModel } from './../interfaces/disk.interface';
import { FsoModel } from './../interfaces/fso.interface';
import { environment } from './../../environments/environment';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, catchError, retry, tap } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

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

  upload(formData: FormData): Observable<HttpEvent<Object>> {
    return this.http.post(apiUrl + '/api/fso/upload', formData,
      {
        observe: 'events',
        reportProgress: true
      });
  }
  download(list: string[]): Observable<HttpEvent<Object>> {
    let csv = list.join(',');
    let formData = new FormData();
    formData.append('fsoIdcsv', csv);
    return this.http.post<Blob>(apiUrl + '/api/fso/download', formData, {
      observe: 'events',
      reportProgress: true,
      responseType: 'blob' as 'json',
    });
  }

  share(list: string[]) {
    let csv = list.join(',');
    let formData = new FormData();
    formData.append('fsoIdcsv', csv);
    return this.http.post(apiUrl + '/api/share/add', formData, {
      responseType: 'text'
    });
  }

  getShareContent(shareId: string) {
    return this.http.get<FsoModel[]>(apiUrl + '/api/share/get/' + shareId);
  }

  downloadShare(shareId: string) {
    return this.http.get<Blob>(apiUrl + '/api/share/download/' + shareId, {
      observe: 'events',
      reportProgress: true,
      responseType: 'blob' as 'json',
    });
  }
}
