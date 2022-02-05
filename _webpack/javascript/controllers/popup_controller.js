import { Controller } from "@hotwired/stimulus";

export default class extends Controller {

  static targets = ["popup"]

  static values = {
    pop: Boolean,
  }

  toggle() {
    this.popValue ||= false;
    this.popValue = !this.popValue;
  }

  popValueChanged() {
    this.element.classList.toggle("popup--pop", this.popValue);
  }

  hide(e) {
    if (!this.element.contains(e.target))
      this.popValue = false;
  }
}