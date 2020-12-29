import { UploadModel } from './../../interfaces/upload.interface';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'upload-progress',
  templateUrl: './upload-progress.component.html',
  styleUrls: ['./upload-progress.component.css', '../diskinfo/diskinfo.component.css']
})
export class UploadProgressComponent implements OnInit {

  @Input('upload') upload: UploadModel = {
    progress: 0,
    text: '',
    isUploading: false,
    loaded: 0,
    total: 0,
    background: 'success',
  }

  constructor() { }

  ngOnInit(): void {
  }

}
