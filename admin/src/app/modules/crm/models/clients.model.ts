import { ApiModel } from '../../../shared';
import { Contacts } from './contacts.model';

export interface Clients extends ApiModel  {
    userid: number; 
    phonenumber?: number | any;
    altphone?: string;    
    company: string;
    website: string;      
    description?: string;      
    fullname?: string;            
    address?: string;    
    email?: string;      
    folder?: string;      
    logo_image?: string;  
    date?: string | any;
    lastmodifieddate?: string;   
    city: string;        
    zip: string;        
    state: string;     
    contacts?: Contacts[],
    active?: number;
    staffid?: number;
}