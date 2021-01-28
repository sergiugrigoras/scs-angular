import { Component, Input, OnInit } from '@angular/core';
import { ShareModel } from 'src/app/interfaces/share.interface';

@Component({
  selector: 'share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.css']
})
export class ShareComponent implements OnInit {

  constructor() { }
  @Input('share') share: ShareModel = { id: 0 };
  ngOnInit(): void {
  }

}
