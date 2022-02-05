import { Application } from "@hotwired/stimulus";
import MoodController from "../controllers/mood_controller";
import SearchController from "../controllers/search_controller";
import PopupController from "../controllers/popup_controller";

const application = Application.start();

// Initialize moods controller
application.register("mood", MoodController);
application.register("search", SearchController);
application.register("popup", PopupController);