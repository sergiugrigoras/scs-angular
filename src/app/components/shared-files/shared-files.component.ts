import { HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { FsoModel } from 'src/app/interfaces/fso.interface';
import { DriveService } from 'src/app/services/drive.service';

@Component({
  selector: 'app-shared-files',
  templateUrl: './shared-files.component.html',
  styleUrls: ['./shared-files.component.css']
})
export class SharedFilesComponent implements OnInit {
  id = '';
  content: FsoModel[] = [];
  progress = '';
  constructor(private route: ActivatedRoute, private driveService: DriveService,) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        let id = params.get('id');
        if (id)
          return of(id);
        else
          return throwError('No id');
      }),
      tap(id => {
        this.id = id;
      }),
      switchMap(id => {
        return this.driveService.getShareContent(id);
      }),
      tap(content => {
        this.content = content;
      })
    ).subscribe();
  }

  download() {
    let downloadFileName = '';
    if (this.content.length == 1 && !this.content[0].isFolder)
      downloadFileName = this.content[0].name;
    else downloadFileName = `files-${Date.now()}`;

    this.driveService.downloadShare(this.id).subscribe(
      (event) => {
        if (event.type === HttpEventType.Response) {
          var FileSaver = require('file-saver');
          FileSaver.saveAs(<Blob>event.body, downloadFileName);
          setTimeout(() => {
            this.progress = '';
          }, 2000);
        }
        else if (event.type === HttpEventType.DownloadProgress && event.total) {
          this.progress = String(Math.round((100 * event.loaded) / event.total));
        }
      }
    );
  }
}
