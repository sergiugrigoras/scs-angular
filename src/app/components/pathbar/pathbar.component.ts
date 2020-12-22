import { FsoModel } from './../../interfaces/fso.interface';
import { Component, Input, OnInit } from '@angular/core';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'pathbar',
  templateUrl: './pathbar.component.html',
  styleUrls: ['./pathbar.component.css']
})
export class PathbarComponent implements OnInit {
  @Input('fullPathArr') fullPathArr: FsoModel[] = [];
  faAngleRight = faAngleRight;
  constructor() {
  }

  ngOnInit(): void {
  }

}
