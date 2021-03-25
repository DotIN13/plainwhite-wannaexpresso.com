import { ZoomableImage, importAll } from '../responsive-img';
import { h, render } from 'preact';

const imagesAvif = importAll(require.context('/assets/img/in-post?format=avif', true, /\.(jpe?g|png|webp|webp)$/i));
const imagesWebp = importAll(require.context('/assets/img/in-post?format=webp', true, /\.(jpe?g|png|webp|webp)$/i));

window.addEventListener('DOMContentLoaded', () => {
  const imageSizes = "(max-width: 600px) 80vw, (max-width: 1024px) 60vw, (max-width: 1600px) 800px, 100vw";
  document.querySelectorAll('.post div[data-responsive="true"]').forEach((el, index) => {
    console.log(el.dataset);
    render(<ZoomableImage
      avif={imagesAvif[el.dataset.path]}
      webp={imagesWebp[el.dataset.path]}
      lazy={index > 0}
      sizes={imageSizes}
    />, el);
  });
});