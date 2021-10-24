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
  toggleLike() {
    const deviation = this.likedValue ? -1 : 1;
    const likeCounts = JSON.parse(document.body.dataset.likesCountsValue);
    const likeCountValue = (Number(likeCounts[this.idValue]) || 0) + deviation;
    const likeLikedValue = !this.likedValue;
    // Should be object
    likeCounts[this.idValue] = { likeCountValue, likeLikedValue };
    document.body.dataset.likesCountsValue = JSON.stringify(likeCounts);
    // el.dataset.likeLikedValue = status;
    // el.classList.toggle("like__button--liked", status);
    // el.dataset.likeCountValue = (Number(el.dataset.likeCountValue) || 0) + (status ? 1 : -1);
  }

  countValueChanged(val) {
    this.countTarget.innerHTML = val > 0 ? val : this.placeholderValue;
  }

  likedValueChanged(val) {
    this.element.classList.toggle("like__button--liked", val);
  }

  // get instances() {
  //   return document.querySelectorAll(`[data-like-id-value="${this.idValue}"]`);
  // }

  async post() {
    // Apply liked and count values before sending the request
    this.toggleLike();
    // Send request
    const identity = await new Identity().get();
    const identityQuery = `&identity=${identity}`;
    const cancelQuery = this.likedValue ? "" : "&cancel=1";
    fetch(`/api/likes/post?article_id=${this.idValue + cancelQuery + identityQuery}`)
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed.");
      })
      // Revert color change if not successful
      .catch(() => this.toggleLike());
  }
}