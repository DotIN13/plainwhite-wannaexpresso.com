import { Controller } from "stimulus";

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
    this.buttonNextTarget.classList.toggle("hide", this.trackTarget.scrollLeft >= (this.trackTarget.scrollWidth - this.trackTarget.offsetWidth) - 124);
  }
}