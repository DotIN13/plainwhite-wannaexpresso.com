import { Controller } from "stimulus";
import Zoom from "zooming";
import { prominent } from "color.js";

export default class extends Controller {
  static targets = [
    "template",
    "bgImage",
    "bgPicture",
    "portal"
  ]

  static values = {
    imageBackground: String
  }

  get portal() {
    return document.querySelector("[data-portal-target=portal]") || this.createPortal();
  }

  set portal(el) {
    const clone = document.createElement("div");
    clone.classList = el.classList;
    clone.innerHTML = el.innerHTML;
    this.portal.appendChild(clone);
    if (this.hasBgPictureTarget) {
      prominent(this.bgImageTarget.currentSrc, {amount: 1, format: "hex", sample: 50})
        .then(color => {
          this.portal.ariaHidden = false;
          this.positionBg();
          const zoom = new Zoom({
            bgColor: color,
            onBeforeClose: () => this.portal.ariaHidden=true,
            onClose: () => this.hardDeport()
          });
          zoom.open(this.portedBgImage);
        });
    } else {
      this.portal.ariaHidden = false;
      // Control deport
      this.portal.dataset.controller = "portal";
      this.portal.dataset.action = "click->portal#deport";
    }
  }

  createPortal() {
    const portal = document.createElement("div");
    portal.dataset.portalTarget = "portal";
    portal.id = "portal";
    document.body.appendChild(portal);
    return portal;
  }

  port() {
    this.portal = this.templateTarget;
  }

  hardDeport() {
    this.portal.remove();
  }

  deport() {
    this.portal.addEventListener("animationend", () => {
      this.portal.remove();
    });
    this.portal.ariaHidden=true;
  }

  get portedBgImage() {
    return this.portal.querySelector("[data-portal-target=bgImage]");
  }

  positionBg() {
    let rect = this.bgImageTarget.getBoundingClientRect().toJSON();
    rect = Object.entries(rect);
    // Add px to all values
    rect.forEach(arr => arr[1] = `${arr[1]}px`);
    // Add position: absolute
    rect = Object.fromEntries(rect);
    rect["position"] = "relative";
    Object.assign(this.portedBgImage.style, rect);
  }
}