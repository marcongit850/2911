const form = document.querySelector("#contact-form");
const status = document.querySelector("#contact-status");

if (form && status) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button[type=submit]");
    status.className = "form-status";
    status.textContent = "Sending.";
    if (button) button.disabled = true;
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(data),
      });
      const body = await response.json().catch(() => null);
      if (response.ok && body && body.ok === true && body.sent === true) {
        status.classList.add("is-ok");
        status.textContent = "Your message was sent.";
        form.reset();
        return;
      }
      status.classList.add("is-error");
      status.textContent = (body && body.error) || "Your message could not be sent.";
    } catch {
      status.classList.add("is-error");
      status.textContent = "Your message could not be sent.";
    } finally {
      if (button) button.disabled = false;
    }
  });
}
