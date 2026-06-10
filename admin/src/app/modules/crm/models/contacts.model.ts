import { ApiModel } from '../../../shared';

export interface Contacts extends ApiModel  {
    userid?: number;
    firstname: string;
    lastname: string;
    fullname?: string;
    phonenumber?: number | any;
    company?: string;
    altphone?: string;             
    email: string;      
    password?: string | any;
    date?: string | any;
    active?: number;
    folder?: string;
    profile_image?: string | any;
    last_login?: string;
    is_primary?: number; 
}