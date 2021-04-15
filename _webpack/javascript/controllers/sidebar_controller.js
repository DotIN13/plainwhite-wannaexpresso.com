import { Controller } from "stimulus";

export default class extends Controller {

  static targets = [
    "avatar"
  ]

  static values = {
    shift: Boolean
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
    if (this.shift) this.ripple(e, "ripple");
    if (!this.shift) this.ripple(e, "unripple");
  }

  // Button effects
  ripple(event, className) {
    this.clearRipple();
    const diameter = this.avatarTarget.clientWidth;
    const circle = this.currentRipple = document.createElement("span");
    const radius = diameter / 2;
    circle.className = className;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.offsetX - radius}px`;
    circle.style.top = `${event.offsetY - radius}px`;
    this.avatarTarget.appendChild(circle);
  }

  clearRipple() {
    this.currentRipple?.remove();
  }
}