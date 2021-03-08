const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let installButton = undefined

function registerWorker() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    }
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
    installButton.classList.toggle('hidden', true);
}

function animateInstallButton() {
    localStorage.setItem("installationPrompted", "true")
    wait(500).then(() => {
            installButton.classList.add("expand")
            return wait(6000)
        })
        .then(() => {
            // Collapse button
            installButton.classList.remove("expand")
            // Make the install button hoverable
            bindButtonHovering()
        })
}

function bindButtonHovering() {
    installButton.addEventListener('mouseover', () => installButton.classList.add('expand'))
    installButton.addEventListener('mouseleave', () => installButton.classList.remove('expand'))
}

window.addEventListener("DOMContentLoaded", () => {
    installButton = document.getElementById("pwa-install")

    // Register service worker
    registerWorker()

    // PWA Install Handling
    window.addEventListener('beforeinstallprompt', (event) => {
        console.log('👍', 'beforeinstallprompt', event)
        // Stash the event so it can be triggered later.
        window.deferredPrompt = event
        installButton.addEventListener('click', installPWA, false)
        // Remove the 'hidden' class from the install button container
        installButton.classList.remove("flex-hidden")
        // Use animation to attract installation
        if (!localStorage.getItem("installationPrompted")) { animateInstallButton() }
        else {
            bindButtonHovering()
        }
    });

    // Log pageviews
    let pgview = localStorage.getItem("pageview")
    localStorage.setItem("pageview", Number(pgview) >= 0 ? Number(pgview) + 1 : 0)
})