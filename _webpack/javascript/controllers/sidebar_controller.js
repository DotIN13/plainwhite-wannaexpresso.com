import { Controller } from "stimulus";

export default class extends Controller {

  static targets = [
    "sidebar",
    "container"
  ]

  static values = {
    shift: Boolean
  }

  setHeight() {
    const heights = [this.containerTarget.scrollHeight, this.sidebarTarget.scrollHeight];
    this.containerTarget.style.height = `${heights[Number(this.shiftValue)]}px`;
  }

  set shift(val) {
    this.setHeight();
    this.shiftValue = val;
    this.element.classList.toggle("shift", val);
    this.setHeight();
  }

  get shift() {
    return this.shiftValue || false;
  }

  toggle() {
    this.shift = !this.shift;
  }
}