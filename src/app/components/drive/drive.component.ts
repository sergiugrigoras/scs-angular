import { DriveService } from './../../services/drive.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-drive',
  templateUrl: './drive.component.html',
  styleUrls: ['./drive.component.css']
})
export class DriveComponent implements OnInit {
  id: any;
  constructor(private driveService: DriveService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(
      params => {
        if (params.get('id')) {
          this.id = params.get('id');
        }
      }
    );

    this.driveService.getFso(this.id);
  }

}
