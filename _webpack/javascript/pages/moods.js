import { responsiveGenerator, importAll } from '../responsive-img';

const imagesAvif = importAll(require.context('/assets/img/in-mood?sizes[]=320,sizes[]=540&format=avif', true, /\.(jpe?g|png|webp|webp)$/i));
const imagesWebp = importAll(require.context('/assets/img/in-mood?sizes[]=320,sizes[]=540&format=webp', true, /\.(jpe?g|png|webp|webp)$/i));
const imageSizes = "(max-width: 1024px) 280px, (max-width: 1600px) 484px, 484px";
import mediumZoom from 'medium-zoom';

const moods = {
  get section() {
    delete this.section;
    return document.querySelector("section.mood-content");
  },
  get focus() {
    let focus = document.querySelector(".mood.focus");
    return focus ? focus : document.querySelector(".mood");
  },
  get all() {
    delete this.all;
    return this.all = document.querySelectorAll(".mood");
  },
  get count() {
    delete this.count;
    return this.count = this.all.length;
  },
  get buttonPrev() {
    delete this.buttonPrev;
    return this.buttonPrev = document.querySelector(".mood-button--prev");
  },
  get buttonNext() {
    delete this.buttonNext;
    return this.buttonNext = document.querySelector(".mood-button--next");
  },
  get track() {
    delete this.track;
    return this.track = document.querySelector(".mood-track");
  },
  get index() {
    return Number(this.track.dataset.moodFocus);
  },
  set index(val) {
    // Set moods index
    this.track.dataset.moodFocus = val;
    this.center(false, val);
  },
  center(scroll = false, val = this.index) {
    this.all.forEach((el, i) => {
      // Set focus class
      el.classList.toggle("focus", i == val);
      // ScrollIntoView
      if (i == val && scroll) el.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    });
  }
};

/** Mood navigator */
// Moods index range (0..moods.count - 1)
function nextMood() {
  let max = moods.count - 1;
  moods.index = moods.index + 1 <= max ? moods.index + 1 : max;
  moods.center(true);
}

function prevMood() {
  moods.index = (moods.index - 1) >= 0 ? moods.index - 1 : 0;
  moods.center(true);
}

/** Hide mood scroll button if scrolled to the edge of the track */
function updateScrollButton() {
  moods.buttonPrev.classList.toggle("hide", !moods.track.scrollLeft);
  moods.buttonNext.classList.toggle("hide", moods.track.scrollLeft >= (moods.track.scrollWidth - moods.track.offsetWidth) * .8);
}

function updateScrollIndex() {
  let trackRect = moods.track.getBoundingClientRect();
  // Calculate the offset between the moodbox center and the track left border
  let trackLeft = trackRect.left + trackRect.width / 2;
  moods.all.forEach((mood, index) => {
    // Get the distance between Mmood center line to left screen border
    let moodRect = mood.getBoundingClientRect();
    let moodLeft = moodRect.left + moodRect.width / 2;
    if (Math.abs(moodLeft - trackLeft) < moodRect.width * 0.2) {
      moods.index = index;
      return;
    }
  });
}

/** Mood images */
function renderMoodImages() {
  const zoom = mediumZoom([], {
    template: "#mood-zoom",
    container: "[data-zoom-container]"
  });
  document.querySelectorAll('.mood-header-image').forEach((el, index) => {
    const img = responsiveGenerator(el, [imagesAvif[el.dataset.path], imagesWebp[el.dataset.path]], imageSizes, index > 1);
    zoom.attach(img);
    img.addEventListener("click", e => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      zoom.open({target: img});
    });
  });
}

/** Global functions */
function moodInit() {
  if (document.querySelector(".mood")) {
    renderMoodImages();
    moods.buttonPrev.addEventListener("click", prevMood);
    moods.buttonNext.addEventListener("click", nextMood);
    moods.track.addEventListener("scroll", updateScrollButton);
    moods.track.addEventListener("scroll", updateScrollIndex);
  }
}

window.addEventListener("DOMContentLoaded", moodInit);