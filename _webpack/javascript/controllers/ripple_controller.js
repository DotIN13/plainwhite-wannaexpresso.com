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
    // Current Radius
    radius: Number,
    // Target Radius
    targetRadius: Number,
    // Beginning time and radius
    beginRadius: Number,
    beginTime: Number,
    // Ripple fill color
    fill: String,
  }

  connect() {
    this.updateCanvasRect();
    this.canvas = this.canvasTarget.getContext("2d");
  }

  animate(shift, time = null) {
    // Log beginning timestamp to calculate time elapsed
    this.beginTimeValue ||= time;
    this.beginRadiusValue ||= this.radiusValue;
    const end = (this.expandValue && this.radiusValue > this.targetRadiusValue) || (!this.expandValue && this.radiusValue === 0);
    if (end || this.expandValue != shift) return this.beginTimeValue = this.beginRadiusValue = null;

    const elapsedTime = this.beginTimeValue ? (time - this.beginTimeValue) / 750 : 0;
    // Calculate target radius value for the next frame
    const easedTime = this.expandValue ? easeCubicOut(elapsedTime) : easeCubicInOut(elapsedTime);
    this.radiusValue = this.beginRadiusValue + easedTime * (this.targetRadiusValue - this.beginRadiusValue);
    if (this.radiusValue < 0) this.radiusValue = 0;
    this.create();
    window.requestAnimationFrame(time => this.animate(shift, time));
  }

  create() {
    this.canvas.clearRect(0, 0, this.canvasTarget.width, this.canvasTarget.height);
    this.drawCircle(this.posValue[0], this.posValue[1], this.radiusValue);
  }

  drawCircle(x, y, r) {
    this.canvas.beginPath();
    this.canvas.arc(x, y, r, 0, 2 * Math.PI, false);
    this.canvas.fillStyle = this.fillValue ? this.fillValue : "#eee";
    this.canvas.fill();
  }

  updateCanvasRect() {
    if (this.scrollTimeout) return;

    this.scrollTimeout = setTimeout(() => {
      this.canvasTarget.width = window.innerWidth;
      this.canvasTarget.height = window.innerHeight;
      this.create();
      this.scrollTimeout = false;
    }, 130);
  }

  expandValueChanged(val) {
    if (!this.canvas) return;

    this.targetRadiusValue = val ? 1.5 * Math.max(this.canvasTarget.width - this.posValue[0], this.canvasTarget.height - this.posValue[1]) : 0;
    // Nullify begin values to make room for new ones
    this.beginTimeValue = this.beginRadiusValue = null;
    this.animate(val);
  }
}
