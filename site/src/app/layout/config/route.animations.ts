import {
    transition,
    trigger,
    query,
    style,
    animate,
    group,
  } from '@angular/animations';


export const slideInAnimation =
trigger('routeAnimations', [
  transition('* => home', [
    query(':enter, :leave', style({ position: 'relative', width: '100%', height: '100%' }), { optional: true }),
    group([
      query(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('0.54s cubic-bezier(0.32,0.72,0,1)', style({ transform: 'translateX(0%)', opacity: 1 }))
      ], { optional: true }),
      query(':leave', [
        style({ transform: 'translateX(0%)' }),
        animate('0.54s cubic-bezier(0.32,0.72,0,1)', style({ transform: 'translateX(100%)', opacity: 0 }))
      ], { optional: true }),
    ])
  ]),
  transition('* <=> *', [
    query(':enter, :leave', style({ position: 'relative', width: '100%', height: '100%' }), { optional: true }),
    group([
      query(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('0.54s cubic-bezier(0.32,0.72,0,1)', style({ transform: 'translateX(0%)', opacity: 1 }))
      ], { optional: true }),
      query(':leave', [
        style({ transform: 'translateX(0%)' }),
        animate('0.54s cubic-bezier(0.32,0.72,0,1)', style({ transform: 'translateX(-100%)', opacity: 0 }))
      ], { optional: true }),
    ])
  ]),
]);