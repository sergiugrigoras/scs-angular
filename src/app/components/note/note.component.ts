import { NoteModel } from './../../interfaces/note.interface';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css']
})
export class NoteComponent implements OnInit {

  @Input('note') note: NoteModel = { title: '', body: '' };
  constructor() { }

  ngOnInit(): void {
  }

}
