# Chip-8

You can quickly explore the deployed demo here: https://chip8.hugo.dev.br/

## Yey another Chip-8 implementation, why?

The original plan for the code base, was to quickly (and somewhat terribly) implement just enough to run the Maze demo. It started as a PoC to use regular expressions to match instructions and extract parameters (yes, this project parses instructions as a hex string). After a few passes, I ended up adding more opcodes to the code base, reaching a point of running most demos available for download (aside from demos that use sound, timing and input).

It's currently implemented next to React, which is currently being used to render the display (each pixel is a `div`), which may not be the fastest solution, but was the quickest way to get scalable graphics.

Most of the source code could be improved and revised, as this is my first time dealing with bit-level stuff in Typescript. There are no plans or roadmaps for this project, it's not even expected to reach a final complete version.

## Planned features

- [x] Drag and Drop support;
- [ ] Step by step;
- [ ] Register and memory visualization;
- [ ] PoC of a machine code "micro-framework".
