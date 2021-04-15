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
    if (this.shift) this.ripple(e, "in");
    if (!this.shift) this.ripple(e, "out");
  }

  // Button effects
  ripple(event, direction) {
    this.clearRipple();
    const diameter = this.avatarTarget.clientWidth;
    const circle = this.currentRipple = document.createElement("span");
    const radius = diameter / 2;
    circle.className = direction === "in" ? "ripple ripple-in" : "ripple ripple-out";
    circle.addEventListener("animationend", () => this.handleRipple(circle, direction));
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.offsetX - radius}px`;
    circle.style.top = `${event.offsetY - radius}px`;
    this.avatarTarget.appendChild(circle);
  }

  handleRipple(circle, direction) {
    if (direction === "in") {
      circle.className = "ripple ripple-in-end";
    } else {
      circle.remove();
    }
  }

  clearRipple() {
    this.currentRipple?.remove();
  }
}