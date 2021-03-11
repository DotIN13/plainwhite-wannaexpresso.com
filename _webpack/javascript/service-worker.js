import { registerRoute, NavigationRoute } from 'workbox-routing';
import * as navigationPreload from 'workbox-navigation-preload';
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
// Used for filtering matches based on status code, header, or both
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
// Used to limit entries in cache, remove entries after a certain period of time
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute } from 'workbox-precaching';
import { googleFontsCache } from 'workbox-recipes';

import placeholderImage from "/assets/img/placeholder.jpeg?sizes[]=1020&format=webp&publicPath=assets/public/img"

navigationPreload.enable();

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

// Add offline fallback cache when installing
const FALLBACK_CACHE_NAME = 'offline-fallbacks';
// This assumes /offline.html is a URL for your self-contained
// (no external images or styles) offline page.
// Notice that path like "/404" cannot be properly used as fallback
const FALLBACK_HTML_URL = '/offline.html';
// Build fallback asset array
// let offlineCaches = placeholderImage.images.map((img) => `${img.path}`)
// offlineCaches.push(FALLBACK_HTML_URL)

// Populate the cache with the offline HTML page when the
// service worker is installed.
self.addEventListener('install', async (event) => {
    event.waitUntil(
        caches.open(FALLBACK_CACHE_NAME)
        .then((cache) => cache.addAll([FALLBACK_HTML_URL, placeholderImage.src]))
    );
});


// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
googleFontsCache();

/*
 *********************************************************
 ****************** Navigation Handling ******************
 *********************************************************
 */

const navNetworkfirstHandler = new NetworkFirst({
    cacheName: 'cached-navigations',
})

const navigationHandler = async (params) => {
    try {
        // Attempt a network request.
        return await navNetworkfirstHandler.handle(params);
    }
    catch (error) {
        // If it fails, return the cached HTML.
        return caches.match(FALLBACK_HTML_URL, {
            cacheName: FALLBACK_CACHE_NAME,
        });
    }
};

// Cache page navigations (html) with a Network First strategy
registerRoute(
    new NavigationRoute(navigationHandler)
);

/*
 *********************************************************
 ******************** JS/CSS Handling ********************
 *********************************************************
 */

// Use a Stale While Revalidate caching strategy
let staleWhileRevalidate =
    new StaleWhileRevalidate({
        // Put all cached files in a cache named 'assets'
        cacheName: 'assets',
        plugins: [
            // Ensure that only requests that result in a 200 status are cached
            new CacheableResponsePlugin({
                statuses: [200],
            }),
        ],
    })

// Cache CSS, JS, and Web Worker requests with a Stale While Revalidate strategy
registerRoute(
    // Check to see if the request's destination is style for stylesheets, script for JavaScript, or worker for web worker
    ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker',
    staleWhileRevalidate
);

// Cache json with a Stale While Revalidate strategy
registerRoute(
    new RegExp('/.*\\.json'), staleWhileRevalidate
)

/*
 *********************************************************
 ******************** Image Handling *********************
 *********************************************************
 */

// Cache images with a Cache First strategy
let imageCachefirstHandler = new CacheFirst({
    // Put all cached files in a cache named 'images'
    cacheName: 'images',
    plugins: [
        // Ensure that only requests that result in a 200 status are cached
        new CacheableResponsePlugin({
            statuses: [200],
        }),
        // Don't cache more than 50 items, and expire them after 30 days
        new ExpirationPlugin({
            maxEntries: 36,
            // maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
        }),
    ],
})

// Use fallback handler to handle failed Cachefirst requests
const imageFallbackHandler = (params) => {
    // Attempt a cache -> network request.
    return imageCachefirstHandler.handle(params)
        // If no network or cache response, respond with placeholder image
        .catch(() => {
            return caches.match(placeholderImage.src, {
                cacheName: FALLBACK_CACHE_NAME,
            })
        })
}

registerRoute(
    // Check to see if the request's destination is style for an image
    ({ request }) => request.destination === 'image',
    // Use a Cache First caching strategy
    imageFallbackHandler,
)