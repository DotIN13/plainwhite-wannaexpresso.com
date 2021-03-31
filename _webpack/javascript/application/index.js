/* Modules */
import { h, render } from 'preact';
import avatarAvif from '/assets/img/orange.webp?sizes[]=105,sizes[]=150,sizes[]=240&format=avif';
import avatarWebp from '/assets/img/orange.webp?sizes[]=105,sizes[]=150,sizes[]=240&format=webp';
import { Picture } from '../responsive-img';
import { bindHeartActions, fetchLikes } from '../likes';
import initWorkbox from './workbox-utilities';

const avatarSizes = "(max-width: 600px) 105px, (max-width: 1024px) 150px, (max-width: 1600px) 240px, 240px";

// Darkmode
import {updateDark, bindDarkToggle} from "./darkmode";
updateDark();

// Stimulus
import { Application } from "stimulus";
import PortalController from "../controllers/portal_controller";
const application = Application.start();

application.register("portal", PortalController);

// Window onLoad
window.addEventListener('DOMContentLoaded', () => {
  // Workbox
  initWorkbox();

  // Render avatar image
  render(<Picture
    avif={avatarAvif}
    webp={avatarWebp}
    lazy={false}
    sizes={avatarSizes}
  />, document.getElementById("avatar"));

  // Darkmode
  bindDarkToggle();

  // Heart-shaped like button animations
  bindHeartActions();
  fetchLikes();
});

/* CSS */
import '../../stylesheets/custom.scss';
