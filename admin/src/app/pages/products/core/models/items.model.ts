import { StaffModel } from '../../../../modules/auth';
import { ApiModel } from '../../../../shared';

export interface Items extends ApiModel {
    name: string;
    description: string;
    product_id: number
    order?: number;
    date: Date;
    staff?: StaffModel;
    file_name?: string;
    folder?: string;
    link?: string;
    visible_draft?: number;
    language?: {
        languageid: number;
        language: string;      
    }    
}