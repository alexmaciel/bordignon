export interface Items {
    id: number;
    name: string;
    description: string;
    folder?: string | any;
    file_name?: string;      
    link?: string;
    order: number;
}