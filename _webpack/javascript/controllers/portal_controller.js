import { Controller } from "stimulus";

export default class extends Controller {
  static targets = [
    "portal",
    "template"
  ]

  get portal() {
    return document.querySelector("[data-portal-target=portal]") || this.createPortal();
  }

  set portal(el) {
    const clone = document.createElement("div");
    clone.classList = el.classList;
    clone.innerHTML = el.innerHTML;
    this.portal.appendChild(clone);
    this.portal.dataset.controller = "portal";
    this.portal.dataset.action = "click->portal#deport";
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

  deport() {
    this.portal.remove();
  }
}