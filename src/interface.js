import { animate } from "./animateStars";
import * as d3 from "d3";

export default function (_myText) {
  "use strict";

  function chartAPI(selection) {
    selection.each(function () {
      animate(_myText, d3.select(this));
    });
  }

  return chartAPI;
}