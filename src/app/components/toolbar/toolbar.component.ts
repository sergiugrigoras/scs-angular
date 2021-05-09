import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { faFolderPlus, faFileUpload, faSortAlphaDown, faSortAmountDown, faSortNumericDown, faList, faDownload, faTrashAlt, faShareAlt, faICursor, faCut, faPaste } from '@fortawesome/free-solid-svg-icons';

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
  faCut = faCut;
  faPaste = faPaste;
  constructor() { }

  ngOnInit(): void {
  }

  emitEvent(val: string) {
    this.action.emit(val);
  }

  get isClipboardEmpty() {
    return sessionStorage.getItem('clipboard') == null ? true : false;
  }

  get clipboardCount() {
    if (!this.isClipboardEmpty)
      return sessionStorage.getItem('clipboard')?.split(',').length;
    return 0;
  }
}
