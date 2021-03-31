import { Workbox, messageSW } from "workbox-window";
import { h, render } from 'preact';
import toast, { Toaster } from 'react-hot-toast';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const wb = new Workbox("/service-worker.js");
let registration, installButton;
const prompt = {
  open() {
    toast.success(() => (
      <span>
        Page content updated.<a onClick={() => this.onAccept()}>RELOAD</a>
      </span>
    ), {
      duration: 6000,
      iconTheme: {
        primary: '#ff94c2',
        secondary: '#fff',
      },
    });
  },

  onAccept: () => {
    // Assuming the user accepted the update, set up a listener
    // that will reload the page as soon as the previously waiting
    // service worker has taken control.
    wb.addEventListener('controlling', () => window.location.reload());

    if (registration?.waiting) {
      // Send a message to the waiting service worker,
      // instructing it to activate.  
      // Note: for this to work, you have to add a message
      // listener in your service worker. See below.
      messageSW(registration.waiting, { type: 'SKIP_WAITING' });
    }
  },

  onReject() {
    this.dismiss();
  },

  dismiss: () => {
    toast.dismiss(this.open.id);
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
      console.log('SW registered: ', r);
    }).catch((err) => {
      console.log('SW registration failed: ', err);
    });
}

async function installPWA() {
  console.log('👍', 'butInstall-clicked');
  const promptEvent = window.deferredPrompt;
  if (!promptEvent) {
    // The deferred prompt isn't available.
    return;
  }
  // Show the install prompt.
  promptEvent.prompt();
  // Log the result
  const result = await promptEvent.userChoice;
  console.log('👍', 'userChoice', result);
  // Reset the deferred prompt variable, since
  // prompt() can only be called once.
  window.deferredPrompt = null;
  // Hide the install button.
  // installButton.classList.toggle('flex-hidden', true);
  if (result.outcome == 'dismissed') { localStorage.setItem("installationRejected", "true"); }
  else { localStorage.setItem("installed", true); }
}

function animateInstallButton() {
  localStorage.setItem("installationPrompted", "true");
  wait(500).then(() => {
    installButton.classList.add("expand");
    return wait(6000);
  })
    .then(() => {
      // Collapse button
      installButton.classList.remove("expand");
      // Make the install button hoverable
      bindButtonHovering();
    });
}

async function bindButtonHovering() {
  installButton.addEventListener('mouseover', () => installButton.classList.add('expand'));
  installButton.addEventListener('mouseleave', () => installButton.classList.remove('expand'));
}

function renderToaster() {
  const Notifications = () => {
    return <Toaster toastOptions={{ className: "hot-notifications" }} />;
  };
  render(<Notifications />, document.body);
}

export default function() {
  renderToaster();
  installButton = document.getElementById("pwa-install");

  // Register service worker
  registerWorker();

  // Hide the install button if already installed
  if (localStorage["installed"] == "true") installButton.classList.add("flex-hidden");

  // PWA Install Handling
  window.addEventListener('beforeinstallprompt', (event) => {
    console.log('👍', 'beforeinstallprompt', event);
    // Stash the event so it can be triggered later.
    window.deferredPrompt = event;
    installButton.addEventListener('click', installPWA, false);
    // Enable installButton
    installButton.classList.remove("disabled");
    // Set PWAinstalled to false
    localStorage.setItem("installed", false);
    // Use animation to attract installation
    if (!localStorage.getItem("installationPrompted")) {
      // Animate button if shown for the first time
      animateInstallButton();
    }
    else {
      bindButtonHovering();
    }
  });

  // Log pageviews
  let pgview = localStorage.getItem("pageview");
  localStorage.setItem("pageview", Number(pgview) >= 0 ? Number(pgview) + 1 : 0);
}