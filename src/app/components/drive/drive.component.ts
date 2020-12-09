import { FsoModel } from './../../interfaces/fso.interface';
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
    this.route.paramMap.subscribe(params => { this.id = params.get('id') });
    if (this.id) {
      this.driveService.getFso(this.id).subscribe(data => {
        console.log(data);
      });
    } else {
      this.driveService.getUserDrive().subscribe(data => {
        let id = (<any>data).id;
        this.router.navigate([`drive/${id}`]);
      });
    }
  }
}
