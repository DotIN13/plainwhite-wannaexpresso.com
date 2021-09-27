import { Controller } from "@hotwired/stimulus";

String.prototype.empty = function() {
  if (this.trim() === "") return true;
  return false;
};

export default class extends Controller {

  static targets = [
    "cloud",
    "tag",
    "toggle",
    "year"
  ]

  static values = {
    index: String,
  }

  connect() {
    this.loadQuery();
    // When going back, honour given query
    window.onpopstate = () => this.loadQuery();
  }

  set cloudExpanded(val) {
    this.cloudTarget.ariaExpanded = val;
    this.tagTargets.forEach(tag => tag.classList.toggle("expand", val));
  }

  get cloudExpanded() {
    return this.cloudTarget.ariaExpanded || false;
  }

  focus(e) {
    e.preventDefault();
    this.indexValue = e.target.dataset.encode;
    // When loading query, it is not necessary to setUrlQuery again
    this.setUrlQuery({ tag: this.indexValue });
  }

  toggleCloud() {
    this.cloudExpanded = !this.cloudExpanded;
  }

  indexValueChanged() {
    for (const tag of this.tagTargets) {
      const match = this.indexValue === tag.dataset.encode;
      tag.classList.toggle("focus", match);
      if (match) tag.classList.add("visited");
    }
    this.sort();
  }

  sort() {
    // console.log("Clicked post tag with ecoded tag", encodedTag);
    const years = this.yearTargets;
    for (const year of years) {
    // console.log("Querying year", year);
      const posts = year.querySelectorAll(".post-item");
      let yearDisplay = false;
      for (const post of posts) {
      // console.log("Querying post", post)
      // Match given tag in post tags
        const postDisplay = post.dataset.tags.split(",").indexOf(this.indexValue) != -1 || this.indexValue.empty();
        // console.log(encodedTag, "macthed", post.dataset.tags.split(","), "with", postDisplay)
        // Add d-none if no match
        post.classList.toggle("d-none", !postDisplay);
        // Remove year d-none if match
        yearDisplay = postDisplay ? true : yearDisplay;
      }
      year.classList.toggle("d-none", !yearDisplay);
    }
  }

  setUrlQuery(query) {
    const url = new URL(window.location);
    if (!(query["tag"].empty()))
      url.searchParams.set("tag", query["tag"]);
    window.history.pushState({ tag: query["tag"] }, "", url);
  }
  
  loadQuery() {
    const url = new URL(window.location);
    const queryVal = url.searchParams.get("tag");
    // Only sort when the query exists
    if (queryVal) this.indexValue = queryVal;
  }
}