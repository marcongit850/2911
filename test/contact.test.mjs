import assert from "node:assert/strict";
import test from "node:test";
import worker, { handleContact } from "../worker.js";

function post(body, headers = {}) {
  return new Request("https://2911studio.com/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      "cf-connecting-ip": headers["cf-connecting-ip"] || "203.0.113.10",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

const message = {
  name: "Ada",
  email: "ada@example.com",
  message: "Hello from the form.",
};

test("missing CONTACT_EMAIL does not pretend the message was sent", async () => {
  let called = false;
  const response = await handleContact(
    post(message, { "cf-connecting-ip": "203.0.113.11" }),
    { RESEND_API_KEY: "re_test" },
    async () => {
      called = true;
      return new Response(JSON.stringify({ id: "email_1" }), { status: 200 });
    },
  );
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.ok, false);
  assert.equal(body.sent, false);
  assert.equal(body.error, "Your message could not be sent.");
  assert.equal(called, false);
});

test("missing RESEND_API_KEY does not pretend the message was sent", async () => {
  const response = await handleContact(
    post(message, { "cf-connecting-ip": "203.0.113.12" }),
    { CONTACT_EMAIL: "inbox@example.com" },
    async () => {
      throw new Error("should not send");
    },
  );
  const body = await response.json();
  assert.equal(body.ok, false);
  assert.equal(body.sent, false);
  assert.equal(body.error, "Your message could not be sent.");
});

test("a delivered Resend message is reported as sent", async () => {
  let payload;
  const response = await handleContact(
    post(message, { "cf-connecting-ip": "203.0.113.13" }),
    { CONTACT_EMAIL: "inbox@example.com", RESEND_API_KEY: "re_test" },
    async (_url, options) => {
      payload = JSON.parse(options.body);
      assert.equal(options.headers.authorization, "Bearer re_test");
      return new Response(JSON.stringify({ id: "email_1" }), { status: 200 });
    },
  );
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.sent, true);
  assert.deepEqual(payload.to, ["inbox@example.com"]);
  assert.equal(payload.reply_to, "ada@example.com");
  assert.equal(payload.from.includes("onboarding@resend.dev"), true);
  assert.equal(payload.from.includes("2911 Studio"), true);
  assert.equal(payload.subject, "2911 Studio contact from Ada");
});

test("a Resend rejection is not reported as sent", async () => {
  const response = await handleContact(
    post(message, { "cf-connecting-ip": "203.0.113.14" }),
    { CONTACT_EMAIL: "inbox@example.com", RESEND_API_KEY: "re_test" },
    async () => new Response(JSON.stringify({ name: "validation_error" }), { status: 422 }),
  );
  const body = await response.json();
  assert.equal(body.ok, false);
  assert.equal(body.sent, false);
  assert.equal(body.error, "Your message could not be sent.");
});

test("a filled honeypot is not sent", async () => {
  let called = false;
  const response = await handleContact(
    post({ ...message, website: "https://example.com" }, { "cf-connecting-ip": "203.0.113.15" }),
    { CONTACT_EMAIL: "inbox@example.com", RESEND_API_KEY: "re_test" },
    async () => {
      called = true;
      return new Response(JSON.stringify({ id: "email_1" }), { status: 200 });
    },
  );
  const body = await response.json();
  assert.equal(response.status, 400);
  assert.equal(body.sent, undefined);
  assert.equal(called, false);
});

test("/dash is not a route on this Worker", async () => {
  const response = await worker.fetch(new Request("https://2911studio.com/dash"), {});
  assert.equal(response.status, 404);
  const nested = await worker.fetch(new Request("https://2911studio.com/dash/team"), {});
  assert.equal(nested.status, 404);
});
