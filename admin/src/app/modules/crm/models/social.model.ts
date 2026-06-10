import { ApiModel } from '../../../shared';

export interface Social extends ApiModel  {
    id: number;
    name: string;
    link: string;
    order: number; 
    date?: string | any;
    active?: number;
    staff?: string; 
    clientid?: number;
}
