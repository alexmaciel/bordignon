import { ApiModel } from '../../../../shared';

export interface Activity extends ApiModel {
    id: number;
    product_id: number;
    product_name: string;
    description: string;
    fullname: string;
    dateadded: string | any;
    additional_data?: string;
    staff_id: number;
    status: string;
}