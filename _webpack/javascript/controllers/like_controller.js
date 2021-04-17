import { Controller } from "stimulus";
import Identity from "../shared/identity";

export default class extends Controller {
  static targets = [
    "button",
    "count",
    "heart"
  ]

  static values = {
    id: String,
    liked: Boolean,
    count: Number,
    placeholder: String
  }

  connect() {
    this.heartTarget.addEventListener("animationend", (e) => e.target.classList.remove("heart--animating"));
    ["touchstart", "touchend", "mousedown", "mouseup", "click"].forEach(type => {
      this.buttonTarget.addEventListener(type, e => e.stopPropagation());
    });
  }

  hover() {
    this.heartTarget.classList.add("hover");
  }

  unhover() {
    this.heartTarget.classList.remove("hover");
  }

  like() {
    // Animate heart after clicking
    this.heartTarget.classList.add("heart--animating");
    // Like if not liking, liking status shoud be set in dataset
    this.post();
  }

  // Silence first changed event fired upon initialization
  likedValueChanged() {
    if (!this.likable) {this.likable = true; return; }
    this.countValue ||= 0;
    this.countValue += this.likedValue ? 1 : -1;
  }

  countValueChanged() {
    this.countTarget.innerHTML = this.countValue > 0 ? this.countValue : this.placeholderValue || "LIKE";
  }

  get instances() {
    return document.querySelectorAll(`[data-like-id-value="${this.idValue}"]`);
  }

  async post() {
    const cancel = this.likedValue;
    // Toggle liked of all instance, including non-portal likes
    this.instances.forEach(el => el.dataset.likeLikedValue = !cancel);
    const identity = await new Identity().get();
    const identityQuery = `&identity=${identity}`;
    const cancelQuery = cancel ? "&cancel=1": "";
    fetch(`/api/like?article_id=${this.idValue + cancelQuery + identityQuery}`)
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed.");
      })
      // Revert color change if not successful
      .catch(() => this.instances.forEach(el => el.dataset.likeLikedValue = cancel));
  }
}