/* Modules */
import { responsiveGenerator } from '../responsive-img';
import avatarAvif from '/assets/img/orange.webp?sizes[]=105,sizes[]=150,sizes[]=240&format=avif';
import avatarWebp from '/assets/img/orange.webp?sizes[]=105,sizes[]=150,sizes[]=240&format=webp';
const avatarSizes = "(max-width: 600px) 105px, (max-width: 1024px) 150px, (max-width: 1600px) 240px, 240px";
import { bindHeartActions, fetchLikes } from '../likes';
import MicroModal from 'micromodal';

window.addEventListener('DOMContentLoaded', () => {
  // Render avatar image
  responsiveGenerator(document.getElementById('avatar'), [avatarAvif, avatarWebp], avatarSizes, false, {
    width: 150,
    height: 150
  });

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
import '@fancyapps/fancybox/dist/jquery.fancybox.css';
