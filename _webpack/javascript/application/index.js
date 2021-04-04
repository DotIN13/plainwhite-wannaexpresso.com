/* Modules */
import { bindHeartActions, fetchLikes } from '../likes';
import initWorkbox from './workbox-utilities';

// Darkmode
import {updateDark, bindDarkToggle} from "./darkmode";
updateDark();

// Stimulus
import { Application } from "stimulus";
import PortalController from "../controllers/portal_controller";
const application = Application.start();

application.register("portal", PortalController);

// Window onLoad
window.addEventListener('DOMContentLoaded', () => {
  // Workbox
  initWorkbox();

  // Darkmode
  bindDarkToggle();

  // Heart-shaped like button animations
  bindHeartActions();
  fetchLikes();
});

/* CSS */
import '../../stylesheets/custom.scss';
