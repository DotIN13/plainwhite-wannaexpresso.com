window.addEventListener("load", bindMood, false)

function bindMood() {
  document.querySelectorAll('.mood').forEach((el) => {
    el.addEventListener("click", function() {
      let art = el.querySelector("article")
      art.dataset.temp = art.innerHTML
      art.innerHTML = art.dataset.full
      art.dataset.full = art.dataset.temp 
    })
  })
}