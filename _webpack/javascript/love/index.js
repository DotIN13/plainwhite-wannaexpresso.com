import { Application } from "@hotwired/stimulus";
import IncubatorController from "../controllers/incubator_controller";

const application = Application.start();

// Initialize moods controller
application.register("incubator", IncubatorController);