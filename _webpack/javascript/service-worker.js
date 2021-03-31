import { registerRoute } from 'workbox-routing';
import * as navigationPreload from 'workbox-navigation-preload';
import { StaleWhileRevalidate } from 'workbox-strategies';
// Used for filtering matches based on status code, header, or both
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { precacheAndRoute } from 'workbox-precaching';
import { googleFontsCache, offlineFallback, pageCache, imageCache } from 'workbox-recipes';

import placeholderImage from "/assets/img/placeholder.jpeg?sizes[]=1020&format=webp&publicPath=assets/public/img";

navigationPreload.enable();

addEventListener('message', (event) => {
  if (event?.data.type === 'SKIP_WAITING') {
    skipWaiting();
  }
});

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
googleFontsCache();

/*
 *********************************************************
 ****************** Navigation Handling ******************
 *********************************************************
 */

pageCache({
  cacheName: 'cached-navigations'
});

/*
 *********************************************************
 ******************** Static Handling ********************
 *********************************************************
 */

// Cache json with a Stale While Revalidate strategy
registerRoute(
  new RegExp('/.*\\.json'),
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
);

/*
 *********************************************************
 ******************** Image Handling *********************
 *********************************************************
 */

imageCache();

offlineFallback({
  pageFallback: "/offline.html",
  imageFallback: placeholderImage.src
});