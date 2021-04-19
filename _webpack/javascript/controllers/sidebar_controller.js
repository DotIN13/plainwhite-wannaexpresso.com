import { Controller } from "stimulus";

export default class extends Controller {

  static targets = [
    "avatar",
    "item"
  ]

  static values = {
    shift: Boolean,
    list: String,
    rippleIn: Boolean
  }

  // Connect lifecycle is excecuted each time page loads
  connect() {
    this.updateNav();
  }

  // Highlight navigation item when activated
  updateNav() {
    // Match sidebar item list
    let location = window.location.pathname;
    const itemList = this.listValue.split(",");
    // Set fallback location if no match
    if (!itemList.includes(window.location.pathname)) location = itemList[0];
    this.itemTargets.forEach(target => target.classList.toggle("sidebar__item--active", target.pathname === location));
  }

  set shift(val) {
    this.shiftValue = val;
    this.element.classList.toggle("shift", val);
    this.element.classList.toggle("unshift", !val);
  }

  get shift() {
    return this.shiftValue || false;
  }

  toggle(e) {
    this.shift = !this.shift;
    const disturb = new Event("disturb");
    disturb.offset = [e.offsetX, e.offsetY];
    // True => ripple in
    disturb.direction = this.shift;
    this.avatarTarget.dispatchEvent(disturb);
  }
}