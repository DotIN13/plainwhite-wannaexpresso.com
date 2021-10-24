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
  
  static values = {
    counts: Object,
  }

  connect() {
    this.pull()
      .then(() => this.countsUpdated = true);
  }

  updateLike(target) {
    Object.assign(target.dataset, this.countsValue[target.dataset.likeIdValue]);
  }

  itemTargetConnected(target) {
    this.updateLike(target);
  }

  countsValueChanged() {
    this.itemTargets.forEach(target => this.updateLike(target));
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
      .then(res => res.json())
      .then(json => this.countsValue = json);
    // .then((json) => likables.forEach(el => Object.assign(el.dataset, json[el.dataset.likeIdValue])));
  }
}