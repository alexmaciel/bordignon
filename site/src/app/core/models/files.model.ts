export interface Files {
    id: number;
    file_name: string;
    original_file_name: string;
    visible_to_customer: any;
    subject: string;
    filetype: string;
    product_id: number;
    description: string;
    external?: string;
    external_link?: string;
    thumbnail_link?: string;  
    thumb?: string;
}