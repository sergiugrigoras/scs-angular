import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { FsoModel } from './../../interfaces/fso.interface';
import { DriveService } from './../../services/drive.service';
import { Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-drive',
  templateUrl: './drive.component.html',
  styleUrls: ['./drive.component.css']
})
export class DriveComponent implements OnInit {
  id: number = -1;
  content: FsoModel[];
  folder: FsoModel;
  focusIndex: number = 0;
  newFolderName: string = '';
  @ViewChild('newFolderModal') newFolderModal?: TemplateRef<any>;
  @ViewChild('renameConfirmModal') renameConfirmModal?: TemplateRef<any>;
  @ViewChild('deleteConfirmModal') deleteConfirmModal?: TemplateRef<any>;
  @ViewChild('inputFiles') inputFiles?: ElementRef;

  constructor(private driveService: DriveService, private route: ActivatedRoute, private router: Router, private modalService: NgbModal, @Inject(DOCUMENT) document: any) {
    this.content = [];
    this.folder = {
      isFolder: true,
      name: '',
      parentId: null
    };
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      if (params.get('id'))
        this.id = +params.get('id')!;
      if (this.id > 0) {
        this.driveService.getFso(this.id).subscribe(data => {
          this.folder = data;
          if (data.isFolder) {
            this.driveService.getFolderContent(this.id).subscribe(data => {
              this.content = data;
            });
          }
        }, error => {
          if (error instanceof HttpErrorResponse && error.status === 401)
            this.redirectToRoot();
        });
      } else {
        this.redirectToRoot();
      }
    });
  }

  redirectToRoot() {
    this.driveService.getUserDriveId().subscribe(data => {
      let id = (<any>data).id;
      this.router.navigate([`drive/${id}`]);
    });
  }

  fsoTouched(event: any) {
    //console.log(event);

    if (!event.ctrlKey && !event.shiftKey) {
      let lastTouched = this.content.find(elem => elem.id == event.id);
      if (lastTouched)
        this.focusIndex = this.content.indexOf(lastTouched);

      this.content.forEach(elem => {
        if (elem.id != event.id)
          elem.isSelected = false;
        else
          elem.isSelected = true;
      });
    } else if (event.ctrlKey && !event.shiftKey) {
      let lastTouched = this.content.find(elem => elem.id == event.id);
      if (lastTouched)
        this.focusIndex = this.content.indexOf(lastTouched);
    }


    if (event.shiftKey) {
      let f = this.content.find(elem => elem.id == event.id);
      if (f) {
        this.content.forEach(elem => {
          if (this.between(this.content.indexOf(elem), this.focusIndex, this.content.indexOf(f!)))
            elem.isSelected = true;
          else
            elem.isSelected = false;
        });
      }
    }
  }

  openFolder(event: any) {
    this.router.navigate([`drive/${event.id}`]);
  }

  addFolder(name: HTMLInputElement) {
    console.log(name.value.length);
    this.driveService.addFolder({
      isFolder: true,
      name: name.value,
      parentId: this.id
    }).subscribe(result => {
      this.content.push(result);
    });
  }

  deleteSelected() {
    let delArr: string[] = [];
    this.content.forEach(elem => {
      if (elem.isSelected) {
        delArr.push(String(elem.id!));
      }
    });
    this.removeFsoFromUI(delArr);
    this.driveService.delete(delArr).subscribe();
  }

  openModal(options: string) {
    switch (options) {
      case 'new': {
        let modalRef = this.modalService.open(this.newFolderModal, { ariaLabelledBy: 'modal-basic-title', animation: true });
        modalRef.shown.subscribe(() => {
          document.getElementById('new-folder-input')?.focus();
        });
        break;
      }
      case 'delete': {
        let modalRef = this.modalService.open(this.deleteConfirmModal, { ariaLabelledBy: 'modal-basic-title', animation: true });
        modalRef.shown.subscribe(() => {
          document.getElementById('confirm-delete-button')?.focus();
        });
        break;
      }
      case 'rename': {
        let modalRef = this.modalService.open(this.renameConfirmModal, { ariaLabelledBy: 'modal-basic-title', animation: true });
        modalRef.shown.subscribe(() => {
          let firstSelectedFso = this.content.find(elem => elem.isSelected);
          let htmlInput = (<HTMLInputElement>document.getElementById('rename-input'));
          if (firstSelectedFso && htmlInput) {
            htmlInput.value = firstSelectedFso.name;
            htmlInput.focus();
          }
        });
        break;
      }
      default: {
        break;
      }
    }
  }

  rename(input: HTMLInputElement) {
    let newFso = this.content.find(elem => elem.isSelected);
    if (newFso) {
      newFso.name = input.value;
      this.driveService.rename(newFso).subscribe();
    }
  }

  uploadFile = (files: FileList | null) => {
    if (files) {
      const formData = new FormData();
      Array.from(files).map((file, index) => {
        return formData.append('file' + index, file, file.name);
      });
      formData.append('parentId', String(this.folder.id!));

      this.driveService.upload(formData).subscribe(data => {
        data.forEach(e => {
          this.content.push(e);
        })
      });
      // this.driveService.upload(formData).subscribe(event => {
      //   if (event.type === HttpEventType.UploadProgress && event.total)
      //     console.log('progress', Math.round(100 * event.loaded / event.total));
      //   else if (event.type === HttpEventType.Response) {
      //     console.log('Upload success.');
      //   }
      // });
    }
  }

  download() {
    let fsoIdArr: string[] = [];
    let fsoArr: FsoModel[] = [];
    this.content.forEach(elem => {
      if (elem.isSelected) {
        fsoIdArr.push(String(elem.id!));
        fsoArr.push(elem);
      }
    });
    let downloadFileName = '';
    if (fsoArr.length == 1 && !fsoArr[0].isFolder)
      downloadFileName = fsoArr[0].name;
    else
      downloadFileName = 'files.zip';

    this.driveService.download(fsoIdArr, this.folder).subscribe(blob => {
      var FileSaver = require('file-saver');
      FileSaver.saveAs(blob, downloadFileName);
    });
  }

  doAction(event: string) {
    switch (event) {
      case 'new': {
        this.openModal('new')
        break;
      }
      case 'upload': {
        this.inputFiles?.nativeElement.click();
        break;
      }
      case 'download': {
        this.download();
        break;
      }
      case 'delete': {
        this.openModal('delete');
        break;
      }
      case 'rename': {
        this.openModal('rename');
        break;
      }
      default: {
        break;
      }
    }
  }

  private between(x: number, val1: number, val2: number): boolean {
    if (val1 <= val2)
      return x >= val1 && x <= val2;
    else
      return x >= val2 && x <= val1;
  }

  private removeFsoFromUI(list: string[]) {
    list.forEach(id => {
      let fso = this.content.find(elem => elem.id == +id);
      if (fso) {
        let index = this.content.indexOf(fso);
        this.content.splice(index, 1);
      }
    });
  }

  get selectedCount() {
    let c = 0;
    this.content.forEach(elem => {
      if (elem.isSelected) c++
    });
    return c;
  }

}
