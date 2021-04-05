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
    count: Number
  }

  connect() {
    this.heartTarget.addEventListener("animationend", (e) => e.target.classList.remove("heart--animating"));
  }

  hover() {
    this.heartTarget.classList.add("hover");
  }

  unhover() {
    this.heartTarget.classList.remove("hover");
  }

  like(e) {
    e.stopPropagation();
    // Animate heart after clicking
    this.heartTarget.classList.add("heart--animating");
    // Like if not liking, liking status shoud be set in dataset
    this.post();
  }

  countValueChanged() {
    this.countTarget.innerHTML = this.countValue > 0 ? this.countValue : "";
  }

  async post() {
    const cancel = this.likedValue;
    this.likedValue = !cancel;
    const identity = await new Identity().get();
    const identityQuery = `&identity=${identity}`;
    const cancelQuery = cancel ? "&cancel=1": "";
    fetch(`/api/like?article_id=${this.idValue + cancelQuery + identityQuery}`)
      .then((res) => {
        if (res.ok) {
          this.countValue += this.likedValue ? 1 : -1;
        } else {
          throw new Error("Fetch failed.");
        }
      })
      // Revert color change if not successful
      .catch(() => this.likedValue = cancel);
  }
}