import { FsoModel } from './../../interfaces/fso.interface';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { faFolder, faFile } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'fso',
  templateUrl: './fso.component.html',
  styleUrls: ['./fso.component.css']
})
export class FsoComponent implements OnInit {

  folderIcon = faFolder;
  fileIcon = faFile;
  ext: string = '';
  @Input('fso') fso: FsoModel = {
    isFolder: true,
    name: '',
    parentId: null,
  };


  @Output('touched') touched = new EventEmitter();
  @Output('open') open = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
    this.ext = this.fso.name.split('.').pop()!.toUpperCase();
  }

  onClick(event: any) {
    this.fso.isSelected = !this.fso.isSelected;
    this.touched.emit({
      id: this.fso.id,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey
    });
  }

  onDblClick() {
    if (this.fso.isFolder)
      this.open.emit({
        id: this.fso.id,
      });
  }
}
