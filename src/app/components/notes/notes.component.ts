import { NoteService } from './../../services/note.service';
import { NoteModel } from './../../interfaces/note.interface';
import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {

  notes: NoteModel[] = [];
  constructor(private noteService: NoteService) { }

  ngOnInit(): void {
    this.noteService.getAll().pipe(
      tap((notes) => {
        this.notes = notes;
      })
    ).subscribe();
  }

}
