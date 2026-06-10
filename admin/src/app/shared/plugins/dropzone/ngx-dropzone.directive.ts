import { isPlatformBrowser } from '@angular/common';
import {
	Directive,
	Output,
	Input,
	EventEmitter,
	HostBinding,
	HostListener,
	Inject,
	PLATFORM_ID,
	OnInit,
	Optional,
	NgZone,
	OnDestroy,
	ElementRef,
	ViewChild,
} from '@angular/core';

import { 
		NGXDropzoneEvent, 
		NGXDropzoneEvents, 
		NGXDropzoneConfigInterface, 
		NGXDROPZONE_CONFIG,
		NGXDropzoneConfig
	} from './ngx-dropzone.interfaces';

declare var EXIF: any;


@Directive({
	selector: "[ngx-dropzone]",
	exportAs: "ngxDropzone",
})
export class NgxDropzoneDirective implements OnInit, OnDestroy {
	@HostBinding('class.fileover') fileOver: boolean;

	@Input() disabled: boolean = false;

	@Input("ngx-dropzone") config?: NGXDropzoneConfigInterface;

	@Output("init") init = new EventEmitter<any>();

	@Output("drop") drop = new EventEmitter<any>();
	@Output("dragover") dragover = new EventEmitter<any>();
	@Output("dragleave") dragleave = new EventEmitter<any>();

	@Output("change") change = new EventEmitter<any>();
	@Output("paste") paste = new EventEmitter<any>();

  	@Output("thumbnail") thumbnail = new EventEmitter<any>();
	@Output("addedfiles") addedfiles = new EventEmitter<any>();
	@Output("removedfile") removedfile = new EventEmitter<any>();

	/** A template reference to the native file input element. */
	@ViewChild('fileInput', { static: true }) fileInput: ElementRef;
		
	element: any;

	hiddenFileInput: any;
	clickableElements: any;

	_createThumbnail: any;
	_processingThumbnail: boolean = false;
	_thumbnailQueue: any[] = [];

	files: any[] = []; // All files

	private instance: any;


	constructor(
		private zone: NgZone,
		private elementRef: ElementRef,
		@Inject(PLATFORM_ID) private platformId: Object,
		@Optional()
		@Inject(NGXDROPZONE_CONFIG)		
		private defaults: NGXDropzoneConfigInterface
	) {}
	
	// DragEnte listener
	@HostListener('dragenter', ['$event']) onDragEnter(e: any) {
		e.preventDefault();
		e.stopPropagation();
	}

	// Dragover listener
	@HostListener('dragover', ['$event']) onDragOver(e: any) {
		e.preventDefault();
		e.stopPropagation();
		this.fileOver = true;
	}

	// Dragleave listener
	@HostListener('dragleave', ['$event']) public onDragLeave(e: any) {
		e.preventDefault();
		e.stopPropagation();
		this.fileOver = false;
	}

	// Drop listener
	@HostListener('drop', ['$event']) public onDrop(e: any) {
		if (!e.dataTransfer) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();
		this.fileOver = false;
		// Convert the FileList to an Array
		// This is necessary for IE11
		let files = [];
		for (let i = 0; i < e.dataTransfer.files.length; i++) {
			files[i] = e.dataTransfer.files[i];
		}
		// Even if it's a folder, files.length will contain the folders.
		if (files.length) {
			let { items } = e.dataTransfer;
			if (items && items.length && items[0].webkitGetAsEntry != null) {
			// The browser supports dropping of folders, so handle items instead of files
			this._addFilesFromItems(items);
			} else {
				this.handleFiles(files);
			}
		}

		return this.drop.emit(files);
	}

	// Change listener
	@HostListener('change', ['$event']) public onChange(e: any) {
		if (!e.target) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();		
		let { files } = e.target;	
		if (files.length) {
			for (let file of files) {
				this.addFile(file);
			}
		}		

		return this.drop.emit(files);
	}		

	/** Show the native OS file explorer to select files. */
	@HostListener('click', ['$event']) public onClick(e: any) {
		if (!e.dataTransfer) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();	
		this.fileOver = false;
		// Convert the FileList to an Array
		// This is necessary for IE11
		let files = [];
		for (let i = 0; i < e.dataTransfer.files.length; i++) {
			files[i] = e.dataTransfer.files[i];
		}
		// Even if it's a folder, files.length will contain the folders.
		if (files.length) {
			this.handleFiles(files);
		}

		return this.drop.emit(files);
	}	

	// This is disabled right now, because the browsers don't implement it properly.
	@HostListener('paste', ['$event']) public onPaste(e: any) {
		e.preventDefault();
		e.stopPropagation();		
    if (
      __guard__(e != null ? e.clipboardData : undefined, (x: any) => x.items) == null
    ) {
      return;
    }

    let { items } = e.clipboardData;
    if (items.length) {
      return this._addFilesFromItems(items);
    }

		return this.paste.emit(e);;
	}		

	ngOnInit(): void {
		if (!isPlatformBrowser(this.platformId)) {
			return;
		}		

		this.element = this.elementRef.nativeElement;

		if (typeof this.element === "string") {
			this.element = document.querySelector(this.element);
		}

		// Not checking if instance of HTMLElement or Element since IE9 is extremely weird.
		if (!this.element || this.element.nodeType == null) {
			throw new Error("Invalid dropzone element.");
		}
				
    	const params: any = new NGXDropzoneConfig(this.defaults);
    	params.assign(this.config); // Custom configuration		

		Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    	this.zone.runOutsideAngular(() => {
      		console.log();
			this.instance = new NGXDropzoneConfig(params)
    	});		

		let setupHiddenFileInput = () => {
			if (this.hiddenFileInput) {
					this.hiddenFileInput.parentNode.removeChild(this.hiddenFileInput);
			}			
			this.hiddenFileInput = document.createElement("input");
			this.hiddenFileInput.setAttribute("type", "file");	
			this.hiddenFileInput.setAttribute("multiple", "multiple");
			
			this.hiddenFileInput.className = "dz-hidden-input";

			if (this.config?.acceptedFiles !== null) {
				this.hiddenFileInput.setAttribute(
					"accept",
					params.acceptedFiles
				);					
			}
			// Making sure that no one can "tab" into this field.   
			this.hiddenFileInput.setAttribute("tabindex", "-1");

			// Not setting `display="none"` because some browsers don't accept clicks
			// on elements that aren't displayed.
			this.hiddenFileInput.style.position = "absolute";
			this.hiddenFileInput.style.opacity = "0";
			this.hiddenFileInput.style.top = "0";
			this.hiddenFileInput.style.left = "0";
			this.hiddenFileInput.style.height = "100%";
			this.hiddenFileInput.style.width = "100%";            

			this.clickableElements = document.querySelector('.dz-clickable');
			this.clickableElements.appendChild(this.hiddenFileInput);
		};
		setupHiddenFileInput();

		if (this.init.observers.length) {
			this.zone.run(() => {
				this.init.emit(this.instance);
			});		
		}
	}   

	public ngxdropzone(): any {
		return this.instance;
	}	

	public reset(cancel?: boolean): void {
		if (this.instance) {
		this.zone.runOutsideAngular(() => {
			this.instance.removeAllFiles(cancel);
		});
		}
	}	
		
	handleFiles(files: any) {
		for (let file of files) {
			this.addFile(file);
		}
	}	
	
	addFile(file: any) {
		file.upload = {
			uuid: NgxDropzoneDirective.uuidv4(),
			progress: 0,
			// Setting the total upload size to file.size for the beginning
			// It's actual different than the size to be transmitted.
			total: file.size,			
			bytesSent: 0,	
			// Not setting chunking information here, because the acutal data — and
			// thus the chunks — might change if `options.transformFile` is set
			// and does something to the data.				
		}
		this.files.push(file);

		file.status = "added";
		this.createThumbnail(
				file,
		this.instance.thumbnailWidth,
		this.instance.thumbnailHeight,
		this.instance.thumbnailMethod,
		true,
		(dataUrl: any) => {		
			this._processingThumbnail = false;
		}
		);

		this.addedfiles.emit(file);
	}

	// Can be called by the user to remove a file
	removeFile(file: any) {
		this.removedfile.emit(file);
	}		 

	// Removes all files that aren't currently processed from the list
	removeAllFiles(cancelIfNecessary: boolean) {
		// Create a copy of files since removeFile() changes the @files array.
		if (cancelIfNecessary == null) {
			cancelIfNecessary = false;
		}			
		for (let file of this.files.slice()) {
			if(cancelIfNecessary) {
				this.removeFile(file);
			}
		}
		return null;
	}		

  createThumbnail(
		file: any, 
		width: any, 
		height: any, 
		resizeMethod: any, 
		fixOrientation?: any, 
		callback?: any,
	) {
    let fileReader = new FileReader();
    fileReader.onload = () => {
      file.dataURL = fileReader.result;

      // Don't bother creating a thumbnail for SVG images since they're vector
      if (file.type === "image/svg+xml") {
        if (callback != null) {
          callback(fileReader.result);
        }
        return;
      }			

      this.createThumbnailFromUrl(
        file,
        width,
        height,
        resizeMethod,
        fixOrientation,
        callback
      );			
		};		

		fileReader.readAsDataURL(file);
	}	

  createThumbnailFromUrl(
		file: any, 
		width: any, 
		height: any, 
		resizeMethod: any, 
		fixOrientation?: any, 
		callback?: any,
    crossOrigin?: any
  ) {
    // Not using `new Image` here because of a bug in latest Chrome versions.
    // See https://github.com/enyo/dropzone/pull/226
    let img = document.createElement("img");		

    if (crossOrigin) {
      img.crossOrigin = crossOrigin;
    }

    // fixOrientation is not needed anymore with browsers handling imageOrientation
    fixOrientation =
      getComputedStyle(document.body)["imageOrientation"] == "from-image"
        ? false
        : fixOrientation;		

		img.onload = () => {
			let loadExif = (callback: any) => callback(1), 
					_this = this;
			if (typeof EXIF !== "undefined" && EXIF !== null && fixOrientation) {
				loadExif = (callback) =>
					EXIF.getData(img, function () {
						return callback(EXIF.getTag(_this, "Orientation"));
					});
			}

			return loadExif((orientation: any) => {
				file.width = img.width;
				file.height = img.height;

        let resizeInfo = this.resize.call(
          this,
          file,
          width,
          height,
          resizeMethod
        );

				let canvas = document.createElement("canvas");
				let ctx: any = canvas.getContext("2d");

				canvas.width = resizeInfo.trgWidth;
				canvas.height = resizeInfo.trgHeight;

				if (orientation > 4) {
					canvas.width = resizeInfo.trgHeight;
					canvas.height = resizeInfo.trgWidth;
				}

				switch (orientation) {
					case 2:
						// horizontal flip
						ctx.translate(canvas.width, 0);
						ctx.scale(-1, 1);
						break;
					case 3:
						// 180° rotate left
						ctx.translate(canvas.width, canvas.height);
						ctx.rotate(Math.PI);
						break;
					case 4:
						// vertical flip
						ctx.translate(0, canvas.height);
						ctx.scale(1, -1);
						break;
					case 5:
						// vertical flip + 90 rotate right
						ctx.rotate(0.5 * Math.PI);
						ctx.scale(1, -1);
						break;
					case 6:
						// 90° rotate right
						ctx.rotate(0.5 * Math.PI);
						ctx.translate(0, -canvas.width);
						break;
					case 7:
						// horizontal flip + 90 rotate right
						ctx.rotate(0.5 * Math.PI);
						ctx.translate(canvas.height, -canvas.width);
						ctx.scale(-1, 1);
						break;
					case 8:
						// 90° rotate left
						ctx.rotate(-0.5 * Math.PI);
						ctx.translate(-canvas.height, 0);
						break;
				}
				
				// This is a bugfix for iOS' scaling bug.
				drawImageIOSFix(
					ctx,
					img,
					resizeInfo.srcX != null ? resizeInfo.srcX : 0,
					resizeInfo.srcY != null ? resizeInfo.srcY : 0,
					resizeInfo.srcWidth,
					resizeInfo.srcHeight,
					resizeInfo.trgX != null ? resizeInfo.trgX : 0,
					resizeInfo.trgY != null ? resizeInfo.trgY : 0,
					resizeInfo.trgWidth,
					resizeInfo.trgHeight
				);

				let thumbnail = canvas.toDataURL("image/png");

				if (callback != null) {
					return callback(thumbnail, canvas);
				}
			});
		};				

    if (callback != null) {
      img.onerror = callback;
    }
		
    return (img.src = file.dataURL);		
	}	

  /**
   * Gets called to calculate the thumbnail dimensions.
   *
   * It gets `file`, `width` and `height` (both may be `null`) as parameters and must return an object containing:
   *
   *  - `srcWidth` & `srcHeight` (required)
   *  - `trgWidth` & `trgHeight` (required)
   *  - `srcX` & `srcY` (optional, default `0`)
   *  - `trgX` & `trgY` (optional, default `0`)
   *
   * Those values are going to be used by `ctx.drawImage()`.
   */
  resize(file: any, width: any, height: any, resizeMethod: any) {
    let info = {
      srcX: 0,
      srcY: 0,
			trgX: 0,
			trgY: 0,
			trgWidth: file.width,
			trgHeight: file.height,
      srcWidth: file.width,
      srcHeight: file.height,
    };

    let srcRatio = file.width / file.height;

    // Automatically calculate dimensions if not specified
    if (width == null && height == null) {
      width = info.srcWidth;
      height = info.srcHeight;
    } else if (width == null) {
      width = height * srcRatio;
    } else if (height == null) {
      height = width / srcRatio;
    }

    // Make sure images aren't upscaled
    width = Math.min(width, info.srcWidth);
    height = Math.min(height, info.srcHeight);

    let trgRatio = width / height;

    if (info.srcWidth > width || info.srcHeight > height) {
      // Image is bigger and needs rescaling
      if (resizeMethod === "crop") {
        if (srcRatio > trgRatio) {
          info.srcHeight = file.height;
          info.srcWidth = info.srcHeight * trgRatio;
        } else {
          info.srcWidth = file.width;
          info.srcHeight = info.srcWidth / trgRatio;
        }
      } else if (resizeMethod === "contain") {
        // Method 'contain'
        if (srcRatio > trgRatio) {
          height = width / srcRatio;
        } else {
          width = height * srcRatio;
        }
      } else {
        throw new Error(`Unknown resizeMethod '${resizeMethod}'`);
      }
    }

    info.srcX = (file.width - info.srcWidth) / 2;
    info.srcY = (file.height - info.srcHeight) / 2;

    info.trgWidth = width;
    info.trgHeight = height;

    return info;		
	}

	ngOnDestroy(): void {
		this.removeAllFiles(true);
		if (
			this.hiddenFileInput != null ? this.hiddenFileInput.parentNode : undefined
		) {
			this.hiddenFileInput.parentNode.removeChild(this.hiddenFileInput);
			this.hiddenFileInput = null;
		}	
	}		

	_enqueueThumbnail(file: any) {
		if(file.type.match(/image.*/)) {
			this._thumbnailQueue.push(file);
      return setTimeout(() => this._processThumbnailQueue(), 0); // Deferring the call			
		}

		return null;
	}

	_processThumbnailQueue() {
    if (this._processingThumbnail || this._thumbnailQueue.length === 0) {
      return;
    }		

    this._processingThumbnail = true;
    let file = this._thumbnailQueue.shift();
    return this.createThumbnail(
			file,
      this.instance.thumbnailWidth,
      this.instance.thumbnailHeight,
      this.instance.thumbnailMethod,
      true,
      (dataUrl: any) => {		
        this._processingThumbnail = false;
        return this._processThumbnailQueue();
      }
    );
	}


	// When a folder is dropped (or files are pasted), items must be handled
	// instead of files.
	_addFilesFromItems(items: any) {
		return (() => {
			let result = [];
			for (let item of items) {
				var entry;
				if (
					item.webkitGetAsEntry != null &&
					(entry = item.webkitGetAsEntry())
				) {
					if (entry.isFile) {
						result.push(this.addFile(item.getAsFile()));
					} else if (entry.isDirectory) {
						// Append all files from that directory to files
						result.push(this._addFilesFromDirectory(entry, entry.name));
					} else {
						result.push(undefined);
					}
				} else if (item.getAsFile != null) {
					if (item.kind == null || item.kind === "file") {
						result.push(this.addFile(item.getAsFile()));
					} else {
						result.push(undefined);
					}
				} else {
					result.push(undefined);
				}
			}
			return result;
		})();		
	}	
	
	// Goes through the directory, and adds each file it finds recursively
	_addFilesFromDirectory(directory: any, path: any) {
		let dirReader = directory.createReader();
		
    let errorHandler = (error: any) =>
      __guardMethod__(console, "log", (o: any) => o.log(error));	
			
		var readEntries = () => {
			return dirReader.readEntries((entries: any) => {
				if (entries.length > 0) {
					for (let entry of entries) {
						if (entry.isFile) {
							entry.file((file: any) => {
								if (
									file.name.substring(0, 1) === "."
								) {
									return;
								}
								file.fullPath = `${path}/${file.name}`;
								return this.addFile(file);
							});
						} else if (entry.isDirectory) {
							this._addFilesFromDirectory(entry, `${path}/${entry.name}`);
						}
					}

					// Recursively call readEntries() again, since browser only handle
					// the first 100 entries.
					// See: https://developer.mozilla.org/en-US/docs/Web/API/DirectoryReader#readEntries
					readEntries();
				}
				return null;
			}, errorHandler);
		};

		return readEntries();			
	}

  static uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        let r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }	
}
  
function __guard__(value: any, transform: any) {
  return typeof value !== "undefined" && value !== null
    ? transform(value)
    : undefined;
}

function __guardMethod__(obj: any, methodName: string, transform: any) {
  if (
    typeof obj !== "undefined" &&
    obj !== null &&
    typeof obj[methodName] === "function"
  ) {
    return transform(obj, methodName);
  } else {
    return undefined;
  }
}

// A replacement for context.drawImage
// (args are for source and destination).
const drawImageIOSFix = function (ctx: any, img: any, sx: any, sy: any, sw: any, sh: any, dx: any, dy: any, dw: any, dh: any) {
  let vertSquashRatio = detectVerticalSquash(img);
  return ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh / vertSquashRatio);
};

/*

 Bugfix for iOS 6 and 7
 Source: http://stackoverflow.com/questions/11929099/html5-canvas-drawimage-ratio-bug-ios
 based on the work of https://github.com/stomita/ios-imagefile-megapixel

 */

// Detecting vertical squash in loaded image.
// Fixes a bug which squash image vertically while drawing into canvas for some images.
// This is a bug in iOS6 devices. This function from https://github.com/stomita/ios-imagefile-megapixel
let detectVerticalSquash = function (img: any) {
  let iw = img.naturalWidth;
  let ih = img.naturalHeight;
  let canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = ih;
  let ctx: any = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  let { data } = ctx.getImageData(1, 0, 1, ih);

  // search image edge pixel position in case it is squashed vertically.
  let sy = 0;
  let ey = ih;
  let py = ih;
  while (py > sy) {
    let alpha = data[(py - 1) * 4 + 3];

    if (alpha === 0) {
      ey = py;
    } else {
      sy = py;
    }

    py = (ey + sy) >> 1;
  }
  let ratio = py / ih;

  if (ratio === 0) {
    return 1;
  } else {
    return ratio;
  }
};