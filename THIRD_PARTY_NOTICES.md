# Third-party notices

## jsvectormap map data

The country shapes in `data/europe.js` are derived from
[jsvectormap](https://github.com/themustafaomar/jsvectormap),
file `packages/maps/src/world.js` at commit `08283f02227fbf6b63b8da34a43069adfd89bdc7`
(a copy is kept at `tools/world.js`).

Modifications: only the countries overlapping the Europe map are kept, overseas
parts (French Guiana, Svalbard) are removed, label points were added, and some
display names were changed. See `tools/extract_map.py`.

```
MIT License

Copyright (c) 2020 Mustafa Omar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Applause sound

`sounds/applause.wav` is a trimmed (5.5 s), mono, 24 kHz version of
[277021 sandermotions applause-2.wav](https://commons.wikimedia.org/wiki/File:277021_sandermotions_applause-2.wav)
by **Sandermotions**, released under [CC0](https://creativecommons.org/publicdomain/zero/1.0/) (no attribution required).
