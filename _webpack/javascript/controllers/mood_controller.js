import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  // static targets = [
  // ]

  static values = {
    id: String
  }

  initialize() {
    // console.log(`.mood[data-mood-id='${this.idValue}'] .mood__cover img`);
    // Query for the original image
    const moodImg = document.querySelector(`.mood[data-mood-id='${this.idValue}'] .mood__cover img`);
    // console.log(moodImg);
    const moodImgRect = moodImg.getBoundingClientRect().toJSON();
    // Rect Example
    // bottom: 346.890625
    // height: 162.828125
    // left: 363.4375
    // right: 677.96875
    // top: 184.0625
    // width: 314.53125
    // x: 363.4375
    // y: 184.0625
    const portalImg = this.element.querySelector(".mood__cover img");
    const portalImgRect = portalImg.getBoundingClientRect().toJSON();
    console.log(moodImgRect, portalImgRect);
    // Append px
    const posAttributes = ["top", "left", "right", "bottom", "width", "height"];
    let moodImgRectStyle = Object.fromEntries(
      Object.entries(moodImgRect)
        .filter(([k]) => posAttributes.includes(k))
        .map(([k, v]) => [k, `${v}px`])
    );
    moodImgRectStyle["position"] = "fixed";
    moodImgRectStyle["margin"] = "0";
    // Remove x and y properties
    console.log(moodImgRectStyle);
    Object.assign(portalImg.style, moodImgRectStyle);
  }
}