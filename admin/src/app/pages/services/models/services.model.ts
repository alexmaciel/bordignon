import { StaffModel } from '../../../modules/auth';
import { ApiModel } from '../../../shared';

export interface Services extends ApiModel {
    id: number;
    name: string;
    description: string;
    folder?: string;
    file_name?: string;
    order?: number;
    date?: string | any;
    staff?: StaffModel;
}