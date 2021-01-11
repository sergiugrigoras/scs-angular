import { environment } from './../../../environments/environment';
import { FsoSortService } from './../../services/fso-sort.service';
import { ProgressBarModel } from '../../interfaces/progress-bar.interface';
import { ToastService } from './../../services/toast.service';
import { DiskModel } from './../../interfaces/disk.interface';
import { tap, switchMap, catchError, mapTo } from 'rxjs/operators';
import { BehaviorSubject, of, throwError, Subscription } from 'rxjs';
import { HttpEventType } from '@angular/common/http';
import { FsoModel } from './../../interfaces/fso.interface';
import { DriveService } from './../../services/drive.service';
import { Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DOCUMENT } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-drive',
  templateUrl: './drive.component.html',
  styleUrls: ['./drive.component.css'],
})
export class DriveComponent implements OnInit, OnDestroy {
  private readonly DEFAULT_VIEW = 'listView';
  private readonly DEFAULT_SORT = this.fsoSortService.sortByNameAscFn;

  pageIsReady = false;
  id = -1;
  content: FsoModel[];
  folder: FsoModel;
  focusIndex = 0;
  newFolderName = '';
  fullPath: FsoModel[];
  disk: DiskModel;
  forbiddenChar: string[];
  isFsoNameValid = false;
  view = '';
  progressBar: ProgressBarModel = {
    progress: 0,
    text: '',
    inProgress: false,
    loaded: 0,
    total: 0,
    background: 'success',
  };

  @ViewChild('newFolderModal') newFolderModal?: TemplateRef<any>;
  @ViewChild('renameConfirmModal') renameConfirmModal?: TemplateRef<any>;
  @ViewChild('deleteConfirmModal') deleteConfirmModal?: TemplateRef<any>;
  @ViewChild('inputFiles') inputFiles?: ElementRef;

  sorter: BehaviorSubject<any> = new BehaviorSubject<any>(this.DEFAULT_SORT);
  sorterSubscription: Subscription = new Subscription();
  apiCallsSubscription = new Subscription();
  sortedBy: any;

  constructor(
    private deviceService: DeviceDetectorService,
    private fsoSortService: FsoSortService,
    private driveService: DriveService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private toastService: ToastService,
    @Inject(DOCUMENT) document: any
  ) {
    this.fullPath = [];
    this.content = [];
    this.folder = {
      isFolder: true,
      name: '',
      parentId: null,
    };
    this.disk = { usedBytes: 0, totalBytes: 0, diskUsed: 0 };
    this.forbiddenChar = ['<', '>', ':', '"', '/', '\\', '|', '?', '*'];
    for (let i = 0; i <= 31; i++) {
      this.forbiddenChar.unshift(String.fromCharCode(i));
    }
    this.forbiddenChar.unshift(String.fromCharCode(127));
  }
  ngOnDestroy(): void {
    this.apiCallsSubscription.unsubscribe();
    this.sorterSubscription.unsubscribe();
  }

  // tslint:disable-next-line: typedef
  ngOnInit() {
    this.apiCallsSubscription = this.route.paramMap
      .pipe(
        // get the Id
        switchMap((params) => {
          let id = params.get('id');
          if (id) return this.setId(id);
          else return this.setId();
        })
      )
      .pipe(
        // get the fso from Id
        switchMap((id) => {
          return this.driveService.getFso(id);
        }),
        catchError(() => {
          //catch errors like 401, 403, 404
          return this.driveService
            .getUserDrive()
            .pipe(tap((fso) => (this.id = fso.id!)));
        }),
        catchError((error) => {
          //if can't get the user drive go to home page
          this.router.navigate(['/']);
          return throwError(error);
        }),
        switchMap((fso) => {
          if (fso.isFolder) return of(fso);
          else return this.driveService.getFso(fso.parentId);
        }),
        tap((fso) => (this.id = fso.id!)),
        switchMap((fso) => {
          return this.driveService.getFolderContent(fso.id!);
        }),
        tap((folderContent) => {
          this.content = folderContent;
          let view = localStorage.getItem(`view-${this.id}`);
          if (view) this.view = view;
          else {
            this.view = this.DEFAULT_VIEW;
            localStorage.setItem(`view-${this.id}`, this.DEFAULT_VIEW);
          }
          this.sorterSubscription = this.sorter.subscribe((sortFn) => {
            this.content = this.content.sort(sortFn);
            this.sortedBy = sortFn;
            this.pageIsReady = true;
          });
        }),
        switchMap(() => {
          return this.driveService.getFullPath(this.id);
        }),
        tap((fullPath) => (this.fullPath = fullPath)),
        switchMap(() => {
          return this.driveService.getUserDiskInfo();
        }),
        tap((disk) => (this.disk = disk)),
        mapTo(true)
      )
      .subscribe();
  }

  setId(id?: string) {
    if (id) {
      if (isNaN(+id) || +id <= 0 || !Number.isInteger(+id)) {
        return this.driveService.getUserDrive().pipe(
          switchMap((fso) => {
            return of(fso.id!);
          }),
          tap((id) => (this.id = id))
        );
      } else return of(+id).pipe(tap((id) => (this.id = id)));
    } else {
      return this.driveService.getUserDrive().pipe(
        switchMap((fso) => {
          return of(fso.id!);
        }),
        tap((id) => (this.id = id))
      );
    }
  }

  fsoTouched(event: any) {
    if (!event.ctrlKey && !event.shiftKey && this.deviceService.isDesktop()) {
      let lastTouched = this.content.find((elem) => elem.id == event.id);
      if (lastTouched) this.focusIndex = this.content.indexOf(lastTouched);

      this.content.forEach((elem) => {
        if (elem.id != event.id) elem.isSelected = false;
        else elem.isSelected = true;
      });
    } else if (event.ctrlKey && !event.shiftKey && this.deviceService.isDesktop()) {
      let lastTouched = this.content.find((elem) => elem.id == event.id);
      if (lastTouched) this.focusIndex = this.content.indexOf(lastTouched);
    }

    if (event.shiftKey && this.deviceService.isDesktop()) {
      let f = this.content.find((elem) => elem.id == event.id);
      if (f) {
        this.content.forEach((elem) => {
          if (
            this.between(
              this.content.indexOf(elem),
              this.focusIndex,
              this.content.indexOf(f!)
            )
          ) {
            elem.isSelected = true;
          }
          else elem.isSelected = false;
        });
      }
    }
  }

  openFolder(event: any) {
    this.router.navigate([`drive/${event.id}`]);
  }

  addFolder(name: HTMLInputElement) {
    this.driveService
      .addFolder({
        isFolder: true,
        name: name.value.trim(),
        parentId: this.id,
      })
      .subscribe((result) => {
        this.content.push(result);
        this.content.sort(this.sortedBy);
      });
  }

  deleteSelected() {
    let delArr: string[] = [];
    this.content.forEach((elem) => {
      if (elem.isSelected) {
        delArr.push(String(elem.id!));
      }
    });
    this.removeFsoFromUI(delArr);
    this.driveService
      .delete(delArr)
      .pipe(
        catchError((error) => {
          return throwError(error);
        }),
        switchMap(() => {
          return this.driveService.getUserDiskInfo();
        }),
        tap((disk) => (this.disk = disk))
      )
      .subscribe();
  }

  openModal(options: string) {
    switch (options) {
      case 'new': {
        let modalRef = this.modalService.open(this.newFolderModal, {
          ariaLabelledBy: 'modal-basic-title',
          animation: true,
        });
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
        let modalRef = this.modalService.open(this.deleteConfirmModal, {
          ariaLabelledBy: 'modal-basic-title',
          animation: true,
        });
        modalRef.shown.subscribe(() => {
          document.getElementById('confirm-delete-button')?.focus();
        });
        break;
      }
      case 'rename': {
        let modalRef = this.modalService.open(this.renameConfirmModal, {
          ariaLabelledBy: 'modal-basic-title',
          animation: true,
        });
        modalRef.shown.subscribe(() => {
          let firstSelectedFso = this.content.find((elem) => elem.isSelected);
          let htmlInput = <HTMLInputElement>(
            document.getElementById('rename-input')
          );
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
    let newFso = this.content.find((elem) => elem.isSelected);
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
      //let disk = await this.driveService.getUserDiskInfo().toPromise();
      let diskUsedBeforeUpload = this.disk.usedBytes;
      Array.from(files).map((file, index) => {
        if (this.content.find((elem) => elem.name === file.name))
          fileAlreadyExists = true;
        totalSize += file.size;
        return formData.append('file' + index, file, file.name);
      });
      if (fileAlreadyExists) {
        this.toastService.show('Error', 'File already exists', 'bg-danger');
      } else if (totalSize + +this.disk.usedBytes > +this.disk.totalBytes) {
        this.toastService.show('Error', 'Not enough space', 'bg-danger');
      } else if (totalSize > environment.maxUploadSize) {
        this.toastService.show('Error', 'Max file(s) size 250MB', 'bg-danger');
      } else {
        formData.append('rootId', String(this.id));
        let uploadSubscription = this.driveService.upload(formData).subscribe(
          (event) => {
            if (event.type === HttpEventType.Response) {
              (<FsoModel[]>event.body).forEach((e) => {
                this.content.push(e);
              });

              this.progressBar.text = 'Completed';
              setTimeout(() => {
                this.progressBar.inProgress = false;
              }, 2000);
            } else if (
              event.type === HttpEventType.UploadProgress &&
              event.total
            ) {
              this.disk.usedBytes = +diskUsedBeforeUpload + +event.loaded;
              this.disk.diskUsed = Math.round(
                (this.disk.usedBytes * 100) / this.disk.totalBytes
              );
              this.progressBar.progress = Math.round(
                (100 * +event.loaded) / +event.total
              );
              this.progressBar.text = String(this.progressBar.progress) + '%';
              this.progressBar.loaded = event.loaded;
              this.progressBar.total = event.total;
              this.progressBar.background = 'success';
              this.progressBar.inProgress = true;
            }
            this.content.sort(this.sortedBy);
          },
          () => {
            this.progressBar.text = 'Error';
            this.progressBar.background = 'danger';
            setTimeout(() => {
              this.progressBar.inProgress = false;
            }, 2000);
          },
          () => {
            this.driveService
              .getUserDiskInfo()
              .pipe(
                tap((res) => {
                  this.disk = res;
                })
              )
              .subscribe();
            uploadSubscription.unsubscribe();
          }
        );
      }
    }
  }

  // sendreq(files: FileList | null) {
  //   const formData = new FormData();
  //   formData.append('rootId', String(this.id));
  //   formData.append('file0', files![0], files![0].name);
  //   var req = new XMLHttpRequest();

  //   if (req.upload) {
  //     req.onloadstart = e => console.log(e);
  //     req.upload.onprogress = evt => {
  //       if (evt.lengthComputable) {
  //         var percentComplete = ((evt.loaded / evt.total) * 100).toFixed(2);
  //         console.log("Upload: " + percentComplete + "% complete")
  //       }
  //     };
  //   }

  //   req.open('POST', environment.apiUrl + '/api/fso/upload', true);
  //   req.setRequestHeader('Authorization', 'Bearer ');
  //   req.onreadystatechange = () => {
  //     if (req.readyState == 4) {
  //       console.log('Done');
  //     }
  //   };
  //   req.send(formData);
  // }

  download() {
    let fsoIdArr: string[] = [];
    let fsoArr: FsoModel[] = [];
    this.content.forEach((elem) => {
      if (elem.isSelected) {
        fsoIdArr.push(String(elem.id!));
        fsoArr.push(elem);
      }
    });
    let downloadFileName = '';
    if (fsoArr.length == 1 && !fsoArr[0].isFolder)
      downloadFileName = fsoArr[0].name;
    else downloadFileName = `files-${Date.now()}`;

    this.driveService.download(fsoIdArr, this.id).subscribe(
      (event) => {
        if (event.type === HttpEventType.Response) {
          var FileSaver = require('file-saver');
          FileSaver.saveAs(<Blob>event.body, downloadFileName);
          this.progressBar.text = 'Completed';
          setTimeout(() => {
            this.progressBar.inProgress = false;
          }, 2000);
        } else if (
          event.type === HttpEventType.DownloadProgress &&
          event.total
        ) {
          this.progressBar.progress = Math.round(
            (100 * event.loaded) / event.total
          );
          this.progressBar.text = String(this.progressBar.progress) + '%';
          this.progressBar.loaded = event.loaded;
          this.progressBar.total = event.total;
          this.progressBar.background = 'info';
          this.progressBar.inProgress = true;
        }
      },
      () => {
        this.progressBar.text = 'Error';
        this.progressBar.background = 'danger';
        setTimeout(() => {
          this.progressBar.inProgress = false;
        }, 2000);
      }
    );
  }

  doAction(event: string) {
    switch (event) {
      case 'new': {
        this.openModal('new');
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
        if (this.sortedBy === this.fsoSortService.sortByNameAscFn) {
          this.sorter.next(this.fsoSortService.sortByNameDescFn);
          this.sortedBy = this.fsoSortService.sortByNameDescFn;
        } else {
          this.sorter.next(this.fsoSortService.sortByNameAscFn);
          this.sortedBy = this.fsoSortService.sortByNameAscFn;
        }
        break;
      }
      case 'sortSize': {
        if (this.sortedBy === this.fsoSortService.sortBySizeAscFn) {
          this.sorter.next(this.fsoSortService.sortBySizeDescFn);
          this.sortedBy = this.fsoSortService.sortBySizeDescFn;
        } else {
          this.sorter.next(this.fsoSortService.sortBySizeAscFn);
          this.sortedBy = this.fsoSortService.sortBySizeAscFn;
        }
        break;
      }
      case 'sortDate': {
        if (this.sortedBy === this.fsoSortService.sortByDateAscFn) {
          this.sorter.next(this.fsoSortService.sortByDateDescFn);
          this.sortedBy = this.fsoSortService.sortByDateDescFn;
        } else {
          this.sorter.next(this.fsoSortService.sortByDateAscFn);
          this.sortedBy = this.fsoSortService.sortByDateAscFn;
        }
        break;
      }
      case 'changeView': {
        if (this.view === 'listView') {
          this.view = 'iconView';
          localStorage.setItem(`view-${this.id}`, 'iconView');
        } else if (this.view === 'iconView') {
          this.view = 'listView';
          localStorage.setItem(`view-${this.id}`, 'listView');
        } else {
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
        this.toastService.show(
          'Error',
          "Name can't end in period",
          'bg-warning'
        );
      }
      if (this.forbiddenChar.some((c) => name.includes(c))) {
        this.isFsoNameValid = false;
        this.toastService.show(
          'Error',
          'Name contains invalid characters',
          'bg-warning'
        );
      }
      let fso = this.content.find(
        (elem) => elem.name.toLowerCase() === name.toLowerCase()
      );
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
    if (val1 <= val2) return x >= val1 && x <= val2;
    else return x >= val2 && x <= val1;
  }

  private removeFsoFromUI(list: string[]) {
    list.forEach((id) => {
      let fso = this.content.find((elem) => elem.id == +id);
      if (fso) {
        let index = this.content.indexOf(fso);
        this.content.splice(index, 1);
      }
    });
  }
  private validKeyCode(code: string): boolean {
    let keyCodeArr = [
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'PageUp',
      'PageDown',
      'Home',
      'End',
      'Insert',
      'AltLeft',
      'ShiftLeft',
      'ControlLeft',
      'AltRight',
      'ControlRight',
      'ShiftRight',
      'PrintScreen',
      'ScrollLock',
      'Pause',
    ];
    if (keyCodeArr.includes(code)) return false;
    else return true;
  }
  get selectedCount() {
    let count = 0;
    this.content.forEach((elem) => {
      if (elem.isSelected) count++;
    });
    return count;
  }
}
