#!/usr/bin/env python3
"""
Remove background from images in the public folder.
Makes the dominant corner/edge color transparent and saves as *_transparent.png.
"""
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Install Pillow: pip install Pillow")
    exit(1)

PUBLIC_DIR = Path(__file__).resolve().parent.parent / "public"
TOLERANCE = 45  # Color distance; increase if too much/little is removed
# Pixels with R,G,B all <= this are treated as black background and made transparent
BLACK_THRESHOLD = 55
SUPPORTED = {".png", ".jpg", ".jpeg"}


def get_background_color(img, data, w, h):
    """Sample corners and edges to guess background color."""
    def at(x, y):
        if 0 <= x < w and 0 <= y < h:
            return data[y * w + x]
        return None

    samples = [
        at(0, 0), at(w - 1, 0), at(0, h - 1), at(w - 1, h - 1),
        at(w // 2, 0), at(w // 2, h - 1), at(0, h // 2), at(w - 1, h // 2),
    ]
    samples = [s for s in samples if s is not None]
    if not samples:
        return None
    r = int(sum(s[0] for s in samples) / len(samples))
    g = int(sum(s[1] for s in samples) / len(samples))
    b = int(sum(s[2] for s in samples) / len(samples))
    return (r, g, b)


def remove_background(in_path: Path, out_path: Path, tolerance: int = TOLERANCE) -> bool:
    """Make background transparent; save to out_path."""
    try:
        img = Image.open(in_path)
        if img.mode != "RGBA":
            img = img.convert("RGBA")
        data = list(img.getdata())
        w, h = img.size

        bg = get_background_color(img, data, w, h)
        if bg is None:
            print(f"  Skip (could not sample): {in_path.name}")
            return False

        r, g, b = bg
        # Use higher tolerance when background is dark so we remove the whole black/dark area
        effective_tolerance = max(tolerance, 80) if (r + g + b) / 3 < 60 else tolerance
        new_data = []
        for pixel in data:
            pr, pg, pb, pa = pixel
            # Transparent if matches corner/edge background
            dist = ((pr - r) ** 2 + (pg - g) ** 2 + (pb - b) ** 2) ** 0.5
            is_bg = dist <= effective_tolerance
            # Also treat black / near-black as background (content unchanged)
            is_black_bg = (
                pr <= BLACK_THRESHOLD and pg <= BLACK_THRESHOLD and pb <= BLACK_THRESHOLD
            )
            if is_bg or is_black_bg:
                new_data.append((pr, pg, pb, 0))
            else:
                new_data.append(pixel)

        img.putdata(new_data)
        img.save(out_path, "PNG")
        return True
    except Exception as e:
        print(f"  Error: {e}")
        return False


# Threshold for "white/light grey" interior removal (R,G,B each >= this → transparent)
INTERIOR_WHITE_THRESHOLD = 235


def remove_internal_white(in_path: Path, out_path: Path, threshold: int = INTERIOR_WHITE_THRESHOLD) -> bool:
    """Make white and very light grey pixels transparent (for already-transparent images)."""
    try:
        img = Image.open(in_path)
        if img.mode != "RGBA":
            img = img.convert("RGBA")
        data = list(img.getdata())
        new_data = []
        for pixel in data:
            r, g, b, a = pixel
            if a == 0:
                new_data.append(pixel)
                continue
            if r >= threshold and g >= threshold and b >= threshold:
                new_data.append((r, g, b, 0))
            else:
                new_data.append(pixel)
        img.putdata(new_data)
        img.save(out_path, "PNG")
        return True
    except Exception as e:
        print(f"  Error: {e}")
        return False


def main():
    if not PUBLIC_DIR.is_dir():
        print(f"Public folder not found: {PUBLIC_DIR}")
        return 1

    count = 0
    # Optional: process only one file (e.g. python3 remove_bg_public.py dash.png)
    only_files = [PUBLIC_DIR / name for name in sys.argv[1:] if name and not name.startswith("-")]
    if only_files:
        for path in only_files:
            if not path.is_file() or path.suffix.lower() not in SUPPORTED:
                print(f"Skipping (not a supported image): {path.name}")
                continue
            if path.stem.endswith("_transparent"):
                print(f"Skipping (already a transparent output name): {path.name}")
                continue
            out_path = path.parent / f"{path.stem}_transparent.png"
            print(f"Processing: {path.name} -> {out_path.name}")
            if remove_background(path, out_path):
                count += 1
                print(f"  Saved: {out_path.name}")
    else:
        for path in sorted(PUBLIC_DIR.iterdir()):
            if path.suffix.lower() not in SUPPORTED:
                continue
            if path.stem.endswith("_transparent"):
                continue
            out_path = path.parent / f"{path.stem}_transparent.png"
            print(f"Processing: {path.name} -> {out_path.name}")
            if remove_background(path, out_path):
                count += 1
                print(f"  Saved: {out_path.name}")

    print(f"\nDone. Processed {count} image(s).")
    return 0


if __name__ == "__main__":
    exit(main())
