/* Modules */

import initWorkbox from './workbox-utilities';
// eslint-disable-next-line no-unused-vars
import * as Turbo from "@hotwired/turbo";

// Stimulus
import { Application } from "@hotwired/stimulus";
import PortalController from "../controllers/portal_controller";
import AboutController from "../controllers/about_controller";
import DarkmodeController from "../controllers/darkmode_controller";
import LocaleController from "../controllers/locale_controller";
import ToastsController from "../controllers/toasts_controller";
import LikesController from "../controllers/likes_controller";
import LikeController from "../controllers/like_controller";

const application = Application.start();

application.register("darkmode", DarkmodeController);
application.register("portal", PortalController);
application.register("about", AboutController);
application.register("locale", LocaleController);
application.register("toasts", ToastsController);
application.register("likes", LikesController);
application.register("like", LikeController);

// Initialize workbox
window.addEventListener('DOMContentLoaded', initWorkbox);

/* CSS */

import '../../stylesheets/custom.scss';
