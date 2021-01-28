import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ShareModel } from 'src/app/interfaces/share.interface';
import { DriveService } from 'src/app/services/drive.service';
import { faTrashAlt, faChevronDown, faChevronRight, faCheck, faTimes, faCopy } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'shares',
  templateUrl: './shares.component.html',
  styleUrls: ['./shares.component.css']
})
export class SharesComponent implements OnInit {

  shares: ShareModel[] = [];
  faTrashAlt = faTrashAlt;
  faChevronDown = faChevronDown;
  faChevronRight = faChevronRight;
  faCheck = faCheck;
  faTimes = faTimes;
  faCopy = faCopy;

  constructor(private driveService: DriveService) { }

  ngOnInit(): void {
    this.driveService.getAllUsersShares().subscribe(res => {
      this.shares = res;
    });
  }

  deleteBtnClick(index: number) {
    document.getElementById(`delete-btn-${index}`)!.hidden = true;
    document.getElementById(`copy-btn-${index}`)!.hidden = true;
    document.getElementById(`cancel-btn-${index}`)!.hidden = false;
    document.getElementById(`confirm-btn-${index}`)!.hidden = false;
  }

  cancelBtnClick(index: number) {
    document.getElementById(`delete-btn-${index}`)!.hidden = false;
    document.getElementById(`copy-btn-${index}`)!.hidden = false;
    document.getElementById(`cancel-btn-${index}`)!.hidden = true;
    document.getElementById(`confirm-btn-${index}`)!.hidden = true;
  }

  confirmBtnClick(index: number) {
    let publicId = this.shares[index].publicId;
    this.shares.splice(index, 1);
    this.driveService.deleteShare(publicId!).subscribe();
  }

  copyBtnClick(index: number) {
    console.log(this.driveService.getShareUrl(this.shares[index].publicId!));
    const input = document.createElement('input');
    input.type = 'text';
    input.style.position = 'fixed';
    input.style.left = '0';
    input.style.top = '0';
    input.style.opacity = '0';
    input.value = this.driveService.getShareUrl(this.shares[index].publicId!);
    document.body.appendChild(input);
    input.focus();
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
  }
}
