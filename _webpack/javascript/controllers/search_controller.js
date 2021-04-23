// eslint-disable-next-line no-unused-vars
import SimpleJekyllSearch from 'simple-jekyll-search';
import { Controller } from "stimulus";

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
    
    document.body.addEventListener("click", this.hide.bind(this));
  }

  show(e) {
    e.stopPropagation();
    if (e.target.dataset.action != "click->search#show") return;

    this.focus = true;
    this.barTarget.focus();
  }

  hide(e) {
    if (!e.target.closest(".search__container"))
      this.focus = false;
  }
}