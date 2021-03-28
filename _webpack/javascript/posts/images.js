import { h, render } from 'preact';
import { Picture, importAll } from '../responsive-img';
import Zooming from 'zooming';

const imagesAvif = importAll(require.context('/assets/img/in-post?format=avif', true, /\.(jpe?g|png|webp|webp)$/i));
const imagesWebp = importAll(require.context('/assets/img/in-post?format=webp', true, /\.(jpe?g|png|webp|webp)$/i));
const imageSizes = "(max-width: 600px) 80vw, (max-width: 1024px) 60vw, (max-width: 1600px) 800px, 100vw";

window.addEventListener('DOMContentLoaded', () => {
  
  document.querySelectorAll('.post div[data-responsive="true"]').forEach((el, index) => {
    // console.log(el.dataset);
    render(<Picture
      avif={imagesAvif[el.dataset.path]}
      webp={imagesWebp[el.dataset.path]}
      lazy={index > 0}
      sizes={imageSizes}
      class="zoomable"
    />, el);
  });

  const zoom = new Zooming({
    onBeforeOpen() {
      if (document.body.dataset.dark === "true") zoom.config({ bgColor: "#222" });
      if (document.body.dataset.dark === "false") zoom.config({ bgColor: "#eee" });
    }
  });
  zoom.listen(".zoomable");
});