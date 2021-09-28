import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = [
    "moodImg"
  ]

  static values = {
    id: String,
    imgAnimated: Boolean,
  }

  set imgAnimated(val) {
    this.imgAnimatedValue = val;
    this.element.classList.toggle("mood--image-animated", val);
  }

  initialize() {
    this.moodImg = document.querySelector(`.mood[data-mood-id='${this.idValue}'] .mood__cover img`);
    this.moodImgRect = this.moodImg.getBoundingClientRect().toJSON();
  }

  // Get boundingClientRect for portal image
  pinPortalImg() {
    this.portalImg = this.element.querySelector(".mood__cover img");
    this.portalImgRect = this.portalImg.getBoundingClientRect().toJSON();
  }

  imgLoaded() {
    this.pinPortalImg();
    this.posImgAtStart();
    // Flush computed style
    getComputedStyle(this.portalImg).width;
    this.posImgAtEnd();
  }

  posImgAtStart() {
    // Rect Example
    // bottom: 346.890625
    // height: 162.828125
    // left: 363.4375
    // right: 677.96875
    // top: 184.0625
    // width: 314.53125
    // x: 363.4375
    // y: 184.0625
    // Append px
    const moodImgRectStyle = this.rectToStyle(this.moodImgRect);
    // Remove x and y properties
    Object.assign(this.portalImg.style, moodImgRectStyle);
  }

  posImgAtEnd() {
    const portalImgRectStyle = this.rectToStyle(this.portalImgRect);
    Object.assign(this.portalImg.style, portalImgRectStyle);
    this.imgAnimating = true;
  }

  rectToStyle(rect) {
    const posAttributes = ["top", "left", "right", "bottom", "width", "height"];
    const style = Object.fromEntries(
      Object.entries(rect)
        .filter(([k]) => posAttributes.includes(k))
        .map(([k, v]) => [k, `${v}px`])
    );
    return { ...style, position: "fixed", margin: 0, padding: 0 };
  }

  fixImg(e) {
    if (this.imgAnimating && e.propertyName == "width") {
      Object.assign(this.portalImg.style, {
        position: "relative",
        inset: null,
        height: null,
        width: null,
      });
      this.imgAnimated = true;
    }
  }

  // disconnect() {
  //   console.log("disconn");
  // }
}