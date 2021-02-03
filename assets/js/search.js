window.onload = function () {
  var sjs = SimpleJekyllSearch({
    searchInput: document.getElementById('searchbar'),
    resultsContainer: document.getElementById('search-results'),
    json: '/search.json',
    searchResultTemplate: '<a href="{url}" target="_blank">{title}</a>',
    noResultsText: ''
  });

  /* hack ios safari unfocus */
  if (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent))
    document.body.firstElementChild.tabIndex = 1;

  var $labelGroup = document.querySelector(".labelgroup.search");
  var $searchbar = $labelGroup.querySelector("#searchbar");
  var $postLabel = $labelGroup.querySelector(".posts-label");
  var $searchResults = $labelGroup.querySelector(".search-results");
  var labelWidth = $postLabel.scrollWidth;
  $postLabel.style.width = labelWidth + "px";

  $labelGroup.addEventListener("click", function (e) {
    $searchResults.style.display = null;
    $postLabel.style.width = "0";
    $labelGroup.classList.add("focus-within");
    $searchbar.focus();
    e.stopPropagation();
  }, false);

  $labelGroup.addEventListener("mouseleave", function () {
      document.body.onclick = searchCollapse;
  });

  var searchCollapse = function (e) {
    $searchResults.style.display = "none";
    $labelGroup.classList.remove("focus-within");
    $postLabel.style.width = labelWidth + "px";
    document.body.onclick = null;
  };
}