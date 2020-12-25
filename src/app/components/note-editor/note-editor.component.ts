import { NoteModel } from './../../interfaces/note.interface';
import { DOCUMENT } from '@angular/common';
import { Component, OnInit, Output, EventEmitter, Inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { faPlus, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-note-editor',
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.css', '../notes/notes.component.css']
})
export class NoteEditorComponent implements OnInit, OnChanges {
  faPlus = faPlus;
  faCheck = faCheck;
  faTimes = faTimes;

  @Input('note') note: NoteModel = { title: '', body: '' };
  @Input('state') state: string = '';
  @Output('noteEditorEvent') noteEditorEvent = new EventEmitter();
  @Output('changeState') changeState = new EventEmitter();
  colors: string[] = ['#D98880', '#F1948A', '#C39BD3', '#BB8FCE', '#7FB3D5', '#85C1E9', '#76D7C4', '#73C6B6', '#7DCEA0', '#82E0AA', '#82E0AA', '#F7DC6F', '#F8C471', '#F0B27A', '#E59866', '#85929E'];
  nextColor = '#FFFFFF';
  constructor(@Inject(DOCUMENT) document: any) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.note && this.state === 'edit')
      this.getFocus('edit');
  }

  ngOnInit(): void {
    this.nextColor = this.getRandomColor();
  }

  addNote() {
    let color = this.nextColor;
    this.nextColor = this.getRandomColor();
    let title = document.querySelector('#title-text-add');
    let body = document.querySelector('#body-text-add');
    if ((title instanceof HTMLInputElement) && (body instanceof HTMLTextAreaElement)) {
      this.noteEditorEvent.emit({
        action: 'add',
        note: {
          title: title.value,
          body: body.value,
          color: color
        }
      });
    }
  }

  updateNote() {
    let title = document.querySelector('#title-text-edit');
    let body = document.querySelector('#body-text-edit');
    if ((title instanceof HTMLInputElement) && (body instanceof HTMLTextAreaElement)) {
      this.noteEditorEvent.emit({
        action: 'update',
        note: {
          id: this.note.id,
          title: title.value,
          body: body.value,
          color: this.note.color,
          creationDate: this.note.creationDate,
          modificationDate: this.note.modificationDate
        }
      });
    }
  }

  doChangeState(state: string) {
    this.changeState.emit(state);
  }

  getRandomColor(): string {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  getFocus(val: string) {
    setTimeout(() => {
      let elem;
      if (val === 'add')
        elem = document.querySelector('#title-text-add');
      else if (val === 'edit')
        elem = document.querySelector('#title-text-edit')

      if (elem instanceof HTMLInputElement)
        elem.focus();
    }, 500)

  }

}
