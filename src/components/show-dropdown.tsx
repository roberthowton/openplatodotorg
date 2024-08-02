import type { FC } from "react";
import { setShow } from "../stores/show-state";
import { ShowState } from "../types";

const ShowDropdown: FC = () => (
  <>
    <button onClick={() => setShow(ShowState.GREEK)}>Greek</button>
    <button onClick={() => setShow(ShowState.ENGLISH)}>English</button>
    <button onClick={() => setShow(ShowState.BOTH)}>Both</button>
  </>
);

export default ShowDropdown;
