import Zooming from 'zooming';

window.addEventListener('DOMContentLoaded', () => {

  const zoom = new Zooming({
    onBeforeOpen() {
      if (document.body.dataset.dark === "true") zoom.config({ bgColor: "#222" });
      if (document.body.dataset.dark === "false") zoom.config({ bgColor: "#eee" });
    }
  });
  zoom.listen(".zoomable");
});