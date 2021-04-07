import Zooming from 'zooming';
import { Controller } from "stimulus";

export default class extends Controller {

  connect() {
    const zoom = new Zooming({
      onBeforeOpen() {
        if (document.body.dataset.dark === "true") zoom.config({ bgColor: "#222" });
        if (document.body.dataset.dark === "false") zoom.config({ bgColor: "#eee" });
      }
    });
    zoom.listen(".zoomable");
  }
}
