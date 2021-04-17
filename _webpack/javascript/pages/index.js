import { Application } from "stimulus";
import MoodsController from "../controllers/moods_controller";
import SearchController from "../controllers/search_controller";

const application = Application.start();

// Initialize moods controller
application.register("moods", MoodsController);
application.register("search", SearchController);