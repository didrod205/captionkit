import { convert, detectFormat, fixOverlaps, parse, shift, toSRT, toVTT, type SubtitleFormat } from "../src/index";

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const input = $<HTMLTextAreaElement>("input");
const output = $<HTMLTextAreaElement>("output");
const status = $<HTMLDivElement>("status");
const fileInput = $<HTMLInputElement>("file");

const SAMPLE = `1
00:00:01,000 --> 00:00:03,500
Welcome to captionkit!

2
00:00:03,600 --> 00:00:07,000
Convert, shift and fix your subtitles…

3
00:00:07,100 --> 00:00:10,000
…entirely in your browser.
`;

function apply(): void {
  const text = input.value.trim();
  if (!text) {
    output.value = "";
    status.textContent = "";
    return;
  }
  try {
    let cues = parse(text);
    status.textContent = `Detected ${detectFormat(text).toUpperCase()} · ${cues.length} cue(s)`;
    status.className = "status ok";

    const shiftSec = Number(($("shift") as HTMLInputElement).value) || 0;
    if (shiftSec) cues = shift(cues, Math.round(shiftSec * 1000));
    if (($("fix") as HTMLInputElement).checked) cues = fixOverlaps(cues, 40);

    const fmt = ($("format") as HTMLSelectElement).value as SubtitleFormat;
    output.value = fmt === "vtt" ? toVTT(cues) : toSRT(cues);
  } catch (e) {
    status.textContent = `⚠️ ${(e as Error).message}`;
    status.className = "status err";
    output.value = "";
  }
}

$("apply").addEventListener("click", apply);
input.addEventListener("input", apply);
($("shift") as HTMLInputElement).addEventListener("input", apply);
$("format").addEventListener("change", apply);
$("fix").addEventListener("change", apply);

$("sample").addEventListener("click", () => {
  input.value = SAMPLE;
  apply();
});

$("pick").addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", async () => {
  const f = fileInput.files?.[0];
  if (!f) return;
  input.value = await f.text();
  // Default output format to match the file extension's "other"? Keep current.
  apply();
});

$("copy").addEventListener("click", (e) => {
  navigator.clipboard.writeText(output.value);
  const b = e.currentTarget as HTMLButtonElement;
  const t = b.textContent;
  b.textContent = "Copied!";
  setTimeout(() => (b.textContent = t), 1100);
});

$("download").addEventListener("click", () => {
  if (!output.value) return;
  const fmt = ($("format") as HTMLSelectElement).value;
  const blob = new Blob([output.value], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `captions.${fmt}`;
  a.click();
  URL.revokeObjectURL(a.href);
});

// Drag & drop
const drop = document.body;
["dragover", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => e.preventDefault()));
drop.addEventListener("drop", async (e) => {
  const f = (e as DragEvent).dataTransfer?.files?.[0];
  if (f) {
    input.value = await f.text();
    apply();
  }
});

input.value = SAMPLE;
apply();
