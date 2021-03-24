import SimpleJekyllSearch from 'simple-jekyll-search';

window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById("searchbar")) {
    /* Simple Jekyll Search */
    window.SimpleJekyllSearch({
      searchInput: document.getElementById('searchbar'),
      resultsContainer: document.getElementById('search-results'),
      json: '/search.json',
      searchResultTemplate: '<a href="{url}" target="_blank">{title}</a>',
      noResultsText: ''
    });

    /* hack ios safari unfocus */
    if (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent))
      document.body.firstElementChild.tabIndex = 1;

    let $labelGroup = document.querySelector(".labelgroup.search");
    let $searchbar = $labelGroup.querySelector("#searchbar");
    let $postLabel = $labelGroup.querySelector(".posts-label");
    let $searchResults = $labelGroup.querySelector(".search-results");
    let labelWidth = $postLabel.scrollWidth;
    $postLabel.style.width = `${labelWidth}px`;

    $labelGroup.addEventListener("click", (e) => {
      $searchResults.style.display = null;
      $postLabel.style.width = "0";
      $labelGroup.classList.add("focus-within");
      $searchbar.focus();
      e.stopPropagation();
    }, false);

    $labelGroup.addEventListener("mouseleave", () => {
      document.body.onclick = searchCollapse;
    });

    const searchCollapse = function () {
      $searchResults.style.display = "none";
      $labelGroup.classList.remove("focus-within");
      $postLabel.style.width = `${labelWidth  }px`;
      document.body.onclick = null;
    };
  }
}, false);