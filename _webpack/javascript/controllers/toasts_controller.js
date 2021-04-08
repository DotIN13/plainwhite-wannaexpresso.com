import { Controller } from "stimulus";

export default class extends Controller {

  static targets = [
    "toast"
  ]

  static values = {
    queue: String
  }

  queueValueChanged() {
    let accumulated = 0;
    // Reverse toast list to always append from the top
    this.toastTargets.reverse().forEach((toast) => {
      toast.style.transform = `translateY(${accumulated}px)`;
      accumulated += toast.firstChild.offsetHeight + toast.firstChild.offsetTop;
    });
  }
}