/* Modules */
import initWorkbox from './workbox-utilities';

// Darkmode
import {updateDark, bindDarkToggle} from "./darkmode";
updateDark();

// Stimulus
import { Application } from "stimulus";
import PortalController from "../controllers/portal_controller";
import LikesController from "../controllers/likes_controller";
import LikeController from "../controllers/like_controller";
const application = Application.start();

application.register("portal", PortalController);
application.register("likes", LikesController);
application.register("like", LikeController);

// Window onLoad
window.addEventListener('DOMContentLoaded', () => {
  // Workbox
  initWorkbox();
  // Darkmode
  bindDarkToggle();
});

/* CSS */
import '../../stylesheets/custom.scss';
