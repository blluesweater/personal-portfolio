(function () {
  "use strict";

  var ICONS = {
    code:   "<polyline points='16 18 22 12 16 6'/><polyline points='8 6 2 12 8 18'/>",
    server: "<rect x='2' y='2' width='20' height='8' rx='2'/><rect x='2' y='14' width='20' height='8' rx='2'/><line x1='6' y1='6' x2='6.01' y2='6'/><line x1='6' y1='18' x2='6.01' y2='18'/>",
    data:   "<ellipse cx='12' cy='5' rx='9' ry='3'/><path d='M3 5v14a9 3 0 0 0 18 0V5'/><path d='M3 12a9 3 0 0 0 18 0'/>",
    cloud:  "<path d='M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z'/>",
    shield: "<path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/>"
  };

  var SKILLS = [
    { n: "C",           c: "code"   },
    { n: "Python",      c: "code"   },
    { n: "Java",        c: "code"   },
    { n: "JavaScript",  c: "code"   },
    { n: "TypeScript",  c: "code"   },
    { n: "HTML / CSS",  c: "code"   },
    { n: "C++",         c: "code"   },
    { n: "Node.js",     c: "server" },
    { n: "Express.js",  c: "server" },
    { n: "FastAPI",     c: "server" },
    { n: "React",       c: "server" },
    { n: "Flutter",     c: "server" },
    { n: "Socket.IO",   c: "server" },
    { n: "Prisma",      c: "server" },
    { n: "PostgreSQL",  c: "data"   },
    { n: "MongoDB",     c: "data"   },
    { n: "Supabase",    c: "data"   },
    { n: "Redis",       c: "data"   },
    { n: "SQL",         c: "data"   },
    { n: "Git",         c: "cloud"  },
    { n: "Docker",      c: "cloud"  },
    { n: "Linux",       c: "cloud"  },
    { n: "Postman",     c: "cloud"  },
    { n: "Figma",       c: "cloud"  },
    { n: "REST APIs",   c: "shield" },
    { n: "JWT",         c: "shield" },
    { n: "Firebase",    c: "shield" },
    { n: "Stripe",      c: "shield" },
    { n: "MQTT",        c: "shield" },
    { n: "ESP32",       c: "shield" }
  ];

  function init() {
    var stage = document.getElementById("skillsWall");
    var inner = document.getElementById("wallInner");
    if (!stage || !inner) return;

    var COLS = 5;
    var CELL_X = 158, CELL_Y = 150;
    var rows = Math.ceil(SKILLS.length / COLS);

    var tiles = [];
    SKILLS.forEach(function (sk, i) {
      var r = Math.floor(i / COLS);
      var c = i % COLS;
      var rowShift = (r % 2 ? 1 : -1) * (CELL_X / 4);
      var bx = (c - (COLS - 1) / 2) * CELL_X + rowShift;
      var by = (r - (rows - 1) / 2) * CELL_Y;

      var el = document.createElement("div");
      el.className = "wall-tile cat-" + sk.c;
      el.innerHTML =
        "<span class='wt-ico'><svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>" +
        ICONS[sk.c] + "</svg></span><span class='wt-name'>" + sk.n + "</span>";
      inner.appendChild(el);
      tiles.push({ el: el, bx: bx, by: by });
    });

    var maxAbsX = (COLS - 1) / 2 * CELL_X + CELL_X / 4;
    var maxAbsY = (rows - 1) / 2 * CELL_Y;

    var ox = 0, oy = 0, vx = 0, vy = 0;
    var dragging = false, lastX = 0, lastY = 0, moved = 0;
    var rafId = null;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var R = 300, SMAX = 1.34, SMIN = 0.58;

    function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
    function smooth(t) { return t * t * (3 - 2 * t); }

    function render() {
      for (var i = 0; i < tiles.length; i++) {
        var t = tiles[i];
        var x = t.bx + ox, y = t.by + oy;
        var d = Math.sqrt(x * x + y * y);
        var e = smooth(clamp(1 - d / R, 0, 1));
        var s = SMIN + (SMAX - SMIN) * e;
        var op = 0.32 + 0.68 * e;
        t.el.style.transform = "translate(-50%,-50%) translate(" + x + "px," + y + "px) scale(" + s + ")";
        t.el.style.opacity = op;
        t.el.style.zIndex = (e * 100) | 0;
        t.el.classList.toggle("focus", e > 0.78);
      }
    }

    function clampOffset() {
      ox = clamp(ox, -maxAbsX, maxAbsX);
      oy = clamp(oy, -maxAbsY, maxAbsY);
    }

    function loop() {
      ox += vx; oy += vy;
      vx *= 0.92; vy *= 0.92;
      var hitX = (ox <= -maxAbsX || ox >= maxAbsX);
      var hitY = (oy <= -maxAbsY || oy >= maxAbsY);
      clampOffset();
      if (hitX) vx = 0;
      if (hitY) vy = 0;
      render();
      if (Math.abs(vx) > 0.15 || Math.abs(vy) > 0.15) {
        rafId = requestAnimationFrame(loop);
      } else { rafId = null; }
    }

    function stopLoop() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

    stage.addEventListener("pointerdown", function (e) {
      dragging = true; moved = 0;
      vx = vy = 0; stopLoop();
      lastX = e.clientX; lastY = e.clientY;
      stage.setPointerCapture(e.pointerId);
      stage.classList.add("grabbing");
    });

    stage.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      ox += dx; oy += dy;
      clampOffset();
      vx = reduce ? 0 : dx;
      vy = reduce ? 0 : dy;
      render();
      if (moved > 8) stage.classList.add("touched");
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove("grabbing");
      try { stage.releasePointerCapture(e.pointerId); } catch (err) {}
      if (!reduce && (Math.abs(vx) > 0.4 || Math.abs(vy) > 0.4)) {
        stopLoop(); rafId = requestAnimationFrame(loop);
      }
    }
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);

    tiles.forEach(function (t) {
      t.el.addEventListener("click", function () {
        if (moved > 8) return;
        var fromX = ox, fromY = oy, toX = -t.bx, toY = -t.by;
        var t0 = null, dur = reduce ? 0 : 520;
        stopLoop();
        function anim(ts) {
          if (!t0) t0 = ts;
          var p = dur ? Math.min((ts - t0) / dur, 1) : 1;
          var e2 = 1 - Math.pow(1 - p, 3);
          ox = fromX + (toX - fromX) * e2;
          oy = fromY + (toY - fromY) * e2;
          clampOffset(); render();
          if (p < 1) requestAnimationFrame(anim);
        }
        requestAnimationFrame(anim);
        stage.classList.add("touched");
      });
    });

    function applyResponsive() {
      R = stage.clientWidth < 560 ? 220 : 300;
      render();
    }
    window.addEventListener("resize", applyResponsive);

    requestAnimationFrame(function () {
      applyResponsive();
      stage.classList.add("ready");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
