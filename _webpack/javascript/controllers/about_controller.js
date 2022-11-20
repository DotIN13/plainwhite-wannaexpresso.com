import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["about", "inner", "wide"];

  // Connect lifecycle is excecuted each time page loads
  initialize() {
    this.timeout = false;
    this.readRect();
  }

  wideTargetConnected(target) {
    this.observeAbout(target);
  }

  wideTargetDisconnected(target) {
    this.observer.unobserve(target);
  }

  // Detect intersection between about section and other wide grid elements
  observeAbout(...targets) {
    targets.forEach((el) => this.observer.observe(el));
  }

  readRect() {
    const { bottom } = this.innerTarget.getBoundingClientRect();
    this.aboutTop = `-${this.innerTarget.style
      .getPropertyValue("--about-top")
      .trim()}`;
    this.aboutBottom = `${-Math.floor(
      (1 - bottom / window.innerHeight) * 100
    )}%`; // Round down to make the observer more sensitive
    // Initialize a new observer with the new rect
    // eslint-disable-next-line no-unused-vars
    this.observer?.disconnect();
    this.observer = new IntersectionObserver(
      (entries, _obs) => this.handleAbout(entries),
      {
        rootMargin: `${this.aboutTop} 0% ${this.aboutBottom} 0%`,
        threshold: [0, 0.01],
      }
    );
  }

  // Whenever the page is resized, update observations
  updateObserver() {
    clearTimeout(this.timeout);
    const update = () => {
      this.readRect();
      this.observeAbout(...this.wideTargets);
    };
    this.timeout = setTimeout(update.bind(this), 500);
  }

  handleAbout(entries) {
    entries.forEach((e) => {
      this.aboutTarget.classList.toggle("intersecting", e.isIntersecting);
    });
  }

  disconnect() {
    this.observer?.disconnect();
  }
}
