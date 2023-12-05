/* eslint-disable no-restricted-globals */
import {clientsClaim} from "workbox-core";
import {ExpirationPlugin} from "workbox-expiration";
import {precacheAndRoute, createHandlerBoundToURL} from "workbox-precaching";
import {registerRoute} from "workbox-routing";
import {StaleWhileRevalidate} from "workbox-strategies";

clientsClaim();

// Puedes desactivar el precaching reemplazand esta línea
precacheAndRoute(self.__WB_MANIFEST);
// por esta otra:
// const desactivarPrecache = self.__WB_MANIFEST;
// para más info: https://cra.link/PWA

const fileExtensionRegexp = new RegExp("/[^/?]+\\.[^/]+$");
registerRoute(
  // Return false to exempt requests from being fulfilled by index.html.
  ({request, url}) => {
    // If this isn't a navigation, skip.
    if (request.mode !== "navigate") {
      return false;
    } // If this is a URL that starts with /\_, skip.
    if (url.pathname.startsWith("/_")) {
      return false;
    }
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    } 
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + "/index.html")
);

registerRoute(

  ({url}) =>
    url.origin === self.location.origin && url.pathname.endsWith(".png"), 
  new StaleWhileRevalidate({
    cacheName: "images",
    plugins: [
      new ExpirationPlugin({maxEntries: 50}),
    ],
  })
);
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});