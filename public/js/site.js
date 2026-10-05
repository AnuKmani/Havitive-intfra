// Small behaviours that used to live in inline <script> tags of the Laravel views.
(function () {
  // Upcoming-project cards fill the shared #portfolioModal from their data-* attributes.
  document.addEventListener("click", function (e) {
    var card = e.target.closest && e.target.closest("[data-portfolio]");
    if (!card) return;
    var d = JSON.parse(card.getAttribute("data-portfolio"));
    var set = function (id, prop, value) {
      var el = document.getElementById(id);
      if (el) el[prop] = value || "";
    };
    set("modalImageOne", "src", d.imageOne);
    set("modalImageTwo", "src", d.imageTwo);
    set("modalHeading", "textContent", d.heading);
    set("modalDescription", "textContent", d.description);
    set("modalDescriptionTwo", "textContent", d.descriptionTwo);
    var list = document.getElementById("modalChecklist");
    if (list) {
      list.innerHTML = "";
      [["Service Category", d.category], ["Clients", d.client], ["Project Date", d.date], ["Locations", d.location]].forEach(function (row) {
        var li = document.createElement("li");
        li.className = "text-light";
        var strong = document.createElement("strong");
        strong.textContent = row[0] + ": ";
        li.appendChild(strong);
        li.appendChild(document.createTextNode(row[1] || "-"));
        list.appendChild(li);
      });
    }
  });
})();

// Show a neutral placeholder instead of a broken-image icon.
(function () {
  var fix = function (img) {
    if (img.dataset.fallback) return;
    img.dataset.fallback = "1";
    img.src = "/upload/no_image.jpg";
  };
  document.addEventListener("error", function (e) {
    if (e.target && e.target.tagName === "IMG") fix(e.target);
  }, true);
  document.querySelectorAll("img").forEach(function (img) {
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) fix(img);
  });
})();
