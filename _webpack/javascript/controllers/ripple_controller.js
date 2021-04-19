import { Controller } from "stimulus";

export default class extends Controller {

  // Button effects
  create(event) {
    this.end = false;
    this.clearRipple();
    const diameter = (this.element.clientWidth + this.element.clientHeight) / 2;
    const circle = this.currentRipple = document.createElement("span");
    const radius = diameter / 2;
    circle.className = event.direction ? "ripple ripple-in" : "ripple ripple-out";
    circle.addEventListener("animationend", () => this.handleRipple(circle, event.direction));
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.offset[0] - radius}px`;
    circle.style.top = `${event.offset[1] - radius}px`;
    this.element.appendChild(circle);
  }

  /**
   * @param {boolean} val
   */
  set end(val) {
    this.element.classList.toggle("ripple-end", val);
  }

  handleRipple(circle, direction) {
    if (direction) {
      circle.className = "ripple ripple-in-end";
    } else {
      circle.remove();
    }
    this.end = true;
  }

  clearRipple() {
    this.currentRipple?.remove();
  }
}