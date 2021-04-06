import initSearch from "../shared/search";

String.prototype.empty = function() {
  if (this.trim() === "") return true;
  return false;
};

const tagCloud = {
  get element() { return document.getElementById("tag-cloud"); },
  get tags() {
    return document.querySelectorAll(".tag-button");
  },
  // Use data-encode for identification
  set focus(val) {
    this.element.dataset.index = val;
    for (const tag of this.tags) {
      const match = val == tag.dataset.encode;
      tag.classList.toggle("focus", match);
      if (match) tag.classList.add("visited");
    }
    sort(val);
  },
  get focus() {
    return this.element.dataset.index;
  }
};

const handle = {
  get element() {
    return document.getElementById("show-tags");
  },
  set stateExpand(val) {
    this.element.dataset.expand = val;
  },
  get stateExpand() {
    return this.element.dataset.expand == "true";
  },
  toggle() {
    tagCloud.tags.forEach((el) => el.classList.toggle("expand", !this.stateExpand));
    this.stateExpand = !this.stateExpand;
  }
};

const sort = (encodedTag) => {
  // console.log("Clicked post tag with ecoded tag", encodedTag);
  const years = document.querySelectorAll(".mini-post-list section");
  for (const year of years) {
    // console.log("Querying year", year);
    const posts = year.querySelectorAll(".post-item");
    let yearDisplay = false;
    for (const post of posts) {
      // console.log("Querying post", post)
      // Match given tag in post tags
      const postDisplay = post.dataset.tags.split(",").indexOf(encodedTag) != -1 || encodedTag.empty();
      // console.log(encodedTag, "macthed", post.dataset.tags.split(","), "with", postDisplay)
      // Add d-none if no match
      post.classList.toggle("d-none", !postDisplay);
      // Remove year d-none if match
      yearDisplay = postDisplay ? true : yearDisplay;
    }
    year.classList.toggle("d-none", !yearDisplay);
  }
};

const setUrlQuery = (query) => {
  const url = new URL(window.location);
  if (!(query["tag"].empty()))
    url.searchParams.set("tag", query["tag"]);
  window.history.pushState({ tag: query["tag"] }, "", url);
};

const loadQuery = () => {
  const url = new URL(window.location);
  const queryVal = url.searchParams.get("tag");
  // Only sort when the query exists
  if (queryVal) tagCloud.focus = queryVal;
};

document.addEventListener("DOMContentLoaded", () => {
  for (const tag of tagCloud.tags) {
    tag.addEventListener("click", (e) => {
      e.preventDefault();
      tagCloud.focus = e.target.dataset.encode;
      // When loading query, it is not necessary to setUrlQuery again
      setUrlQuery({ tag: tagCloud.focus });
    });
  }
  loadQuery();
  // When going back, honour given query
  window.onpopstate = () => loadQuery();

  handle.element.addEventListener("click", handle.toggle);

  initSearch();
});
