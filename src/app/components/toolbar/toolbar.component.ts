import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { faFolderPlus, faFileUpload, faSortAlphaDown, faSortAmountDown, faSortNumericDown, faList, faDownload, faTrashAlt, faShareAlt, faICursor } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  @Input('selectedCount') selectedCount: number = 0;
  @Output('action') action = new EventEmitter();
  faFolderPlus = faFolderPlus;
  faFileUpload = faFileUpload;
  faSortAlphaDown = faSortAlphaDown;
  faSortAmountDown = faSortAmountDown;
  faSortNumericDown = faSortNumericDown;
  faList = faList;
  faDownload = faDownload;
  faTrashAlt = faTrashAlt;
  faShareAlt = faShareAlt;
  faICursor = faICursor;
  constructor() { }

  ngOnInit(): void {
  }

  emitEvent(val: string) {
    this.action.emit(val);
  }
}
