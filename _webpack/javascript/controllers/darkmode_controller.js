import { Controller } from "@hotwired/stimulus";

const getCookie = (name) => {
  const v = document.cookie.match(`(^|;) ?${name}=([^;]*)(;|$)`);
  return v ? v[2] : null;
};

const setCookie = (name, value, days) => {
  let d = new Date;
  d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
  document.cookie = `${name}=${value};path=/;SameSite=strict;expires=${d.toGMTString()}`;
};

export default class extends Controller {
  static targets = [
    "indicator"
  ]

  connect() {
    const systemDark = window?.matchMedia('(prefers-color-scheme: dark)').matches;
    const userDark = getCookie('theme');
    if (userDark) { this.dark = userDark === "dark"; return; }

    this.dark = systemDark;
  }

  set dark(val) {
    this.isDark = val;
    this.element.classList.toggle("dark", val);
    this.indicatorTargets.forEach(el => el.className = val ? "icon-sun" : "icon-moon");
  }

  get dark() {
    return this.isDark;
  }

  toggle(e) {
    e.preventDefault();
    this.dark = !this.dark;
    setCookie('theme', this.dark ? "dark" : "light");
  }
}