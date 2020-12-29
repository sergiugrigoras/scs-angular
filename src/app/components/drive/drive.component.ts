import { UploadModel } from './../../interfaces/upload.interface';
import { environment } from 'src/environments/environment';
import { ToastService } from './../../services/toast.service';
import { DiskModel } from './../../interfaces/disk.interface';
import { tap, switchMap, catchError, map } from 'rxjs/operators';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';
import { FsoModel } from './../../interfaces/fso.interface';
import { DriveService } from './../../services/drive.service';
import { Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild, Pipe } from '@angular/core';
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
  fullPath: FsoModel[];
  disk: DiskModel;
  forbiddenChar: string[];
  isFsoNameValid: boolean = false;
  view: string = '';
  upload: UploadModel = {
    progress: 0,
    text: '',
    isUploading: false,
    loaded: 0,
    total: 0,
    background: 'success',
  }

  @ViewChild('newFolderModal') newFolderModal?: TemplateRef<any>;
  @ViewChild('renameConfirmModal') renameConfirmModal?: TemplateRef<any>;
  @ViewChild('deleteConfirmModal') deleteConfirmModal?: TemplateRef<any>;
  @ViewChild('inputFiles') inputFiles?: ElementRef;
  sortByNameAscFn = (a: FsoModel, b: FsoModel) => {
    let x = a.isFolder;
    let y = b.isFolder;
    if (x && y)
      return a.name.localeCompare(b.name);
    else if (x || y)
      return (x) ? -1 : 1;
    return a.name.localeCompare(b.name);
  }

  sortByNameDescFn = (a: FsoModel, b: FsoModel) => {
    let x = a.isFolder;
    let y = b.isFolder;
    if (x && y)
      return b.name.localeCompare(a.name);
    else if (x || y)
      return (x) ? 1 : -1;
    return b.name.localeCompare(a.name);
  }

  sortBySizeAscFn = (a: FsoModel, b: FsoModel) => {
    let x = a.isFolder;
    let y = b.isFolder;
    if (x && y)
      return a.name.localeCompare(b.name);
    else if (x || y)
      return (x) ? -1 : 1;
    return (a.fileSize! > b.fileSize!) ? 1 : -1;
  }

  sortBySizeDescFn = (a: FsoModel, b: FsoModel) => {
    let x = a.isFolder;
    let y = b.isFolder;
    if (x && y)
      return a.name.localeCompare(b.name);
    else if (x || y)
      return (x) ? 1 : -1;
    return (a.fileSize! > b.fileSize!) ? -1 : 1;
  }

  sortByDateAscFn = (a: FsoModel, b: FsoModel) => {
    let x = a.isFolder;
    let y = b.isFolder;
    if (x && y)
      return (a.date! > b.date!) ? 1 : -1
    else if (x || y)
      return (x) ? -1 : 1;
    return (a.date! > b.date!) ? 1 : -1;
  }

  sortByDateDescFn = (a: FsoModel, b: FsoModel) => {
    let x = a.isFolder;
    let y = b.isFolder;
    if (x && y)
      return (a.date! > b.date!) ? -1 : 1
    else if (x || y)
      return (x) ? 1 : -1;
    return (a.date! > b.date!) ? -1 : 1;
  }

  sorter: BehaviorSubject<any> = new BehaviorSubject<any>(this.sortByNameAscFn);
  sortedBy: any;

  constructor(private driveService: DriveService, private route: ActivatedRoute, private router: Router, private modalService: NgbModal, private toastService: ToastService, @Inject(DOCUMENT) document: any) {
    this.fullPath = [];
    this.content = [];
    this.folder = {
      isFolder: true,
      name: '',
      parentId: null
    };
    this.disk = { usedBytes: 0, totalBytes: 0, diskUsed: 0 }
    this.forbiddenChar = ['<', '>', ':', '"', '/', '\\', '|', '?', '*',];
    for (let i = 0; i <= 31; i++)
      this.forbiddenChar.unshift(String.fromCharCode(i));
    this.forbiddenChar.unshift(String.fromCharCode(127));
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      if (params.get('id'))
        this.id = +params.get('id')!;
      if (this.id > 0) {
        this.driveService.getFso(this.id).subscribe(fso => {
          this.folder = fso;
          if (fso.isFolder) {
            this.driveService.getUserDiskInfo().pipe(tap((res) => { this.disk = res })).subscribe();
            this.driveService.getFullPath(this.id).subscribe((res: FsoModel[]) => { this.fullPath = res });
            this.driveService.getFolderContent(this.id).subscribe(folderContent => {
              this.content = folderContent;
              this.sorter.subscribe(sortFn => {
                this.content = this.content.sort(sortFn);
                this.sortedBy = sortFn;
              });
              let view = localStorage.getItem(`view-${this.id}`);
              if (view)
                this.view = view;
              else {
                this.view = 'listView';
                localStorage.setItem(`view-${this.id}`, 'listView');
              }
            });
          } else {
            this.router.navigate([`drive/${fso.parentId}`]);
          }
        }, error => {
          let httpErrStatus = [401, 403, 404];
          if (error instanceof HttpErrorResponse && httpErrStatus.includes(error.status))
            this.redirectToRoot();
        });
      } else {
        this.redirectToRoot();
      }
    });
  }

  redirectToRoot() {
    this.driveService.getUserDrive().subscribe(fso => {
      this.router.navigate([`drive/${fso.id}`]);
    });
  }

  fsoTouched(event: any) {
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
    this.driveService.addFolder({
      isFolder: true,
      name: name.value.trim(),
      parentId: this.id
    }).subscribe(result => {
      this.content.push(result);
      this.content.sort(this.sortedBy);
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
    this.driveService.delete(delArr).pipe(tap(() => { this.driveService.getUserDiskInfo().pipe(tap((res) => { this.disk = res })).subscribe() })).subscribe();
  }

  openModal(options: string) {
    switch (options) {
      case 'new': {
        let modalRef = this.modalService.open(this.newFolderModal, { ariaLabelledBy: 'modal-basic-title', animation: true });
        modalRef.shown.subscribe(() => {
          document.getElementById('new-folder-input')?.focus();
        });
        modalRef.dismissed.subscribe(() => {
          this.resetFields();
        });
        modalRef.closed.subscribe(() => {
          this.resetFields();
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
        modalRef.dismissed.subscribe(() => {
          this.resetFields();
        });
        modalRef.closed.subscribe(() => {
          this.resetFields();
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

  async uploadFile(files: FileList | null) {
    if (files) {
      let fileAlreadyExists = false;
      let totalSize = 0;
      const formData = new FormData();
      let disk = await this.driveService.getUserDiskInfo().toPromise();
      Array.from(files).map((file, index) => {
        if (this.content.find(elem => elem.name === file.name))
          fileAlreadyExists = true;

        totalSize += file.size;
        return formData.append('file' + index, file, file.name);
      });
      if (fileAlreadyExists) {
        this.toastService.show('Error', 'File already exists', 'bg-danger');
      }
      else if ((totalSize + +disk.usedBytes) > +disk.totalBytes) {

        this.toastService.show('Error', 'Not enough space', 'bg-danger');
      }
      else if (totalSize > environment.maxUploadSize) {
        this.toastService.show('Error', 'Max file(s) size 250MB', 'bg-danger');
      }
      else {
        formData.append('rootId', String(this.folder.id!));
        this.driveService.upload(formData).subscribe(event => {
          if (event.type === HttpEventType.Response) {
            (<FsoModel[]>event.body).forEach(e => {
              this.content.push(e);
            });
            this.driveService.getUserDiskInfo().pipe(tap((res) => { this.disk = res })).subscribe();
            this.upload.text = 'Compleated';
            setTimeout(() => {
              this.upload.isUploading = false;
            }, 2000);
          }
          else if (event.type === HttpEventType.UploadProgress && event.total) {
            this.upload.progress = Math.round(100 * event.loaded / event.total);
            this.upload.text = String(this.upload.progress) + '%';
            this.upload.loaded = event.loaded;
            this.upload.total = event.total;
            this.upload.isUploading = true;
          }
          this.content.sort(this.sortedBy);
        },
          () => {
            this.upload.text = 'Error';
            this.upload.background = 'danger';
            setTimeout(() => {
              this.upload.isUploading = false;
            }, 2000);
          });
      }
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
      downloadFileName = `files-${Date.now()}`;

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
      case 'sortName': {
        if (this.sortedBy === this.sortByNameAscFn) {
          this.sorter.next(this.sortByNameDescFn);
          this.sortedBy = this.sortByNameDescFn;
        } else {
          this.sorter.next(this.sortByNameAscFn);
          this.sortedBy = this.sortByNameAscFn;
        }
        break;
      }
      case 'sortSize': {
        if (this.sortedBy === this.sortBySizeAscFn) {
          this.sorter.next(this.sortBySizeDescFn);
          this.sortedBy = this.sortBySizeDescFn;
        } else {
          this.sorter.next(this.sortBySizeAscFn);
          this.sortedBy = this.sortBySizeAscFn;
        }
        break;
      }
      case 'sortDate': {
        if (this.sortedBy === this.sortByDateAscFn) {
          this.sorter.next(this.sortByDateDescFn);
          this.sortedBy = this.sortByDateDescFn;
        } else {
          this.sorter.next(this.sortByDateAscFn);
          this.sortedBy = this.sortByDateAscFn;
        }
        break;
      }
      case 'changeView': {
        if (this.view === 'listView') {
          this.view = 'iconView';
          localStorage.setItem(`view-${this.id}`, 'iconView');
        }
        else if (this.view === 'iconView') {
          this.view = 'listView';
          localStorage.setItem(`view-${this.id}`, 'listView');
        }
        else {
          this.view = 'listView';
          localStorage.setItem(`view-${this.id}`, 'listView');
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  checkFsoName(input: HTMLInputElement, keyEvent: KeyboardEvent) {

    if (this.validKeyCode(keyEvent.code)) {
      this.isFsoNameValid = true;
      let name = input.value.trim();
      if (name.length == 0) {
        this.isFsoNameValid = false;
      }
      if (name.slice(-1) == '.') {
        this.isFsoNameValid = false;
        this.toastService.show('Error', 'Name can\'t end in period', 'bg-warning');
      }
      if (this.forbiddenChar.some(c => name.includes(c))) {
        this.isFsoNameValid = false;
        this.toastService.show('Error', 'Name contains invalid characters', 'bg-warning');
      }
      let fso = this.content.find(elem => elem.name.toLowerCase() === name.toLowerCase());
      if (fso) {
        this.isFsoNameValid = false;
        this.toastService.show('Error', 'Already exists', 'bg-warning');
      }
    }
  }

  private resetFields() {
    this.isFsoNameValid = false;
    this.newFolderName = '';
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
  private validKeyCode(code: string): boolean {
    let keyCodeArr = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Insert', 'AltLeft', 'ShiftLeft', 'ControlLeft', 'AltRight', 'ControlRight', 'ShiftRight', 'PrintScreen', 'ScrollLock', 'Pause'];
    if (keyCodeArr.includes(code))
      return false;
    else
      return true;
  }
  get selectedCount() {
    let c = 0;
    this.content.forEach(elem => {
      if (elem.isSelected) c++
    });
    return c;
  }

}
