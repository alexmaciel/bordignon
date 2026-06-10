import { Categories } from './category.model';
import { Pictures } from './pictures.model';
import { Items } from './items.model';
import { Maps } from './maps.model';

import { BaseModel } from '../helpers';

export interface Project extends BaseModel {
    id: number;
    name: string;
    description: string;
    long_description: string;
    folder: string;
    order?: number;
    slug?: string;
    categories?: Categories;
    pictures?: Pictures | any;
    maps?: Maps | any;
    items?: Items | any;
}