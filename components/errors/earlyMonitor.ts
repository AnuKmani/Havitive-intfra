/**
 * Runs before React and every other script on admin pages ("black box" recorder).
 * Reports failed files, early errors and pages that end up blank to /api/client-error,
 * so problems on a visitor's computer can be diagnosed from the Vercel logs.
 */
export const EARLY_MONITOR = `(function(){
  var sent = 0;
  function send(o){
    if (sent++ > 8) return;
    try {
      o.url = location.href;
      var b = new Blob([JSON.stringify(o)], { type: "application/json" });
      if (!(navigator.sendBeacon && navigator.sendBeacon("/api/client-error", b))) fetch("/api/client-error", { method: "POST", body: JSON.stringify(o), keepalive: true });
    } catch (e) {}
  }
  window.addEventListener("error", function (e) {
    var t = e.target;
    if (t && t !== window && (t.src || t.href)) {
      // Missing photos are expected (old site images); only scripts and styles matter here.
      if (t.tagName !== "IMG") send({ message: "file failed to load: " + (t.src || t.href) });
    }
    else send({ message: "early error: " + (e.message || ""), stack: e.error && e.error.stack });
  }, true);
  window.addEventListener("unhandledrejection", function (e) {
    var r = e.reason || {};
    send({ message: "early promise error: " + (r.message || String(r)), stack: r.stack });
  });
  function check(when){
    var body = document.body;
    var text = body ? (body.innerText || "").trim().length : 0;
    var visible = body ? body.getBoundingClientRect().height : 0;
    if (text < 20) send({
      message: "BLANK PAGE " + when + ": text " + text + ", height " + Math.round(visible) + ", screen " + innerWidth + "x" + innerHeight,
      stack: (document.documentElement.outerHTML || "").replace(/<script[\\s\\S]*?<\\/script>/g, "").slice(0, 1400)
    });
  }
  setTimeout(function(){ check("after 4s"); }, 4000);
  setTimeout(function(){ check("after 12s"); }, 12000);
})();`;
