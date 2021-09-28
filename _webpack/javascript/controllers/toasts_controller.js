import { Controller } from "@hotwired/stimulus";

export default class extends Controller {

  static targets = [
    "toast"
  ]

  static values = {
    queue: Array
  }

  queueValueChanged() {
    let accumulated = 0;
    // Reverse toast list to always append from the top
    this.toastTargets.reverse().forEach((toast) => {
      toast.style.transform = `translateY(${accumulated}px)`;
      accumulated += toast.firstElementChild.offsetHeight + toast.firstElementChild.offsetTop;
    });
  }
}