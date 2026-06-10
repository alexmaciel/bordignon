import { Pictures } from './pictures.model';

export interface Slides {
    id: number;
    name: string;
    description: string;
    link: string;
    folder: string;
    mask?: number | string;
    pictures: Pictures;
}