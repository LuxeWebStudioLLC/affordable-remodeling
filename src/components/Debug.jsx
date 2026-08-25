import { useEffect, useState } from "react";

/**
 * On-screen diagnostic panel, mounted ONLY with ?debug=1 in the URL.
 *
 * Exists because the Work strip kept failing on a real iPhone while every
 * local test passed. The gap is structural: a headless browser has no URL
 * bar, so svh / lvh / dvh are all identical there and the whole class of
 * dynamic-viewport bug is invisible. Rather than keep guessing, this reports
 * the numbers straight off the visitor's own device so one screenshot settles
 * what is actually wrong.
 *
 * Renders nothing on a normal visit and costs nothing — the query flag gates
 * it before any measurement runs.
 */
export default function Debug() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const read = () => {
      const probe = document.createElement("div");
      probe.style.cssText =
        "position:absolute;visibility:hidden;height:100svh;width:1px;top:0;left:0";
      document.body.appendChild(probe);
      const svh = probe.offsetHeight;
      probe.style.height = "100dvh";
      const dvh = probe.offsetHeight;
      probe.style.height = "100lvh";
      const lvh = probe.offsetHeight;
      probe.remove();

      const sec = document.querySelector("#work");
      const stage = sec?.querySelector(".work-stage");
      const rail = sec?.querySelector(".swipe-rail");
      const track = sec?.querySelector(".work-track");
      const barRow = stage?.querySelector(".container-x");

      const sr = stage?.getBoundingClientRect();
      const br = barRow?.getBoundingClientRect();
      const x = track
        ? Math.round(new DOMMatrixReadOnly(getComputedStyle(track).transform).m41)
        : null;
      const imgs = track ? [...track.querySelectorAll("img")] : [];

      /* The headline numbers: if svh/dvh/lvh differ AND the stage does not
         match innerHeight, that is the dynamic-viewport gap. */
      setRows([
        ["innerHeight", window.innerHeight],
        ["visualViewport", Math.round(window.visualViewport?.height ?? -1)],
        ["100svh / dvh / lvh", `${svh} / ${dvh} / ${lvh}`],
        ["stage height", sr ? Math.round(sr.height) : "—"],
        ["stage fills screen", sr ? (Math.round(sr.height) >= window.innerHeight - 1 ? "YES" : "NO ← GAP") : "—"],
        ["gap below stage", sr ? Math.round(window.innerHeight - sr.bottom) : "—"],
        ["stage top (pinned=0)", sr ? Math.round(sr.top) : "—"],
        ["bar gap from bottom", br ? Math.round(window.innerHeight - br.bottom) : "—"],
        ["--pan", getComputedStyle(sec || document.body).getPropertyValue("--pan").trim() || "unset"],
        ["track x", x],
        ["section height", sec ? Math.round(sec.offsetHeight) : "—"],
        ["rail height", rail ? Math.round(rail.getBoundingClientRect().height) : "—"],
        ["images loaded", `${imgs.filter((i) => i.naturalWidth > 0).length}/${imgs.length}`],
        ["scrollY", Math.round(window.scrollY)],
        ["dpr / width", `${window.devicePixelRatio} / ${window.innerWidth}`],
      ]);
    };

    read();
    const id = setInterval(read, 400);
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      clearInterval(id);
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 2147483647,
        background: "rgba(0,0,0,0.86)",
        color: "#7CFFB2",
        font: "500 10px/1.45 ui-monospace, Menlo, monospace",
        padding: "8px 10px",
        maxWidth: "62vw",
        pointerEvents: "none",
        borderBottomRightRadius: 8,
      }}
    >
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "flex", gap: 6, whiteSpace: "nowrap" }}>
          <span style={{ color: "#8aa" }}>{k}</span>
          <span style={{ marginLeft: "auto", color: String(v).includes("GAP") ? "#ff6b6b" : "#7CFFB2" }}>
            {String(v)}
          </span>
        </div>
      ))}
    </div>
  );
}
