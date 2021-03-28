let checkDarkDone;

function toggleDarkMode() {
  const DARK_CLASS = 'dark';

  const body = document.querySelector("body");
  if (body.classList.contains(DARK_CLASS)) {
    setCookie('theme', 'light');
    body.classList.remove(DARK_CLASS);
    body.dataset.dark = false;
    document.querySelectorAll('.dark-mode-toggle').forEach(ti => ti.checked = false);
  }
  else {
    setCookie('theme', 'dark');
    body.classList.add(DARK_CLASS);
    body.dataset.dark = true;
    document.querySelectorAll('.dark-mode-toggle').forEach(ti => ti.checked = true);
  }
}

function getCookie(name) {
  const v = document.cookie.match(`(^|;) ?${name}=([^;]*)(;|$)`);
  return v ? v[2] : null;
}

function setCookie(name, value, days) {
  let d = new Date;
  d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
  document.cookie = `${name}=${value};path=/;SameSite=strict;expires=${d.toGMTString()}`;
}

// function deleteCookie(name) {
//   setCookie(name, '', -1);
// }

function checkDark() {
  if (!checkDarkDone) toggleDarkMode();
  checkDarkDone = true;
}

function checkSwitch() {
  document.querySelectorAll('.dark-mode-toggle').forEach(ti => ti.checked = true);
}

export function updateDark() {
  const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = getCookie('theme');
  if ((theme === null && userPrefersDark) || theme === 'dark') {
    checkDarkDone = false;

    // Attempt both requestAnimationFrame and DOMContentLoaded, whichever comes first.
    if (window.requestAnimationFrame) window.requestAnimationFrame(checkDark);
    window.addEventListener('DOMContentLoaded', checkDark);
    window.addEventListener('DOMContentLoaded', checkSwitch);
  }
}

export function bindDarkToggle() {
  document.querySelectorAll('.dark-mode-toggle+a.button').forEach((el) => el.addEventListener('click', toggleDarkMode));
}