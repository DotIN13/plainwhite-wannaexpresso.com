import { Controller } from "stimulus";
import Zoom from "zooming";
import { prominent } from "color.js";

export default class extends Controller {
  static targets = [
    "bgImage",
    "bgPicture"
  ]

  static values = {
    imageBackground: String,
    containerClass: String,
    containerData: Object,
    duration: Number,
    // Location for queue storage
    queue: String
  }

  // Player: ported div, clone
  // Container: flexbox, sets player position
  // Portal: fixed element, #portal
  get portal() {
    this.portalBuffer ||= document.querySelector("#portal")
    return this.portalBuffer;
  }

  get players() {
    const players = this.portal.dataset[this.queueValue] || "[]";
    return JSON.parse(players);
  }

  set players(arr) {
    this.portal.dataset[this.queueValue] = JSON.stringify(arr);
  }

  // Creating a portal that might contain multiple players
  createContainer() {
    const container = document.createElement("div");
    container.className = `portal__container${this.containerClassValue ? ` ${this.containerClassValue}` : ""}`;
    // Apply id to the player container
    container.id = `${~~(Date.now() / 1000)}-${[...Array(8)].map(() => Math.random().toString(36)[2]).join("")}`;
    Object.assign(container.dataset, this.containerDataValue);
    this.portal.appendChild(container);
    return container;
  }

  // CLone template into a div element
  clone() {
    const clone = document.createElement("div");
    (this.element?.content || this.element).children.forEach(child => clone.appendChild(child.cloneNode(true)));
    clone.classList = this.element.classList;
    return clone;
  }

  // All ported items are treated as players
  addPlayer() {
    // Create player and player container
    const container = this.createContainer();
    container.appendChild(this.clone());
    this.portal.appendChild(container);

    // Keep track of all players
    this.players = [...this.players, container.id];

    if (this.hasBgPictureTarget) {
      this.zoomHandler(container);
    } else {
      container.ariaHidden = false;
      // Control deport
      this.commonHandler(container);
    }
  }

  // Supported styles are remove and dismiss
  removePlayer(container, style) {
    this.players = this.players.filter(el => el != container.id);
    if (style === "dismiss") this.dismiss(container);
    if (style === "remove") this.remove(container);
  }

  commonHandler(container) {
    if (this.durationValue) {
      setTimeout(() => this.removePlayer(container, "dismiss"), this.durationValue);
    } else {
      container.addEventListener("click", () => this.removePlayer(container, "dismiss"));
    }
  }

  zoomHandler(container) {
    prominent(this.bgImageTarget.currentSrc, {amount: 1, format: "hex", sample: 50})
      .then(color => {
        container.ariaHidden = false;
        this.placeBg(container);
        const zoom = new Zoom({
          bgColor: color,
          onBeforeClose: () => container.ariaHidden=true,
          onClose: () => this.removePlayer(container, "remove")
        });
        zoom.open(this.portedBgImage(container));
      });
  }

  remove(container) {
    container.remove();
  }

  dismiss(container) {
    container.addEventListener("animationend", () => this.remove(container));
    // Portal animations
    container.ariaHidden=true;
  }

  portedBgImage(container) {
    return container.querySelector("[data-portal-target=bgImage]");
  }

  placeBg(container) {
    let rect = this.bgImageTarget.getBoundingClientRect().toJSON();
    rect = Object.entries(rect);
    // Add px to all values
    rect.forEach(arr => arr[1] = `${arr[1]}px`);
    // Add position: absolute
    rect = Object.fromEntries(rect);
    rect["position"] = "relative";
    Object.assign(this.portedBgImage(container).style, rect);
  }
}