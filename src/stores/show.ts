import { atom } from 'nanostores'
import { ShowState } from '../types';

export const $show = atom<ShowState>(ShowState.BOTH)

export function setShow(newShowState: ShowState) {
  $show.set(newShowState);
}