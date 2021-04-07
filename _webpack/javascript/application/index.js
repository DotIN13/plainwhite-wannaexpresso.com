/* Modules */
import initWorkbox from './workbox-utilities';
// eslint-disable-next-line no-unused-vars
import * as Turbo from "@hotwired/turbo";

// Stimulus
import { Application } from "stimulus";
import PortalController from "../controllers/portal_controller";
import LikesController from "../controllers/likes_controller";
import LikeController from "../controllers/like_controller";
import SidebarController from "../controllers/sidebar_controller";
import DarkmodeController from "../controllers/darkmode_controller";
const application = Application.start();

application.register("darkmode", DarkmodeController);
application.register("portal", PortalController);
application.register("likes", LikesController);
application.register("like", LikeController);
application.register("sidebar", SidebarController);

// Window onLoad
window.addEventListener('turbo:load', () => {
  // Language Selection
  const languageToggles = document.querySelectorAll(".language-selection");
  const isZH = document.querySelector("meta[lang]")?.lang === "zh";
  languageToggles.forEach(el => el.href = isZH ? "/en-us/" : "/");

  // Workbox
  initWorkbox();
});

/* CSS */
import '../../stylesheets/custom.scss';
