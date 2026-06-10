import { 
	Component, 
	ElementRef, 
	EventEmitter, 
	Inject, 
	Input, 
	NgZone, 
	OnDestroy, 
	OnInit, 
	Optional, 
	Output, 
	PLATFORM_ID, 
	ViewChild, 
	ViewEncapsulation 
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { 
	NGXDropzoneEvent, 
	NGXDropzoneEvents, 
	NGXDropzoneConfigInterface, 
	NGXDROPZONE_CONFIG,
	NGXDropzoneConfig
} from './ngx-dropzone.interfaces';

import { NgxDropzoneDirective } from './ngx-dropzone.directive';

@Component({
    selector: 'ngx-dropzone',
    exportAs: 'ngxDropzone',
    templateUrl: './ngx-dropzone.component.html',
    styleUrls: [
      './ngx-dropzone.component.scss',
    ],
    encapsulation: ViewEncapsulation.None
})
export class NgxDropzoneComponent implements OnInit {
	@Input() disabled: boolean = false;
	@Input() config: NGXDropzoneConfigInterface;

	@Input() message: string = 'Click or drag files to upload';

	@Output('init') init = new EventEmitter<any>();

	@Output("drop") drop = new EventEmitter<any>();
	@Output("dragover") dragover = new EventEmitter<any>();
	@Output("dragleave") dragleave = new EventEmitter<any>();

	@Output("change") change = new EventEmitter<any>();
	@Output("paste") paste = new EventEmitter<any>();
	
	//@Output("thumbnail") thumbnail = new EventEmitter<any>();
	@Output("addedfiles") addedfiles = new EventEmitter<any>();
	@Output("removedfile") removedfile = new EventEmitter<any>();

	@ViewChild(NgxDropzoneDirective, { static: true }) directiveRef?: NgxDropzoneDirective;

  @ViewChild('fileInput', { static: true }) fileInput: ElementRef;

	files: any[] = [];
	hiddenFileInput: any;
	clickableElements: any;

	processingThumbnail: boolean = true;

	constructor(
		private zone: NgZone,
		@Inject(PLATFORM_ID) private platformId: Object,		
	) {}
	
	ngOnInit(): void {
		if (!isPlatformBrowser(this.platformId)) {
			return;
		}

		window.setTimeout(() => {
			NGXDropzoneEvents.forEach((eventName: NGXDropzoneEvent) => {
				if (this.directiveRef) {
				const output = `${eventName.toLowerCase()}`;

				const directiveOutput = output as keyof NgxDropzoneDirective;
				const componentOutput = output as keyof NgxDropzoneComponent;

				this.directiveRef[directiveOutput] = this[componentOutput] as any;
				}
			});
		}, 0);
	}

	getFilesWithStatus(status: string) {
		return this.files
			.filter((file) => file.status === status)
			.map((file) => file);
	}

  // Returns all files that are in the queue
  getQueuedFiles() {
    return this.getFilesWithStatus("queued");
  }

	getUploadingFiles() {
		return this.getFilesWithStatus("uploading");
	}	
			
  showFileSelector(event: any) {
    let files = event.target.files; 

    if(files.length) {
			this.enqueueFiles(files);
		}
  }
 
	
	// on file drop handler
	onFileDropped(event: any) {    
		let files = event.dataTransfer.files;
		if (files.length > 0) {
			this.enqueueFiles(files);
		}        
	}

	// handle file from browsing
	onBrowseHandler(event: any) {
		let files = event.target.files;     
		if (files.length > 0) {
			this.enqueueFiles(files);
		}              
	}

	// Can be called by the user to remove a file
	removeFile(event: any) {
		this.files.splice(event, 1);
		this.directiveRef?.removeFile(event);
	}

	// Wrapper for enqueueFile
	enqueueFiles(files: any) {
		for (let file of files) {
			this.files.push(file);

			this.enqueueFile(file);
		}
		return setTimeout(() => {
			//this.thumbnail(files)
		}, 0);
	}

	enqueueFile(file: any) {
		if (file.status === "added") {
			file.status = "queued";
			return setTimeout(() => this.processQueue(), 0); // Deferring the call
		} else {
      throw new Error(
        "This file can't be queued because it has already been processed or was rejected."
      );
    }
	}

  // Goes through the queue and processes files if there aren't too many already.
  processQueue() {
    let  { parallelUploads } = this.config;
		let processingLength = this.getUploadingFiles().length;

    // There are already at least as many files uploading than should be
    if (processingLength >= parallelUploads) {
      return;
    }

		let queuedFiles = this.getQueuedFiles();

    if (!(queuedFiles.length > 0)) {
      return;
    }	
		// The files should be uploaded in one request
		return this.processFiles(
			queuedFiles.slice()
		);		
	}	

  // Loads the file, then calls finishedLoading()
  processFiles(files: any) {
		for (let file of files) {
      file.processing = true; // Backwards compatibility
      file.status = "uploading";
    }	

		return setTimeout(() => {
			this.thumbnail(files)
		}, 0);
	}	

	// Called when a thumbnail has been generated
	// Receives `files` and `dataUrl`
	thumbnail(files: any) {
    if (!this.processingThumbnail || this.files.length <= 0) {
      return;
    }	

		for(let file of files) {
			this.processingThumbnail = false;

			if(file.type.match(/image.*/)) {
				this.processingThumbnail = true;
			}
		}

		return this.processingThumbnail;
	}		
	
	/**
	 * format bytes
	 * @param bytes (File size in bytes)
	 * @param decimals (Decimals point)
	 */
	formatBytes(bytes: number, decimals?: number | any) {
		if (bytes === 0) {
				return '0 Bytes';
		}
		const k = 1024;
		const dm = decimals <= 0 ? 0 : decimals || 2;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	}      

}