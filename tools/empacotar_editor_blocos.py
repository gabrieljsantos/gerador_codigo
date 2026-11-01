#!/usr/bin/env python3
"""Empacota o editor tradicional para ser embutido no firmware Blocks Wi-Fi."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
files = {
    "html": ROOT / "blocos" / "index.html",
    "app": ROOT / "blocos" / "app.js",
    "styles": ROOT / "blocos" / "styles.css",
    "portal": ROOT / "blocos" / "portal.css",
    "network": ROOT / "network-mode.css",
    "firmware": ROOT / "blocos_wifi" / "device_firmware_template.cpp",
}

payload = {name: path.read_text(encoding="utf-8") for name, path in files.items()}
out = ROOT / "blocos_wifi" / "editor_bundle.js"
out.write_text("window.CTRL_FORGE_BLOCKS_EDITOR=" + json.dumps(payload, ensure_ascii=False) + ";\n", encoding="utf-8")
print(f"Editor empacotado: {out.relative_to(ROOT)} ({out.stat().st_size} bytes)")
