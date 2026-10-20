import { existsSync, readFileSync } from "node:fs";

const copyFiles = [
  "index.html",
  "404.html",
  "README.md",
  "ARCHITECTURE.md",
  "styles.css",
  "robots.txt",
  "_headers",
  "wrangler.jsonc",
  "team.js",
  "contact.js",
  "site.js",
  "worker.js",
  "data/team.json",
  "sitemap.xml",
];

const dash = /[\u2013\u2014]|&mdash;|&ndash;|&#8211;|&#8212;|&#x2013;|&#x2014;/i;

function fail(message) {
  console.error(message);
  process.exit(1);
}

for (const file of copyFiles) {
  if (!existsSync(file)) fail(`Missing ${file}`);
  const text = readFileSync(file, "utf8");
  if (dash.test(text)) fail(`${file} contains an en dash or em dash`);
}

const html = readFileSync("index.html", "utf8");
const missing = readFileSync("404.html", "utf8");
const wrangler = readFileSync("wrangler.jsonc", "utf8");
const worker = readFileSync("worker.js", "utf8");
const renderer = readFileSync("team.js", "utf8");
const visible = `${html}\n${missing}`;

if (!/<form\b[^>]*action="\/api\/contact"/i.test(html)) fail("Home page needs the contact form");
if (/<form\b/i.test(missing)) fail("404 page must not include a form");
if (!html.includes('id="contact-dialog"')) fail("Contact buttons need a form dialog");
if (!html.includes("data-open-contact")) fail("Contact buttons must open the form");
if (html.includes("look-back") && html.includes("<img")) {
  const look = html.slice(html.indexOf("A Look Back at What We Built"), html.indexOf('id="projects"'));
  if (/<img\b/i.test(look)) fail("Look back section must not include an image");
}
if (existsSync("images/look-back.png")) fail("Do not include the look-back collage");
if (html.includes("whatshappening") || missing.includes("whatshappening")) fail("Old brand host is still in the page");
if (/What's Happening/i.test(visible)) fail("Old brand name is still in the page");
if (/Protect\s*30A/i.test(visible)) fail("Reference screenshot content is on the page");
if (/\/dash/.test(html) || /\/dash/.test(worker) || /\/dash/.test(wrangler)) fail("Do not include the team dashboard");

const projectsStart = html.indexOf('id="projects"');
const projectsEnd = html.indexOf('id="team"');
if (projectsStart === -1 || projectsEnd === -1 || projectsEnd < projectsStart) fail("Missing projects section");
const projectsHtml = html.slice(projectsStart, projectsEnd);
const projects = [
  ["Eating on 30A", "https://eatingon30a.com/", "/images/eating-on-30a.png"],
  ["Eating in Destin", "https://eatingindestin.com/", "/images/eating-in-destin.png"],
  ["Walton Dune Lakes", "https://waltondunelakes.com/", "/images/walton-dune-lakes.png"],
  ["Where is Your Beach", "https://whereisyourbeach.com/", "/images/where-is-your-beach.png"],
  ["Friends of Scenic 30A", "https://friendsofscenic30a.org/", "/images/friends-of-scenic-30a.png"],
  ["South Walton Connect", "https://southwaltonconnect.com/", "/images/south-walton-connect.png"],
  ["Walton Power Lines", "https://waltonpowerlines.com/", "/images/walton-power-lines.png"],
];
const projectLinks = [...projectsHtml.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)].map((match) => match[0]);
if (projectLinks.length !== projects.length) fail("Current Projects should list the seven linked projects");
projects.forEach(([name, href, src], index) => {
  const link = projectLinks[index];
  if (!link.includes(`href="${href}"`)) fail(`${href} should be project row ${index + 1}`);
  if (!/target="_blank"/i.test(link)) fail(`${href} must open in a new tab`);
  if (!/rel="noopener noreferrer"/i.test(link)) fail(`${href} must set rel="noopener noreferrer"`);
  if (!link.includes(`>${name}<`)) fail(`Project row ${index + 1} should spell ${name}`);
  if (!link.includes(`src="${src}"`)) fail(`Project row ${index + 1} should use ${src}`);
});
const projectItems = [...projectsHtml.matchAll(/<li\b[^>]*>[\s\S]*?<\/li>/gi)].map((match) => match[0]);
if (projectItems.length !== 10) fail("Current Projects should list ten cards");
const confidentialItems = projectItems.filter((item) => item.includes('src="/images/confidential-project.png"'));
if (confidentialItems.length !== 3) fail("Current Projects should include three confidential cards");
for (const item of confidentialItems) {
  if (/<a\b|href=/i.test(item)) fail("Confidential cards must not link to a site");
  if (!item.includes(">Early-stage work under NDA<")) fail("Confidential cards should say Early-stage work under NDA");
}

for (const id of ["work", "projects", "team", "team-list", "contact", "background"]) {
  if (!html.includes(`id="${id}"`)) fail(`Missing #${id}`);
}
if (!/<h1\b/i.test(html)) fail("Missing h1");
if (!html.includes('src="/team.js"')) fail("Home page must load team.js");
if (!renderer.includes('fetch("/data/team.json")')) fail("team.js must read data/team.json");
if (!html.includes("A Look Back at What We Built")) fail("Missing look-back heading");
if (!html.includes("Over the years, we've created magazines, apartment guides, maps, coupon publications, mobile advertising programs, and branded promotional products for businesses and organizations across a wide range of markets.")) {
  fail("Look-back text changed");
}
if (!html.includes("<h2 id=\"team-title\">Meet the Team</h2>")) fail("Team heading must be Meet the Team");
if (!html.includes(">Contact Us</a>")) fail("A contact control must say Contact Us");
if (!html.includes("Software • Technology • Innovation")) fail("Missing brand tagline");
if (!html.includes("Software, technology, and digital products.")) fail("Missing hero line");
if (html.includes('id="contact-title"') || html.includes('class="contact-band"')) fail("Do not show a Contact Us section at the bottom");
if (!html.includes('<footer id="contact"')) fail("Footer keeps the contact target");
if (!html.includes("What We Do")) fail("Missing What We Do");
if (!html.includes("Built on decades of experience")) fail("Missing background heading");
if (!html.includes("Our work includes:")) fail("Missing What We Build intro");

const people = JSON.parse(readFileSync("data/team.json", "utf8"));
if (!Array.isArray(people) || people.length !== 10) fail("data/team.json must list the team");
for (const person of people) {
  for (const field of ["name", "title", "bio", "photo"]) {
    if (!person || typeof person[field] !== "string" || !person[field].trim()) fail(`Each person needs a ${field}`);
  }
  if (html.includes(person.name)) fail(`${person.name} is hard-coded in the page HTML`);
  if (renderer.includes(person.name)) fail(`${person.name} is hard-coded in team.js`);
  const photo = person.photo.replace(/^\/+/, "");
  if (photo.includes("..") || !photo.startsWith("photos/")) fail(`Photo path must stay in photos/: ${person.photo}`);
  if (!existsSync(photo)) fail(`Missing ${photo}`);
}

if (!worker.includes("env.RESEND_API_KEY")) fail("Worker must read RESEND_API_KEY");
if (!worker.includes("env.CONTACT_EMAIL")) fail("Worker must read CONTACT_EMAIL");
if (!worker.includes("Your message could not be sent.")) fail("Missing not-sent message");
if (!worker.includes("onboarding@resend.dev")) fail("Sender must stay on the Resend onboarding address");
const emails = worker.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
if (emails.some((address) => address.toLowerCase() !== "onboarding@resend.dev")) {
  fail(`Worker has an unexpected email address: ${emails.join(", ")}`);
}
if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(visible)) fail("Do not show an email address on the page");
if (/\b\d{3}[-.)\s]\d{3}[-.\s]\d{4}\b/.test(visible)) fail("Unexpected phone number");

const banned = ["marc", "douglass", "gainesville", "testimonial", "headquarters", "since 19", "since 20"];
const lowered = visible.toLowerCase();
for (const word of banned) {
  if (lowered.includes(word)) fail(`Unexpected claim or contact detail: ${word}`);
}

if (!/"name": "studio2911"/.test(wrangler)) fail("Worker name must be studio2911");
if (!/"previews"\s*:\s*\{\s*\}/.test(wrangler)) fail("wrangler.jsonc must include an empty previews object");
if (/"pattern"\s*:/.test(wrangler) || /custom_domain/i.test(wrangler) || /"routes"\s*:/.test(wrangler)) {
  fail("Do not configure a custom domain in wrangler.jsonc");
}
if (!wrangler.includes('"observability"')) fail("Enable Workers observability");
if (!wrangler.includes('"traces"')) fail("Enable Workers traces");
if (!html.includes('<link rel="canonical" href="https://2911studio.com/">')) fail("Home page needs the public canonical URL");
if (!html.includes("<title>2911 Studio | 2911studio.com</title>")) fail("Home title must use the public site name");
if (!missing.includes("<title>Page not found | 2911studio.com</title>")) fail("404 title must use the public site name");
const sitemap = readFileSync("sitemap.xml", "utf8");
if (!sitemap.includes("<loc>https://2911studio.com/</loc>")) fail("Sitemap loc");
if (!readFileSync("robots.txt", "utf8").includes("Sitemap: https://2911studio.com/sitemap.xml")) fail("robots.txt sitemap");
if (!missing.includes('href="/"')) fail("404 page needs a link home");

for (const icon of [
  "favicon.png",
  "favicon.svg",
  "apple-touch-icon.png",
  "fonts/montserrat-latin-700-normal.woff2",
  "fonts/source-sans-3-latin-400-normal.woff2",
  "images/eating-on-30a.png",
  "images/eating-in-destin.png",
  "images/walton-dune-lakes.png",
  "images/where-is-your-beach.png",
  "images/friends-of-scenic-30a.png",
  "images/south-walton-connect.png",
  "images/walton-power-lines.png",
  "images/confidential-project.png",
  "images/logo-header.png",
  "images/logo-header.webp",
  "images/logo-hero.png",
  "images/logo-hero.webp",
  "images/logo-footer.png",
  "images/logo-footer.webp",
]) {
  if (!existsSync(icon)) fail(`Missing ${icon}`);
}

console.log("Site check passed.");
