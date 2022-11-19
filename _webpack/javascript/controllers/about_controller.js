import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["about", "inner", "wide"];

  // Connect lifecycle is excecuted each time page loads
  initialize() {
    this.timeout = false;
    this.readRect();
  }

  wideTargetConnected(target) {
    console.log("connected target")
    this.observeAbout(target);
  }

  wideTargetDisconnected(target) {
    this.observer.unobserve(target);
  }

  // Detect intersection between about section and other wide grid elements
  observeAbout(...targets) {
    // eslint-disable-next-line no-unused-vars
    this.observer = new IntersectionObserver(
      (entries, _obs) => this.handleAbout(entries),
      {
        rootMargin: `${this.aboutTop} 0% ${this.aboutBottom} 0%`,
        threshold: [0, 0.01],
      }
    );
    targets.forEach((el) => this.observer.observe(el));
  }

  // Whenever the page is resized, update observations
  updateObserver() {
    this.observer?.disconnect();
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

  readRect() {
    const { bottom } = this.innerTarget.getBoundingClientRect();
    this.aboutTop = `-${this.innerTarget.style
      .getPropertyValue("--about-top")
      .trim()}`;
    this.aboutBottom = `${-Math.round(
      (1 - bottom / window.innerHeight) * 100
    )}%`;
    console.log(this.aboutTop);
  }

  disconnect() {
    this.observer.disconnect();
  }
}
