import { ApiModel } from '../../../shared';

export interface Leads extends ApiModel  {
    id: number; 
    name: string;
    firstname?: string;
    lastname?: string;
    phonenumber?: number | any;
    altphone?: string;    
    company: string;
    website: string;      
    description?: string;       
    address?: string;    
    email?: string;      
    folder?: string;      
    logo_image?: string;  
    date?: string | any;
    lastmodifieddate?: string; 
    status?: string;
    source?:  string; 
    status_name?: string;
    source_name?: string;
    city: string;        
    zip: string;        
    state: string;     
    active?: number;
    staffid?: number;
}