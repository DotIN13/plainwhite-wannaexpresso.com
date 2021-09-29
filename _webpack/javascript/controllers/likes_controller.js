import { Controller } from "@hotwired/stimulus";
import Identity from "../shared/identity";

// WIP
// Store likes in a single dataset
// Broadcast likes to all like buttons when updated
// Update dataset when like buttons are pressed
export default class extends Controller {
  static targets = [
    "item"
  ]

  connect() {
    this.pull();
  }

  async pull() {
    // Get all like buttons
    // Ignore any likables without ID
    const likables = this.itemTargets.filter(el => el.dataset.likeIdValue);
    // Get all article IDs with like counts to retrieve
    const likableIds = Array.from(likables).map(el => `likable=${el.dataset.likeIdValue}`);

    const identity = await new Identity().get();
    const identityQuery = `?identity=${identity}`;

    fetch(`/api/likes/get${identityQuery}&${likableIds.join("&")}`)
      .then((res) => res.json())
      .then((json) => likables.forEach(el => Object.assign(el.dataset, json[el.dataset.likeIdValue])));
  }
}