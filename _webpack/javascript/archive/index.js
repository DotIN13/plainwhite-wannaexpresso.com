import { Application } from "@hotwired/stimulus";
import SearchController from "../controllers/search_controller";
import ArchiveController from "../controllers/archive_controller";

const application = Application.start();

application.register("search", SearchController);
application.register("archive", ArchiveController);
