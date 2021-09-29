import { Controller } from "@hotwired/stimulus";
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

  like(e) {
    e.stopPropagation();
    // Like if not liking, liking status shoud be set in dataset
    this.post();
  }

  // Silence first changed event fired upon initialization
  updateLike(el, status) {
    el.dataset.likeLikedValue = status;
    el.classList.toggle("like__button--liked", status);
    el.dataset.likeCountValue = (Number(el.dataset.likeCountValue) || 0) + (status ? 1 : -1);
  }

  countValueChanged() {
    this.countTarget.innerHTML = this.countValue > 0 ? this.countValue : this.placeholderValue;
  }

  get instances() {
    return document.querySelectorAll(`[data-like-id-value="${this.idValue}"]`);
  }

  async post() {
    const cancel = this.likedValue;
    // Toggle liked of all instance, including non-portal likes
    this.instances.forEach(el => this.updateLike(el, !cancel));
    const identity = await new Identity().get();
    const identityQuery = `&identity=${identity}`;
    const cancelQuery = cancel ? "&cancel=1": "";
    fetch(`/api/likes/post?article_id=${this.idValue + cancelQuery + identityQuery}`)
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed.");
      })
      // Revert color change if not successful
      .catch(() => this.instances.forEach(el => this.updateLike(el, cancel)));
  }
}