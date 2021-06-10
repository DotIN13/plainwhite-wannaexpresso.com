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
    currentStep: Number,
  }

  initiateAnimation() {
    if (this.animation) this.stopAnimation();
    this.direction = this.expandValue ? 1 : -1;
    this.beginingFrame = this.currentFrameValue;
    this.beginingStep = this.currentStepValue;
    this.frameOffset = (this.expandValue ? this.totalFramesValue : 0) - this.currentFrameValue;
    this.stepOffset = (this.expandValue ? 1 : 0) - this.beginingStep;
    this.element.style.setProperty('--ripple-x', `${this.posValue[0]}px`);
    this.element.style.setProperty('--ripple-y', `${this.posValue[1]}px`);
    this.animate();
  }

  stopAnimation() {
    if (this.animation) cancelAnimationFrame(this.animation);
    this.animation = null;
  }

  animate() {
    this.currentFrameValue += this.direction;
    const normalizedTime = (this.currentFrameValue - this.beginingFrame) / this.frameOffset;
    const easedTime = this.direction > 0 ? easeCubicOut(normalizedTime) : easeCubicInOut(normalizedTime);
    // The final step should be based on the begining step and walked steps during the eased time
    const step = this.beginingStep + easedTime * this.stepOffset;
    // console.log(`begining with ${this.beginingFrame}, total offset ${this.offset}, current ${this.currentFrameValue}`);
    // console.log(`Frame ${this.currentFrameValue} / ${this.totalFramesValue}, time ${normalizedTime}, easedTime ${easedTime}, easedPercent ${position}`);
    // console.log(`Begining Step ${this.beginingStep}, currentStep ${step}`);
    this.element.style.setProperty("--ripple-step", `${(step * 100).toFixed(2)}%`);
    this.currentStepValue = step;
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
