/* Bilingual toggle
   Strategy: JS directly sets display on every .zh/.en element.
   CSS provides the default (.en { display:none }) as a fallback only.
   This runs on DOMContentLoaded so all elements exist before we touch them. */
(function () {
  var KEY = "metatest-lang";
  var root = document.documentElement;

  function applyDisplay(lang) {
    var isEN = lang === "en";
    var zhEls = document.querySelectorAll(".zh");
    var enEls = document.querySelectorAll(".en");
    for (var i = 0; i < zhEls.length; i++) {
      zhEls[i].style.display = isEN ? "none" : "";
    }
    for (var i = 0; i < enEls.length; i++) {
      enEls[i].style.display = isEN ? "" : "none";
    }
  }

  function apply(lang) {
    if (lang !== "en") lang = "zh";
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang === "en" ? "en" : "zh-CN");
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    applyDisplay(lang);
    var buttons = document.querySelectorAll("[data-setlang]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute(
        "aria-pressed",
        buttons[i].getAttribute("data-setlang") === lang ? "true" : "false"
      );
    }
  }

  var saved = "zh";
  try { saved = localStorage.getItem(KEY) || "zh"; } catch (e) {}

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { apply(saved); });
  } else {
    apply(saved);
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest("[data-setlang]") : null;
    if (btn) {
      e.preventDefault();
      apply(btn.getAttribute("data-setlang"));
    }
  });
})();
