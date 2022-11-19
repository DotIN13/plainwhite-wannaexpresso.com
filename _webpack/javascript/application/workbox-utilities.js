import { Workbox, messageSW } from "workbox-window";

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const wb = new Workbox("/service-worker.js");
let registration;
const prompt = {
  open() {
    const evt = new Event("bake");
    const toast = document.querySelector("#toast__page-update");
    document.addEventListener("click", this.onAccept);
    toast.dispatchEvent(evt);
  },

  onAccept: (e) => {
    if (e.target.dataset.action === "update-sw") {
    // Assuming the user accepted the update, set up a listener
    // that will reload the page as soon as the previously waiting
    // service worker has taken control.
      wb.addEventListener('controlling', () => window.location.reload());

      // Send a message to the waiting service worker,
      // instructing it to activate.  
      // Note: for this to work, you have to add a message
      // listener in your service worker. See below.
      if (registration?.waiting) messageSW(registration.waiting, { type: 'SKIP_WAITING' });
    }
  }
};

function registerWorker() {
  // `event.wasWaitingBeforeRegister` will be false if this is
  // the first time the updated service worker is waiting.
  // When `event.wasWaitingBeforeRegister` is true, a previously
  // updated service worker is still waiting.
  // You may want to customize the UI prompt accordingly.

  // Assumes your app has some sort of prompt UI element
  // that a user can either accept or reject.
  const showSkipWaitingPrompt = () => prompt.open();

  // Add an event listener to detect when the registered
  // service worker has installed but is waiting to activate.
  wb.addEventListener('waiting', showSkipWaitingPrompt);
  wb.addEventListener('externalwaiting', showSkipWaitingPrompt);

  return wb.register()
    .then((r) => {
      registration = r;
      // console.log('SW registered: ', r);
    }).catch((err) => {
      console.log('SW registration failed: ', err);
    });
}

export default function() {
  // Register service worker
  registerWorker();

  // Log pageviews
  let pgview = localStorage.getItem("pageview");
  localStorage.setItem("pageview", Number(pgview) >= 0 ? Number(pgview) + 1 : 0);
}