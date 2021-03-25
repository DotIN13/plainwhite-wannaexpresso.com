/* Modules */
// import { responsiveGenerator } from '../responsive-img';
import avatarAvif from '/assets/img/orange.webp?sizes[]=105,sizes[]=150,sizes[]=240&format=avif';
import avatarWebp from '/assets/img/orange.webp?sizes[]=105,sizes[]=150,sizes[]=240&format=webp';
const avatarSizes = "(max-width: 600px) 105px, (max-width: 1024px) 150px, (max-width: 1600px) 240px, 240px";
import { Picture } from '../responsive-img';
import { bindHeartActions, fetchLikes } from '../likes';
import MicroModal from 'micromodal';
import { h, render } from 'preact';

window.addEventListener('DOMContentLoaded', () => {
  // Render avatar image
  render(<Picture
    avif={avatarAvif}
    webp={avatarWebp}
    lazy={false}
    sizes={avatarSizes}
  />, document.getElementById("avatar"));

  // Initialize micromodal
  MicroModal.init({
    awaitCloseAnimation: true
  });

  // Heart-shaped like button animations
  bindHeartActions();
  fetchLikes();
});

/* CSS */
import '../../stylesheets/custom.scss';
import 'react-medium-image-zoom/dist/styles.css';
