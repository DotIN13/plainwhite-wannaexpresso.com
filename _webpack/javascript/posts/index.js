import { Application } from "@hotwired/stimulus";
import ZoomingController from "../controllers/zooming_controller";
import ValineController from "../controllers/valine_controller";

const application = Application.start();

application.register("zooming", ZoomingController);
application.register("valine", ValineController);

const shareButtons = document.querySelectorAll(".share .share-button");

if (navigator.canShare) {
  shareButtons.forEach((el) => {
    el.classList.add("can-share");
    el.addEventListener(
      "click",
      () => {
        try {
          navigator.share({
            title: el.dataset.shareTitle,
            url: el.dataset.shareUrl,
          });
        } catch (err) {
          console.log(err);
        }
      },
      false
    );
  });
}
