import { h, render } from 'preact';
import { Controller } from "stimulus";
import { Picture, importAll } from '../responsive-img';

const imagesAvif = importAll(require.context('/assets/img/in-mood?format=avif', true, /\.(jpe?g|png|webp|webp)$/i));
const imagesWebp = importAll(require.context('/assets/img/in-mood?format=webp', true, /\.(jpe?g|png|webp|webp)$/i));
const imageSizes = "(max-width: 600px) 80vw, (max-width: 1024px) 60vw, (max-width: 1600px) 800px, 100vw";

export default class extends Controller {
  static targets = [
    "track",
    "item",
    "buttonPrev",
    "buttonNext",
    "image"
  ]

  static values = {
    index: Number
  }

  connect() {
    this.renderImages();
  }

  indexValueChanged() {
    this.itemTargets.forEach((el, index) => el.classList.toggle("focus", index == this.indexValue));
  }

  center() {
    this.itemTargets.forEach((el, index) => {
      if (index == this.indexValue) el.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    });
  }

  next() {
    if (this.indexValue < (this.itemTargets.length - 1)) {
      this.indexValue++;
      this.center();
    }
  }

  prev() {
    if (this.indexValue > 0) {
      this.indexValue--;
      this.center();
    }
  }

  handleScroll() {
    const trackRect = this.trackTarget.getBoundingClientRect();
    // Calculate the offset between the moodbox center and the track left border
    const trackLeft = trackRect.left + trackRect.width / 2;
    this.itemTargets.forEach((mood, index) => {
      // Get the distance between Mmood center line to left screen border
      const moodRect = mood.getBoundingClientRect();
      const moodLeft = moodRect.left + moodRect.width / 2;
      if (Math.abs(moodLeft - trackLeft) < moodRect.width * 0.2) {
        this.indexValue = index;
        return;
      }
    });
    this.buttonPrevTarget.classList.toggle("hide", !this.trackTarget.scrollLeft);
    this.buttonNextTarget.classList.toggle("hide", this.trackTarget.scrollLeft >= (this.trackTarget.scrollWidth - this.trackTarget.offsetWidth) * .8);
  }

  renderImages() {
    for (const [index, image] of this.imageTargets.entries()) {
      render(<Picture
        avif={imagesAvif[image.dataset.path]}
        webp={imagesWebp[image.dataset.path]}
        lazy={index > 1}
        sizes={imageSizes}
        imagePortalTarget="bgImage"
        picturePortalTarget="bgPicture"
      />, image);
    }
  }
}