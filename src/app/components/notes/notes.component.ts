import { NoteService } from './../../services/note.service';
import { NoteModel } from './../../interfaces/note.interface';
import { Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { tap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css'],
})
export class NotesComponent implements OnInit {

  notes: NoteModel[] = [];
  activeNoteDel: NoteModel = { title: '', body: '' };
  activeNoteUpdate: NoteModel = { title: '', body: '' };
  noteEditorState: string = 'read';
  @ViewChild('deleteConfirmModal') deleteConfirmModal?: TemplateRef<any>;

  constructor(private noteService: NoteService, private modalService: NgbModal, @Inject(DOCUMENT) document: any) { }

  ngOnInit(): void {
    this.noteService.getAll().pipe(
      tap((notes) => {
        this.notes = notes;
      })
    ).subscribe();
  }

  openModal(options: any) {
    switch (options.action) {
      case 'delete': {
        let note = this.getNoteById(options.note.id);
        if (note)
          this.activeNoteDel = note;
        let modalRef = this.modalService.open(this.deleteConfirmModal, { ariaLabelledBy: 'modal-basic-title', animation: true });
        modalRef.shown.subscribe(() => {
          document.getElementById('confirm-delete-button')?.focus();
        });
        break;
      }
      default: {
        break;
      }
    }
  }

  doAction(event: any) {
    if (event.action === 'delete')
      this.openModal(event);
    else if (event.action === 'edit') {
      this.noteEditorState = 'edit'
      let note = this.getNoteById(event.note.id);
      if (note)
        this.activeNoteUpdate = note;
    }
    else if (event.action === 'update') {
      let note = this.getNoteById(event.note.id);
      if (note) {
        let index = this.notes.indexOf(note);
        this.notes.splice(index, 1, event.note);
        this.noteService.update(event.note).subscribe();
      }
    }
    else if (event.action === 'add') {
      this.noteService.add({
        title: event.note.title,
        body: event.note.body,
        color: event.note.color
      }).subscribe(res => {
        this.notes.unshift(res);
      });
    }

  }

  getNoteById(id: number) {
    return this.notes.find(e => e.id! == id);
  }

  deleteNoteById(id: number) {
    let note = this.getNoteById(id);
    if (note) {
      let index = this.notes.indexOf(note);
      this.notes.splice(index, 1);
    }
  }

  deleteNote() {
    if (this.activeNoteDel) {
      this.deleteNoteById(this.activeNoteDel.id!);
      this.noteService.delete(this.activeNoteDel.id!).subscribe();
    }
  }

  changeNoteEditorState(event: string) {
    this.noteEditorState = event;
  }


}
