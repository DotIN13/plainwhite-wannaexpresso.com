import { Controller } from "@hotwired/stimulus";
// import Zoom from "zooming";
// import { prominent } from "color.js";

export default class extends Controller {

  // Player: ported div, clone
  // Container: flexbox, contains player, sets player position
  // Portal: fixed element, #portal

  static targets = ["portal"];

  currentQueue(type) {
    return JSON.parse(this.portalTarget.dataset[`${type}QueueValue`] || "[]");
  }

  // Creating a portal that might contain multiple players
  createContainer(params) {
    const container = document.createElement("div");
    container.className = `portal__container${params["containerClass"] ? ` ${params["containerClass"]}` : ""}`;
    // Apply id to the player container
    container.id = `${~~(Date.now() / 1000)}-${[...Array(8)].map(() => Math.random().toString(36)[2]).join("")}`;
    Object.assign(container.dataset, { ...params["containerData"], portalType: params["type"] });
    this.portalTarget.appendChild(container);
    return container;
  }

  // All ported items are treated as players
  addPlayer(event) {
    const params = event.params;
    // Create player and player container
    const container = this.createContainer(params);
    container.innerHTML = event.target.closest("[data-portal-type-param]").querySelector("template[data-portal-target=template]").innerHTML;
    this.portalTarget.appendChild(container);
    this.handleExit(container, params["duration"]);
    this.queuePlayer(params["type"], container.id);
  }

  // Keep track of all players
  // Add player to queue whenever a portal is opened
  queuePlayer(type, id) {
    this.portalTarget.dataset[`${type}QueueValue`] = JSON.stringify([...this.currentQueue(type), id]);
    this.element.dataset[`${type}PortalOpened`] = true;
  }

  // Unqueue players when portal is closed
  unqueuePlayer(type, id) {
    // Delete player from current queue
    const newQueue = this.currentQueue(type);
    newQueue.splice(this.currentQueue(type).indexOf(id), 1);
    this.portalTarget.dataset[`${type}QueueValue`] = newQueue;
    // Update portal-opened data if queue is cleared
    if (newQueue.length == 0) this.element.dataset[`${type}PortalOpened`] = false;
  }

  handleExit(container, duration) {
    if (duration) {
      setTimeout(() => this.removeContainer(container), duration);
    } else {
      container.addEventListener("click", () => this.removeContainer(container));
    }
  }

  removeContainer(container) {
    this.unqueuePlayer(container.dataset.portalType, container.id);
    container.remove();
  }
}