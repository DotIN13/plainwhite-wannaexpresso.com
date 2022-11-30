import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["time"];

  get times() {
    return {
      minute: 60,
      hour: 60 * 60,
      day: 24 * 60 * 60,
      week: 7 * 24 * 60 * 60,
    };
  }

  connect() {
    if (this.hasTimeTarget) {
      this.timeTargets.forEach((target) => {
        const newTime = this.ago(target.dateTime);
        newTime && (target.innerText = newTime);
      });
    }
  }

  ago(moodTime) {
    const moodDate = new Date(moodTime);
    moodTime = moodDate.getTime();
    const now = Date.now();
    const diff = (now - moodTime) / 1000;
    const { minute, hour, day, week } = this.times;
    if (diff < minute) return `${Math.round(diff)}s`;
    if (diff < hour) return `${Math.round(diff / minute)}min`;
    if (diff < day) return `${Math.round(diff / hour)}h`;
    if (diff < week) return `${Math.round(diff / day)}d`;

    return false;
  }
}
