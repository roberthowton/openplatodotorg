import { atom } from 'nanostores'
import { ShowState } from '../types';

export const $showState = atom<ShowState>(ShowState.BOTH)

export function setShow(newShowState: ShowState) {
  $showState.set(newShowState);
}
