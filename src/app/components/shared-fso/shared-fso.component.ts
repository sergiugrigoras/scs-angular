import { Component, Input, OnInit } from '@angular/core';
import { FsoModel } from 'src/app/interfaces/fso.interface';
import { faFolder, faFolderOpen, faFile } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'shared-fso',
  templateUrl: './shared-fso.component.html',
  styleUrls: ['./shared-fso.component.css']
})
export class SharedFsoComponent implements OnInit {
  @Input('fso') fso: FsoModel = { isFolder: true, name: '', parentId: null, };
  faFolder = faFolder;
  faFile = faFile;
  faFolderOpen = faFolderOpen;
  isOpen = false;

  constructor() { }

  ngOnInit(): void {
  }

  onClick() {
    this.isOpen = !this.isOpen;
  }

}
