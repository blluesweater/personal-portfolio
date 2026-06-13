(function () {
  "use strict";

  /* ---- Theme (light default, persisted) ---------------- */
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem("aa-theme"); } catch (e) {}
  root.setAttribute("data-theme", (saved === "dark" || saved === "light") ? saved : "light");

  var toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("aa-theme", next); } catch (e) {}
    });
  }

  /* ---- Navbar scrolled state + back-to-top ------------- */
  var nav  = document.getElementById("nav");
  var toTop = document.getElementById("toTop");
  function onScroll() {
    if (nav)   nav.classList.toggle("scrolled", window.scrollY > 24);
    if (toTop) toTop.classList.toggle("show",    window.scrollY > 520);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile menu ------------------------------------- */
  var burger = document.getElementById("burger");
  var links  = document.getElementById("navLinks");
  if (burger && links) {
    burger.addEventListener("click", function () { links.classList.toggle("open"); });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { links.classList.remove("open"); });
    });
  }

  /* ---- Back to top ------------------------------------- */
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---- Scroll reveal ----------------------------------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in-view"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---- Active nav link via section observer ------------ */
  var navLinkMap = {};
  document.querySelectorAll(".nav-links a[href^='#']").forEach(function (a) {
    navLinkMap[a.getAttribute("href").slice(1)] = a;
  });
  var sections = document.querySelectorAll("section[id]");
  if ("IntersectionObserver" in window && sections.length) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          Object.keys(navLinkMap).forEach(function (k) { navLinkMap[k].classList.remove("active"); });
          var link = navLinkMap[en.target.id];
          if (link) link.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { so.observe(s); });
  }

  /* ---- Contact form (Formspree) ------------------------ */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      btn.textContent = "Sending…";
      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (res) {
        if (res.ok) {
          form.style.display = "none";
          var ok = document.getElementById("formSuccess");
          if (ok) ok.classList.add("show");
        } else {
          btn.disabled = false;
          btn.textContent = "Send message";
          alert("Something went wrong — please try again.");
        }
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = "Send message";
        alert("Network error — please try again.");
      });
    });
  }

  /* ---- Footer year ------------------------------------- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
