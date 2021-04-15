// eslint-disable-next-line no-unused-vars
import SimpleJekyllSearch from 'simple-jekyll-search';
import { Controller } from "stimulus";

export default class extends Controller {

  static targets = [
    "label",
    "bar",
    "results"
  ]

  connect() {
    window.SimpleJekyllSearch({
      searchInput: this.barTarget,
      resultsContainer: document.getElementById('search-results'),
      json: '/search.json',
      searchResultTemplate: '<a href="{url}">{title}</a>',
      noResultsText: ''
    });

    /* hack ios safari unfocus */
    if (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent))
      document.body.firstElementChild.tabIndex = 1;
    
    document.body.addEventListener("click", this.hide.bind(this));
  }

  show(e) {
    e.stopPropagation();
    this.resultsTarget.style.display = null;
    this.labelTarget.style.width = "0";
    this.element.classList.add("focus-within");
    this.barTarget.focus();
  }

  hide() {
    this.resultsTarget.style.display = "none";
    this.element.classList.remove("focus-within");
    this.labelTarget.style.width = "auto";
  }
}