import { Controller } from "stimulus";
import { easeCubicOut, easeCubicInOut } from "d3-ease";

export default class extends Controller {

  static targets = [
    "canvas"
  ]

  static values = {
    // Expansion direction
    expand: Boolean,
    // Set by sidebar controlller, indicate click position
    pos: Array,
    totalFrames: Number,
    currentFrame: Number,
  }

  initiateAnimation() {
    if (this.animation) this.stopAnimation();
    this.direction = this.expandValue ? 1 : -1;
    this.element.style.setProperty('--ripple-x', `${this.posValue[0]}px`);
    this.element.style.setProperty('--ripple-y', `${this.posValue[1]}px`);
    this.animate();
  }

  stopAnimation() {
    if (this.animation) cancelAnimationFrame(this.animation);
    this.animation = null;
  }

  // WIP: easing should be based on offset, not absolute frame number
  animate() {
    this.currentFrameValue += this.direction;
    const step = this.currentFrameValue / this.totalFramesValue;
    const easedStep = this.direction > 0 ? easeCubicOut(step) : easeCubicInOut(step);
    // console.log(`Frame ${this.currentFrameValue} / ${this.totalFramesValue}, step ${step}, easedStep ${easedStep}`);
    this.element.style.setProperty("--ripple-step", `${(easedStep * 100).toFixed(2)}%`);
    if (!(this.currentFrameValue % this.totalFramesValue)) {
      this.stopAnimation();
      return;
    }
    this.animation = requestAnimationFrame(() => this.animate());
  }

  expandValueChanged(val) {
    if (!val && this.currentFrameValue === 0) return;

    this.initiateAnimation();
  }
}
