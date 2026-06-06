import Reveal from "https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reveal.esm.js";
import Markdown from "https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/plugin/markdown/markdown.esm.js";
import Highlight from "https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/plugin/highlight/highlight.esm.js";
import RevealMath from "https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/plugin/math/math.esm.js";
import Notes from "https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/plugin/notes/notes.esm.js";

Reveal.initialize({
  hash: true,
  controls: true,
  progress: true,
  center: false,
  width: 1280,
  height: 720,
  margin: 0.06,
  transition: "fade",
  backgroundTransition: "fade",
  pdfSeparateFragments: false,
  katex: {
    version: "0.16.11",
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false },
      { left: "\\(", right: "\\)", display: false },
      { left: "\\[", right: "\\]", display: true }
    ],
    ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"]
  },
  plugins: [Markdown, Highlight, RevealMath.KaTeX, Notes]
});
