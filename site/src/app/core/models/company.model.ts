import { Pictures } from './pictures.model';

export interface Company {
    name: string;
    description: string;
    long_description: string;
    folder: string;  
    pictures?: Pictures;
}