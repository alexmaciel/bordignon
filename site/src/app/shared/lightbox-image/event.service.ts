import {ReplaySubject} from 'rxjs';
import {Injectable} from '@angular/core';

@Injectable()
export class EventService {
    emitter = new ReplaySubject<any>(1);

    emitChangeEvent(data: any) {
        this.emitter.next(data);
    }
}