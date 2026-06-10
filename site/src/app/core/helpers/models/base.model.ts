import { PaginatorState } from './paginator.model';
import { GroupingState } from './grouping.model';
import { SortState } from './sort.model';

export interface BaseModel {
  id: any;
}

export interface IAPIState {
  filter?: {} | any;
  grouping: GroupingState;
  paginator: PaginatorState;
  sorting: SortState;
  product_id?: number | undefined;
  category_id?: number | undefined;
  search_string?: string | undefined;
}

export interface APIResponseModel<T> {
  items: T[];
  total: number;
}