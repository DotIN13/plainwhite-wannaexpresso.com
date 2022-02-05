// eslint-disable-next-line no-unused-vars
import SimpleJekyllSearch from 'simple-jekyll-search';
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {

  static targets = [
    "bar",
    "container"
  ]

  /**
   * @param {boolean} val
   */
  set focus(val) {
    this.focusWithin = val;
    this.element.classList.toggle("focus-within", val);
  }

  connect() {
    window.SimpleJekyllSearch({
      searchInput: this.barTarget,
      resultsContainer: document.getElementById('search-results'),
      json: '/search.json',
      searchResultTemplate: '<a href="{url}" class="icon-search">{title}</a>',
      noResultsText: ''
    });

    /* hack ios safari unfocus */
    if (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent))
      document.body.firstElementChild.tabIndex = 1;
  }

  show(e) {
    e.stopPropagation();
    if (e.target.dataset.action != "click->search#show") return;

    this.focus = true;
    this.barTarget.focus();
  }

  hide(e) {
    if (!this.element.contains(e.target))
      this.focus = false;
  }
}