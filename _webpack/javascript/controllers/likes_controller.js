import { Controller } from "stimulus";
import Identity from "../shared/identity";

export default class extends Controller {
  static targets = [
    "item"
  ]

  connect() {
    this.pull();
  }

  async pull() {
    // Get all like buttons
    const likables = this.itemTargets;
    // Get all article IDs with like counts to retrieve
    const likableIds = Array.from(likables).map(el => el.dataset.likeIdValue);

    const identity = await new Identity().get();
    const identityQuery = `?identity=${identity}`;

    fetch(`/api/get_likes${identityQuery}`, {
      body: JSON.stringify(likableIds),
      method: "POST",
      contentType: "application/json"
    })
      .then((res) => res.json())
      .then((json) => {
      // console.log(json);
        likables.forEach(el => {
          el.dataset.likeCountValue = json[el.dataset.likeIdValue].count;
          el.dataset.likeLikedValue = json[el.dataset.likeIdValue].liked;
        });
      });
  }
}