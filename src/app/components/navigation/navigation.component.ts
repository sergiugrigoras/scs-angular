import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';


@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  @Input('isLoggedIn') isLoggedIn: boolean = false;
  @Input('user') user: string = '';
  @Output('LoggedOut') LoggedOut = new EventEmitter<string>();
  constructor() { }

  ngOnInit(): void {
  }

  logout() {
    this.LoggedOut.emit();
  }

}
