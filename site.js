document.documentElement.classList.remove("no-js");

const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");

function closeNav() {
  if (!toggle || !nav) return;
  nav.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.textContent = "Menu";
}

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.textContent = open ? "Close" : "Menu";
  });
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeNav());
  });
}

const dialog = document.querySelector("#contact-dialog");

function openContact(event) {
  if (!dialog || typeof dialog.showModal !== "function") return;
  if (event) event.preventDefault();
  if (!dialog.open) dialog.showModal();
  const name = dialog.querySelector("input[name='name']");
  if (name) name.focus();
  closeNav();
}

document.querySelectorAll("[data-open-contact]").forEach((el) => {
  el.addEventListener("click", openContact);
});

if (dialog) {
  if (location.hash === "#contact") openContact();
  window.addEventListener("hashchange", () => {
    if (location.hash === "#contact") openContact();
  });
  dialog.querySelectorAll("[data-close-contact]").forEach((el) => {
    el.addEventListener("click", () => dialog.close());
  });
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inside) dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (location.hash === "#contact") history.replaceState(null, "", location.pathname + location.search);
  });
}
