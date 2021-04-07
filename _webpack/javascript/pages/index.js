import initSearch from "../shared/search";
import { Application } from "stimulus";
import MoodsController from "../controllers/moods_controller";
const application = Application.start();

// Initialize moods controller
application.register("moods", MoodsController);

// Initialize Search
window.addEventListener("turbo:load", initSearch);