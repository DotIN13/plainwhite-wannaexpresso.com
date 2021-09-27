import { Controller } from "@hotwired/stimulus";

export default class extends Controller {

  static targets = [
    "avatar",
    // Sidebar items
    "item",
    // Container for the sidebar and the about section
    "container"
  ]

  static values = {
    list: String
  }

  // Connect lifecycle is excecuted each time page loads
  connect() {
    this.updateNav();
    this.observeAvatar();
  }

  set expand(val) {
    this.element.classList.remove("expand-end");
    this.element.dataset.rippleExpandValue = this.expanded = val;
    // Disable scroll when sidebar expanded
    document.body.classList.toggle("no-scroll-y", val);
    this.element.classList.toggle("expand", val);
  }

  get expand() {
    return this.expanded || false;
  }

  // Highlight navigation item when activated
  updateNav() {
    // Match sidebar item list
    let location = window.location.pathname;
    const itemList = this.listValue.split(",");
    // Set fallback location if no match
    if (!itemList.includes(window.location.pathname)) location = itemList[0];
    this.itemTargets.forEach(target => target.classList.toggle("sidebar__item--active", target.pathname === location));
  }

  toggle(e) {
    e.stopPropagation();
    this.logClick(e);
    this.expand = !this.expand;
  }

  hide(e) {
    if (!this.expand) return;

    this.logClick(e);
    this.expand = false;
  }

  logClick(e) {
    this.element.dataset.ripplePosValue = JSON.stringify([e.clientX, e.clientY]);
  }

  // endAnimation() {
  //   this.element.classList.add("expand-end");
  // }

  // // Enable swipe for mobile devices
  // set swipes(evt) {
  //   this.touchPos ||= [];
  //   this.touchPos.push([evt.touches[0].clientX, evt.touches[0].clientY]);
  // }

  // get swipes() {
  //   return this.touchPos || [];
  // }

  // get swipeX() {
  //   if (this.swipes.length < 2) return 0;

  //   return this.swipes[this.swipes.length - 1][0] - this.swipes[0][0];
  // }

  // initSwipe() {
  //   this.currentTransform = getComputedStyle(this.containerTarget.firstElementChild).transform;
  // }
  
  // swipe(e) {
  //   if (!this.validSwipe()) return;
  //   this.swipes = e;

  //   this.containerTarget.children.forEach(child => {
  //     child.style.transition = "none";
  //     child.style.transform = `${this.currentTransform} translateX(${this.swipeX}px)`;
  //   });
  // }

  // clearSwipe() {
  //   if (Math.abs(this.swipeX) > this.containerTarget.offsetWidth * .1) this.expanded = this.swipeX > 0;
  //   this.touchPos = null;
  //   this.containerTarget.children.forEach(child => child.style = "");
  //   this.currentTransform = undefined;
  // }

  // // Determine whether the move is valid
  // validSwipe() {
  //   if (this.swipes.length < 2) return true;

  //   if (Math.abs(this.swipes[0][1] - this.swipes[this.swipes.length - 1][1]) < 15) return true;

  //   return false;
  // }

  // Detect intersection between viewport and avatar
  observeAvatar() {
    // eslint-disable-next-line no-unused-vars
    const avatarObserver = new IntersectionObserver((entries, _obs) => this.handleAvatar(entries), {
      rootMargin: "0px",
      threshold: 0,
    });
    avatarObserver.observe(this.avatarTarget);
  }

  handleAvatar(entries) {
    entries.forEach(e => {
      // When scrolling up, the intersectionRatio always returns positive
      // When scrolling down, the intersectionRatio always returns zero
      this.element.classList.toggle("float-avatar", e.intersectionRatio === 0);
    });
  }
}