import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = [
    "moodImg"
  ]

  static values = {
    id: String,
    // Set imgAnimated to true when animation ends
    imgAnimated: Boolean,
    imgAnimating: Boolean
  }

  /**
   * @param {boolean} val
   */
  set imgAnimated(val) {
    this.imgAnimatedValue = val;
    this.element.classList.toggle("mood__portal--image-animated", val);
  }

  /**
   * @param {boolean} val
   */
  set imgAnimating(val) {
    this.imgAnimatingValue = val;
    this.element.classList.toggle("mood__portal--image-animating", val);
  }

  initialize() {
    this.pinMoodImg();
    if (!this.hasMoodImgTarget) {
      this.animateCover();
    }
  }

  pinMoodImg() {
    this.moodImg = document.querySelector(`.mood[data-mood-id='${this.idValue}'] .mood__cover`);
    this.moodImgRect = this.moodImg.getBoundingClientRect().toJSON();
  }

  // Get boundingClientRect for portal image
  pinPortalImg() {
    this.portalImg = this.element.querySelector(".mood__cover");
    this.portalImgRect = this.portalImg.getBoundingClientRect().toJSON();
  }

  animateCover() {
    this.pinPortalImg();
    // this.posImgAtStart();
    this.posImgAtEnd();
  }

  // posImgAtStart() {
  //   // Rect Example
  //   // bottom: 346.890625
  //   // height: 162.828125
  //   // left: 363.4375
  //   // right: 677.96875
  //   // top: 184.0625
  //   // width: 314.53125
  //   // x: 363.4375
  //   // y: 184.0625
  //   // Append px
  //   const moodImgRectStyle = this.rectToStyle(this.moodImgRect);
  //   // Remove x and y properties
  //   Object.assign(this.portalImg.style, moodImgRectStyle);
  //   // Flush computed style
  //   getComputedStyle(this.portalImg).width;
  // }

  posImgAtEnd() {
    // Calculate translate params
    const translateX = this.moodImgRect.left + this.moodImgRect.width / 2 - this.portalImgRect.left - this.portalImgRect.width / 2;
    const translateY = this.moodImgRect.top + this.moodImgRect.height / 2 - this.portalImgRect.top - this.portalImgRect.height / 2;
    const scaleX = this.moodImgRect.width / this.portalImgRect.width;
    const scaleY = this.moodImgRect.height / this.portalImgRect.height;
    this.portalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX, scaleY})`;
    this.imgAnimating = true;
    requestAnimationFrame(() => {
      this.portalImg.style = "transition: transform .4s cubic-bezier(0.4, 0, 0, 1); transform: none;";
    });
    // const portalImgRectStyle = this.rectToStyle(this.portalImgRect);
    // Object.assign(this.portalImg.style, portalImgRectStyle);
  }

  // rectToStyle(rect) {
  //   const posAttributes = ["top", "left", "right", "bottom", "width", "height"];
  //   const style = Object.fromEntries(
  //     Object.entries(rect)
  //       .filter(([k]) => posAttributes.includes(k))
  //       .map(([k, v]) => [k, `${v}px`])
  //   );
  //   return {
  //     ...style,
  //     position: "fixed",
  //   };
  // }

  fixImg(e) {
    console.log(e);
    if (this.imgAnimatingValue && e.propertyName == "transform") {
      // Object.assign(this.portalImg.style, {
      //   position: "relative",
      //   inset: null,
      //   height: null,
      //   width: null,
      //   transform: null,
      //   transition: "none",
      // });
      this.imgAnimated = true;
    }
  }
}