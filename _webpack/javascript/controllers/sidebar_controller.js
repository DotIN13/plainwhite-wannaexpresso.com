import { Controller } from "stimulus";
import "../core-ext/array.js";

export default class extends Controller {

  static targets = [
    "avatar",
    // Sidebar items
    "item",
    // Container for the sidebar and the about section
    "container"
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

  set shift(val) {
    this.shiftValue = val;
    this.element.classList.toggle("shift", val);
  }

  get shift() {
    return this.shiftValue || false;
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

  toggle(e) {
    console.log(e);
    this.shift = !this.shift;
    const disturb = new Event("disturb");
    disturb.offset = [e.clientX, e.clientY];
    // True => ripple in
    disturb.direction = this.shift;
    this.avatarTarget.dispatchEvent(disturb);
  }

  // Enable swipe for mobile devices
  set swipes(evt) {
    this.touchPos ||= [];
    this.touchPos.push([evt.touches[0].clientX, evt.touches[0].clientY]);
  }

  get swipes() {
    return this.touchPos || [];
  }

  get swipeX() {
    if (this.swipes.length < 2) return 0;

    return this.swipes.last()[0] - this.swipes[0][0];
  }

  initSwipe() {
    this.currentTransform = getComputedStyle(this.containerTarget.firstElementChild).transform;
  }
  
  swipe(e) {
    if (!this.validSwipe()) return;
    this.swipes = e;

    this.containerTarget.children.forEach(child => {
      child.style.transition = "none";
      child.style.transform = `${this.currentTransform} translateX(${this.swipeX}px)`;
    });
  }

  clearSwipe() {
    if (Math.abs(this.swipeX) > this.containerTarget.offsetWidth * .1) this.shift = this.swipeX > 0;
    this.touchPos = null;
    this.containerTarget.children.forEach(child => child.style = "");
    this.currentTransform = undefined;
  }

  // Determine whether the move is valid
  validSwipe() {
    if (this.swipes.length < 2) return true;

    if (Math.abs(this.swipes[0][1] - this.swipes.last()[1]) < 15) return true;

    return false;
  }
}