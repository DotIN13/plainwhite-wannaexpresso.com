import { Application } from "@hotwired/stimulus";
import ZoomingController from "../controllers/zooming_controller";
import ValineController from "../controllers/valine_controller";

const application = Application.start();

application.register("zooming", ZoomingController);
application.register("valine", ValineController);