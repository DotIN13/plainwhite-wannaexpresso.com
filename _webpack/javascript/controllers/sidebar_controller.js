import { Controller } from "stimulus";

export default class extends Controller {

  show() {
    this.element.classList.add("shift");
  }

  hide(e) {
    e.preventDefault();
    this.element.classList.remove("shift");
  }
}