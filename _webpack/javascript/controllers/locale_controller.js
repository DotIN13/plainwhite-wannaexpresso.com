import { Controller } from "stimulus";

export default class extends Controller {

  connect() {
    const languageToggles = document.querySelectorAll(".language-selection");
    // const isZH = document.querySelector("meta[lang]")?.lang === "zh";
    const isZH = this.element.lang === "zh";
    languageToggles.forEach(el => el.href = isZH ? "/en-us/" : "/");
  }
}