import { InjectionToken } from '@angular/core';

export const NGXDROPZONE_CONFIG = new InjectionToken('NGXDROPZONE_CONFIG');

export type NGXDropzoneEvent = 'drop' | 'thumbnail' | 'addedFiles' | 'removedFile' | 'reset';

export const NGXDropzoneEvents: NGXDropzoneEvent[] = [
    'drop',

    'thumbnail',
    'addedFiles',
    'removedFile',   
    
    'reset',
];
export interface NGXDropzoneConfigInterface {
    dictDefaultMessage?: string,
    dictFallbackMessage?: string,   
    
    acceptedFiles?: string,    
    listFiles?: boolean;

    init?: NGXDropzoneInitFunction,
    resize?: NGXDropzoneResizeFunction;

    parallelUploads?: number | any;
    thumbnailWidth?: number,
    thumbnailHeight?: number,
    thumbnailMethod?: 'contain' | 'crop',    
};

export class NGXDropzoneConfig implements NGXDropzoneConfigInterface {

    dictDefaultMessage?: string = "Drop files here to upload";
    dictFallbackMessage?: string = "Your browser does not support drag'n'drop file uploads.";

    acceptedFiles?: string;
    listFiles?: boolean = true;

    init?: NGXDropzoneInitFunction;
    resize?: NGXDropzoneResizeFunction;
    
    parallelUploads?: 2;

    thumbnailWidth?: number = 120;
    thumbnailHeight?: number = 120;
    thumbnailMethod?: 'contain' | 'crop';    

    constructor(config: NGXDropzoneConfigInterface = {}) {
        this.assign(config);
    }    

    assign(config: NGXDropzoneConfigInterface | any = {}, target?: any) {
        target = target || this;
    
        for (const key in config) {
          if (config[key] != null && !(Array.isArray(config[key])) &&
            typeof config[key] === 'object' && !(config[key] instanceof HTMLElement))
          {
            target[key] = {};
    
            this.assign(config[key], target[key]);
          } else {
            target[key] = config[key];
          }
        }
      }    
};

export type NGXDropzoneInitFunction = () => any;
export type NGXDropzoneResizeFunction = (file: File, width: number, height: number, resizeMethod: string) => any;
