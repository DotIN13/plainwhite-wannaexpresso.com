/* Modules */
import initWorkbox from './workbox-utilities';
// eslint-disable-next-line no-unused-vars
import * as Turbo from "@hotwired/turbo";

// Stimulus
import { Application } from "stimulus";
import PortalController from "../controllers/portal_controller";
import SidebarController from "../controllers/sidebar_controller";
import DarkmodeController from "../controllers/darkmode_controller";
import LocaleController from "../controllers/locale_controller";
import ToastsController from "../controllers/toasts_controller";

const application = Application.start();

application.register("darkmode", DarkmodeController);
application.register("portal", PortalController);
application.register("sidebar", SidebarController);
application.register("locale", LocaleController);
application.register("toasts", ToastsController);

// Initialize workbox
window.addEventListener('DOMContentLoaded', initWorkbox);

/* CSS */
import '../../stylesheets/custom.scss';
