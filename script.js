/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Sparks + confetti ---------- */
const canvas = $("#sparks");
const ctx = canvas.getContext("2d");
const COLORS = ["#d8b46a", "#f1dba5", "#ffffff", "#7fa6e0"];
const SPARK_COUNT = 50;
let W, H, parts = [];

function resize() {
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
}
addEventListener("resize", resize);
resize();

function spark(startAnywhere = false) {
  return {
    x: Math.random() * W,
    y: startAnywhere ? Math.random() * H : H + 10,
    r: Math.random() * 2 + 0.6,
    v: Math.random() * 0.6 + 0.2,
    a: Math.random() * 0.6 + 0.2,
    confetti: false,
  };
}
for (let i = 0; i < SPARK_COUNT; i++) parts.push(spark(true));

function burst() {
  if (reduce) return;
  for (let i = 0; i < 140; i++) {
    parts.push({
      x: W / 2, y: H * 0.45,
      r: Math.random() * 4 + 2,
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -13 - 3,
      a: 1, c: COLORS[i % 4], rot: Math.random() * 6,
      confetti: true,
    });
  }
}

(function loop() {
  ctx.clearRect(0, 0, W, H);
  parts = parts.filter((p) => p.a > 0.02 && p.y < H + 20);
  if (!reduce && parts.filter((p) => !p.confetti).length < SPARK_COUNT) parts.push(spark());

  for (const p of parts) {
    if (p.confetti) {
      p.vy += 0.35; p.x += p.vx; p.y += p.vy;
      p.vx *= 0.99; p.a -= 0.007; p.rot += 0.15;
      ctx.save();
      ctx.globalAlpha = Math.max(p.a, 0);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      ctx.restore();
    } else {
      p.y -= p.v;
      p.x += Math.sin(p.y / 40) * 0.3;
      ctx.globalAlpha = p.a;
      ctx.fillStyle = "#f1dba5";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 7);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(loop);
})();

/* ---------- Word-by-word text reveal ---------- */
function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = "";
  words.forEach((word, i) => {
    const span = document.createElement("span");
    span.className = "w";
    span.textContent = word;
    span.style.transitionDelay = Math.min(i * 45, 1400) + "ms";
    el.append(span, " ");
  });
}

/* Adds "show" to an element when it scrolls into view, once */
function makeRevealObserver(options) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("show");
      obs.unobserve(e.target);
    });
  }, options);
  return obs;
}
const textObserver = makeRevealObserver({ threshold: 0.35 });
const cardObserver = makeRevealObserver({ threshold: 0, rootMargin: "0px 0px -12% 0px" });

/* ---------- Open button ---------- */
$("#open").addEventListener("click", () => {
  $(".intro-block").classList.add("gone");
  $("#hero").classList.add("opened");
  $("#content").classList.add("open");
  burst();
  $$("#letter .reveal").forEach((el) => {
    splitWords(el);
    textObserver.observe(el);
  });
  $$(".lesson").forEach((card) => cardObserver.observe(card));
  setTimeout(() => $("#letter").scrollIntoView({ behavior: "smooth" }), 500);
});

/* ---------- Countdown ---------- */
const START = new Date("2026-06-02T00:00:00"); // CHANGE: the day he became your mentor

function elapsed(from, to) {
  let y = to.getFullYear() - from.getFullYear();
  let mo = to.getMonth() - from.getMonth();
  let d = to.getDate() - from.getDate();
  let h = to.getHours() - from.getHours();
  let mi = to.getMinutes() - from.getMinutes();
  let s = to.getSeconds() - from.getSeconds();

  if (s < 0) { s += 60; mi--; }
  if (mi < 0) { mi += 60; h--; }
  if (h < 0) { h += 24; d--; }
  if (d < 0) {
    d += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    mo--;
  }
  if (mo < 0) { mo += 12; y--; }
  return { y, mo, d, h, mi, s };
}

function tick() {
  const t = elapsed(START, new Date());
  for (const key in t) $("#c-" + key).textContent = t[key];
}
tick();
setInterval(tick, 1000);

/* ---------- Lessons ---------- */
const lessons = [
  { title: "Wealth", points: [
    "Wealth is not just money.",
    "Your mindset and environment are important factors in wealth.",
    "Create multiple income sources.",
    "Be a problem solver.",
    "God gives power to get wealth (Deut 8:18).",
  ]},
  { title: "Access", points: [
    "Do not abuse the access given to you.",
    "Be respectful and diligent to whoever gives you access.",
    "Access can be bought through gifting.",
    "Access is a double-edged sword. You can get access to the wrong things, so it's up to you to discern what you want access to.",
    "Access opens doors to different things.",
  ]},
  { title: "Honor", points: [
    "Honor is a choice.",
    "Actions speak louder than words.",
    "Do not honor someone because of what you hope to get from them.",
    "Honor brings access.",
    "You cannot honor someone you don't value.",
  ]},
  { title: "Giving", points: [
    "Give cheerfully.",
    "Do not expect something in return when gifting.",
    "A gift is accepted according to what one has, not what one doesn't.",
    "Give something worthy.",
    "Give without sounding an alarm.",
    "Give what you have.",
  ]},

  { title: "Friendship", points: [
    "Friendship is a two-way street.",
    "Friendship is a voluntary relationship.",
    "Friendship should be built on mutual attraction and respect.",
    "Friendship is a choice.",
    "You can't be friends with someone who doesn't choose you.",
  ]},
  { title: "Growth", points: [
    "You have to be intentional to grow.",
    "Growth is not automatic. It takes time.",
    "A sense of urgency is needed to grow.",
    "Do not wait to be motivated before growing.",
    "Do not be afraid of making mistakes.",
    "Be consistent, especially in your daily habits.",
  ]},
    { title: "Romantic Relationships", points: [
    "Do not rush.",
    "Christ should be the basis of your relationship.",
    "A partner should be someone going in the same direction as you, not someone who becomes the direction.",
    "Do not build a relationship on feelings alone.",
    "Be intentional.",
  ]},
];

const randomPoints = (points, count) =>
  [...points].sort(() => Math.random() - 0.5).slice(0, count);

const modal = $("#modal");

function openLesson(lesson) {
  $("#m-title").textContent = lesson.title;
  const box = $("#m-points");
  box.textContent = "";
  randomPoints(lesson.points, 3).forEach((text, n) => {
    const p = document.createElement("p");
    p.className = "reveal";
    p.textContent = text;
    box.appendChild(p);
    splitWords(p);
    setTimeout(() => p.classList.add("show"), 150 + n * 700);
  });
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLesson() {
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

modal.addEventListener("click", (e) => {
  if (e.target === modal || e.target.closest(".close")) closeLesson();
});
addEventListener("keydown", (e) => { if (e.key === "Escape") closeLesson(); });

function buildLessons() {
  const list = $(".lessons-list");
  lessons.forEach((lesson, i) => {
    const card = document.createElement("div");
    card.className = "card lesson";
    card.dataset.direction = i % 2 === 0 ? "right" : "left";
    card.innerHTML = `<h2>${lesson.title}</h2><p class="hint">Tap to open</p>`;
    card.addEventListener("click", () => openLesson(lesson));
    list.appendChild(card);
  });
}
buildLessons();

/* ---------- Carousel: clone the group for a seamless loop ---------- */
const group = $(".group");
const copy = group.cloneNode(true);
copy.setAttribute("aria-hidden", "true");
group.after(copy);
