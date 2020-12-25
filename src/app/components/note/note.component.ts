import { NoteModel } from './../../interfaces/note.interface';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css', '../notes/notes.component.css']
})
export class NoteComponent implements OnInit {
  faTrashAlt = faTrashAlt;
  faEdit = faEdit;
  @Input('note') note: NoteModel = { title: '', body: '' };
  @Output('noteEvent') noteEvent = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }

  onClick(action: string) {
    window.scrollTo(0, 0);
    this.noteEvent.emit({
      action: action,
      note: {
        id: this.note.id,
      }
    });
  }

}
