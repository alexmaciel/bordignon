import { StaffModel } from '../../../modules/auth';
import { ApiModel } from '../../../shared';

export interface Teams extends ApiModel {
    name: string;
    description: string;
    phonenumber: string;
    email: string;
    folder: string;
    file_avatar?: string;
    order?: number;
    employer?: string;
    date: Date;
    staff?: StaffModel;   
}