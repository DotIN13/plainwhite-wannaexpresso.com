import { Controller } from "@hotwired/stimulus";

export default class extends Controller {

  connect() {
    const languageToggles = document.querySelectorAll(".language-selection");
    // const isZH = document.querySelector("meta[lang]")?.lang === "zh";
    const isZh = this.element.lang === "zh";
    languageToggles.forEach(el => el.href = isZh ? "/en-us/" : "/");
  }
}