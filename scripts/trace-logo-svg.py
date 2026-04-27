#!/usr/bin/env python3
"""
Regenerate images/logo.svg from images/logo.png as real vector art:

- Black: OpenCV findContours (RETR_CCOMP) → outer + hole paths, approxPolyDP.
- Red / blue: circles from color moments, beneath the black ink.
- Writes `logo.svg` (white backdrop) and `logo-transparent.svg` (no backdrop).

Requires: pip install pillow opencv-python-headless
Run from repo root: python3 scripts/trace-logo-svg.py
"""
from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "images" / "logo.png"
OUT = ROOT / "images" / "logo.svg"
OUT_TRANSPARENT = ROOT / "images" / "logo-transparent.svg"

FILL_BLACK = "#040404"
FILL_RED = "#e9413d"
FILL_BLUE = "#40b0ef"
# ASCII-only in markup so SVG stays valid UTF-8 everywhere (avoid raw U+00B7 bytes).
SVG_TITLE = "mag&#183;na&#183;mat"


def contour_to_svg_d(c: np.ndarray, epsilon: float) -> str | None:
    if c is None or len(c) < 3:
        return None
    approx = cv2.approxPolyDP(c, epsilon, closed=True)
    pts = approx.reshape(-1, 2)
    if len(pts) < 3:
        return None
    x0, y0 = float(pts[0][0]), float(pts[0][1])
    parts = [f"M{x0:.3f},{y0:.3f}"]
    for x, y in pts[1:]:
        parts.append(f"L{float(x):.3f},{float(y):.3f}")
    parts.append("Z")
    return "".join(parts)


def circle_from_mask(rgb: np.ndarray, pred) -> tuple[float, float, float] | None:
    h, w, _ = rgb.shape
    rch, gch, bch = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    m = pred(rch, gch, bch) & ~((rch < 90) & (gch < 90) & (bch < 90))
    m = m.astype(np.uint8) * 255
    mo = cv2.moments(m)
    if mo["m00"] < 50:
        return None
    cx = mo["m10"] / mo["m00"]
    cy = mo["m01"] / mo["m00"]
    ys, xs = np.where(m > 0)
    rr = float(np.max(np.sqrt((xs - cx) ** 2 + (ys - cy) ** 2))) + 0.4
    return (cx, cy, rr)


def main() -> None:
    rgb = np.array(Image.open(SRC).convert("RGB"))
    H, W, _ = rgb.shape
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    black = ((r < 100) & (g < 100) & (b < 100)).astype(np.uint8) * 255

    contours, hierarchy = cv2.findContours(black, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    if hierarchy is None or len(contours) == 0:
        raise SystemExit("No contours found")

    hier = hierarchy[0]
    eps = 0.85

    def children_of(parent_idx: int) -> list[int]:
        out = []
        c = hier[parent_idx][2]
        while c != -1:
            out.append(c)
            c = hier[c][0]
        return out

    compound_paths: list[str] = []
    for i, c in enumerate(contours):
        if hier[i][3] != -1:
            continue
        segs = [contour_to_svg_d(c, eps)]
        for ch in children_of(i):
            dh = contour_to_svg_d(contours[ch], eps * 0.65)
            if dh:
                segs.append(dh)
        segs = [s for s in segs if s]
        if segs:
            compound_paths.append(" ".join(segs))

    def pred_red(r, g, b):
        return (r > 160) & (g < 130) & (b < 130) & (r > b + 30)

    def pred_blue(r, g, b):
        return (b > 160) & (r < 140) & (g > 70)

    rc = circle_from_mask(rgb, pred_red)
    bc = circle_from_mask(rgb, pred_blue)

    head = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
        f'role="img" aria-label="{SVG_TITLE}" shape-rendering="geometricPrecision" text-rendering="geometricPrecision">',
        f"<title>{SVG_TITLE}</title>",
    ]
    body: list[str] = []
    if rc:
        cx, cy, rr = rc
        body.append(f'<circle cx="{cx:.3f}" cy="{cy:.3f}" r="{rr:.3f}" fill="{FILL_RED}"/>')
    if bc:
        cx, cy, rr = bc
        body.append(f'<circle cx="{cx:.3f}" cy="{cy:.3f}" r="{rr:.3f}" fill="{FILL_BLUE}"/>')

    joined = " ".join(compound_paths)
    body.append(f'<path fill="{FILL_BLACK}" fill-rule="evenodd" stroke="none" d="{joined}"/>')

    opaque = [*head, '<rect width="100%" height="100%" fill="#ffffff"/>', *body, "</svg>"]
    transparent = [*head, *body, "</svg>"]

    OUT.write_text("\n".join(opaque))
    OUT_TRANSPARENT.write_text("\n".join(transparent))
    print(
        f"Wrote {OUT} and {OUT_TRANSPARENT} ({len(compound_paths)} compound path(s), circles={rc is not None}/{bc is not None})"
    )


if __name__ == "__main__":
    main()
