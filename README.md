# Word Claw - Poetry Arcade

A premium, interactive web-based gamified text editor designed for experimental "cut-up" poetry composition.

![Word Claw Gameplay](docs/word_claw_demo.webp)

## Concept
The application is split into two halves:
1. **The Arcade (Left)**: A physics-based word pit containing a dense jumble of literary words, articles, prefixes, and suffixes. The player controls a claw mechanism to earn their vocabulary.
2. **The Terminal (Right)**: A sleek composition board where earned words are placed into the inventory belt, ready to be dragged, dropped, or trashed on the canvas to form poetry.

## Features
- **Two-Stage Claw Drop**: Press <kbd>Spacebar</kbd> (or click Drop) to begin the claw's descent. Press it again to stop the claw mid-air and grab a word at that specific depth.
- **Physics Word Pile**: Words naturally settle with gravity and randomize their layout, overlaying each other to create a sense of density.
- **Jumble & Dump Mechanic**: When your "Retrieved Words" inventory belt fills up, the machine shakes the word pit and drops a fresh batch of 50 new words!
- **Magnetic Drag & Drop**: Freely drag words from your inventory onto the composition board.
- **Synthwave Aesthetics**: Dark mode, sharp monospace/serif fonts, CRT grid overlays, and vibrant neon accents.

## How to Play
1. Open `index.html` in any modern web browser. No local development server or dependencies required.
2. Move your mouse over the left-hand game area to position the claw.
3. Click "DROP CLAW" or press <kbd>Spacebar</kbd> to launch the claw down the wire.
4. Quickly press "DROP CLAW" or <kbd>Spacebar</kbd> again to trigger the grab before it hits the bottom.
5. Watch the word drop into the Prize Chute and appear in your inventory on the right.
6. Drag your words onto the Composition Canvas to build your poem. Drag them to the Trash zone to delete them.

## Tech Stack
- **HTML5**
- **Vanilla CSS3** (Flexbox, CSS Animations, Keyframes)
- **Raw JavaScript** (ES6, custom collision detection, requestAnimationFrame game loops)

*No external libraries were used (No Canvas API, No React, No Physics Engines).*
