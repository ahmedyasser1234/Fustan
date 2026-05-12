#!/usr/bin/env python3
"""
AI Background Replacement Script
---------------------------------
Usage:
    python3 ai_background_replacement_script.py <input_image> <output_image> [background_image]

If background_image is provided, remove the foreground subject and composite it
over the background. If not provided, simply output the image with a transparent
background (or just copy the input to output for testing).

Requirements (install before running):
    pip install rembg pillow
"""

import sys
import os

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 ai_background_replacement_script.py <input> <output> [background]")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    background_path = sys.argv[3] if len(sys.argv) > 3 else None

    print(f"[AI Script] Input: {input_path}")
    print(f"[AI Script] Output: {output_path}")
    print(f"[AI Script] Background: {background_path or 'None (transparent)'}")

    if not os.path.exists(input_path):
        print(f"[AI Script] ERROR: Input file not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    try:
        from rembg import remove
        from PIL import Image
        import io

        print("[AI Script] Removing background using rembg...")

        with open(input_path, 'rb') as f:
            input_data = f.read()

        # Remove background
        output_data = remove(input_data)
        foreground = Image.open(io.BytesIO(output_data)).convert("RGBA")

        if background_path and os.path.exists(background_path):
            print("[AI Script] Compositing foreground over background...")
            background = Image.open(background_path).convert("RGBA")
            # Resize background to match foreground size
            background = background.resize(foreground.size, Image.LANCZOS)
            # Composite the foreground over the background
            result = Image.alpha_composite(background, foreground)
        else:
            result = foreground

        # Save as PNG to preserve transparency
        result.save(output_path, "PNG")
        print(f"[AI Script] Done! Output saved to: {output_path}")
        sys.exit(0)

    except ImportError:
        print("[AI Script] WARNING: rembg not installed. Falling back to copy mode.", file=sys.stderr)
        # Fallback: just copy the input to output
        import shutil
        shutil.copy2(input_path, output_path)
        print(f"[AI Script] Fallback: Copied input to output: {output_path}")
        sys.exit(0)

    except Exception as e:
        print(f"[AI Script] ERROR: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
