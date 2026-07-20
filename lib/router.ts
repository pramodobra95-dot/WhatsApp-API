/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Standard browser-based navigation helper using HTML5 history API.
 * Pushes path states and dispatches native popstate events so all reactive
 * subscribers (like custom App and LandingPage routers) refresh instantly.
 */
export function navigateTo(path: string) {
  if (typeof window !== "undefined") {
    window.history.pushState(null, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
}
