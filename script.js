document.addEventListener("DOMContentLoaded", () => {

    // --- Config & State ---
    const config = {
        vocab: [
            // Articles & Conjunctions
            "the", "a", "an", "and", "but", "or", "so", "yet", "for", "nor",
            "in", "of", "to", "with", "from", "by", "on", "as", "at", "into",
            "like", "over", "after", "through", "beneath", "among", "beyond", "upon",
            // Pronouns
            "I", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them",
            "my", "your", "his", "its", "our", "their", "mine", "yours", "theirs",
            "who", "whom", "whose", "which", "that", "this", "these", "those",
            // Prefixes / Suffixes
            "un-", "re-", "in-", "im-", "dis-", "en-", "non-", "pre-", "pro-",
            "-ing", "-ed", "-s", "-es", "-ly", "-ful", "-less", "-ness", "-ment", "-tion", "-ity",
            // Nouns
            "night", "blood", "bone", "ghost", "star", "sea", "wind", "shadow", "heart", "soul",
            "fire", "water", "earth", "sky", "tree", "leaf", "bird", "wing", "feather", "stone",
            "iron", "gold", "silver", "glass", "mirror", "dream", "sleep", "death", "life", "time",
            "memory", "silence", "voice", "word", "song", "breath", "flesh", "skin", "eye", "hand",
            "face", "mouth", "lip", "tooth", "tongue", "tear", "smile", "laugh", "cry", "sob",
            "sun", "moon", "cloud", "rain", "snow", "ice", "frost", "winter", "summer", "spring",
            "autumn", "day", "hour", "minute", "second", "year", "century", "eternity", "moment",
            // Adjectives
            "dark", "light", "cold", "hot", "warm", "cool", "deep", "shallow", "high", "low",
            "far", "near", "wide", "narrow", "long", "short", "heavy", "light", "hard", "soft",
            "sharp", "dull", "rough", "smooth", "sweet", "sour", "bitter", "salty", "fresh", "stale",
            "bright", "dim", "faint", "clear", "cloudy", "blind", "deaf", "mute", "old", "young",
            "new", "ancient", "eternal", "immortal", "mortal", "dead", "alive", "living", "dying",
            // Verbs
            "is", "are", "am", "was", "were", "be", "been", "being", "have", "has", "had", "having",
            "do", "does", "did", "doing", "will", "would", "shall", "should", "can", "could", "may", "might", "must",
            "go", "come", "run", "walk", "fly", "swim", "crawl", "climb", "fall", "rise", "stand", "sit", "lie",
            "look", "see", "watch", "gaze", "stare", "glance", "peek", "peep", "glimpse", "blind",
            "know", "think", "feel", "believe", "doubt", "hope", "fear", "love", "hate", "desire",
        ],
        numWords: 150, // Dense pile
        wordSizeMin: 14,
        wordSizeMax: 32
    };

    const state = {
        clawMode: 'idle', // idle, dropping, grabbing, retracting, returning
        clawX: 0,
        clawY: 0, // 0 is top
        clawTargetX: 0,
        gameWords: [], // { el, x, y, vx, vy, w, h, id, grabbed }
        grabbedWord: null,
        dropAnimationFrame: null,
        clawCurrentDepth: 30 // Start height of arm
    };

    // --- DOM Elements ---
    const gameWindow = document.getElementById('game-window');
    const wordPit = document.getElementById('word-pit');
    const clawCarriage = document.getElementById('claw-carriage');
    const clawArm = document.getElementById('claw-arm');
    const clawGrabber = document.getElementById('claw-grabber');
    const btnDrop = document.getElementById('btn-drop');
    const prizeChute = document.getElementById('prize-chute');

    const inventoryBelt = document.getElementById('inventory-belt');

    // Box dimensions
    let pitRect = wordPit.getBoundingClientRect();
    let windowRect = gameWindow.getBoundingClientRect();

    // Re-calc dimensions on resize
    window.addEventListener('resize', () => {
        pitRect = wordPit.getBoundingClientRect();
        windowRect = gameWindow.getBoundingClientRect();
    });

    // --- Initialization & Physics Piling ---
    function initWords(addMore = false) {
        if (!addMore) {
            wordPit.innerHTML = '';
            state.gameWords = [];
        }

        const dumpAmount = addMore ? 50 : config.numWords;

        for (let i = 0; i < dumpAmount; i++) {
            const wordText = config.vocab[Math.floor(Math.random() * config.vocab.length)];
            const el = document.createElement('div');
            el.className = 'arcade-word';
            el.innerText = wordText;

            const fontSize = Math.floor(Math.random() * (config.wordSizeMax - config.wordSizeMin) + config.wordSizeMin);
            el.style.fontSize = `${fontSize}px`;

            const rot = (Math.random() - 0.5) * 60; // More chaotic rotation

            // If dropping in via jumble
            if (addMore) {
                el.style.top = `-50px`; // start above
                el.classList.add('falling');
                // initial minimal rotation, final rotation set later
                el.style.transform = `rotate(0deg)`;
            } else {
                el.style.transform = `rotate(${rot}deg)`;
            }

            wordPit.appendChild(el);

            const rect = el.getBoundingClientRect();

            // Bias placement towards bottom right and center to create a dense overlapping pile
            let x, y;
            let validPlacement = false;
            let attempts = 0;

            while (!validPlacement && attempts < 50) {
                // Bias X towards middle/right
                x = (Math.random() * 0.4 + 0.6) * (pitRect.width - rect.width);
                if (Math.random() > 0.6) x = Math.random() * (pitRect.width - rect.width); // Some random scatter

                // Bias Y towards bottom (pile up)
                y = (Math.pow(Math.random(), 3)) * (pitRect.height - rect.height); // Skewed distribution towards height
                y = pitRect.height - y - rect.height; // Invert to put at bottom
                if (y < 0) y = 0;

                validPlacement = true;
                attempts++;
            }
            // Fallback if loop finishes without valid
            if (!validPlacement) {
                x = pitRect.width / 2;
                y = pitRect.height / 2;
            }

            el.style.left = `${x}px`;
            if (!addMore) {
                el.style.top = `${y}px`;
            }

            const wordObj = {
                id: `word-${state.gameWords.length + i}`,
                el: el,
                text: wordText,
                x: x,
                y: y, // Final destination Y
                w: rect.width,
                h: rect.height,
                vy: 0,
                rot: rot,
                grabbed: false
            };

            state.gameWords.push(wordObj);

            if (addMore) {
                // Trigger animation after append
                setTimeout(() => {
                    el.style.top = `${y}px`;
                    el.style.transform = `rotate(${rot}deg)`;
                    setTimeout(() => el.classList.remove('falling'), 1000);
                }, Math.random() * 500); // stagger drops
            }
        }
    }

    initWords();

    // --- Claw Controls ---
    gameWindow.addEventListener('mousemove', (e) => {
        if (state.clawMode !== 'idle') return;

        const rect = gameWindow.getBoundingClientRect();
        let relX = e.clientX - rect.left;

        const carriageWidth = 40;
        if (relX < carriageWidth / 2) relX = carriageWidth / 2;
        if (relX > rect.width - carriageWidth / 2) relX = rect.width - carriageWidth / 2;

        state.clawTargetX = relX;
        clawCarriage.style.left = `${relX}px`;
        state.clawX = relX;
    });

    function handleClawTrigger() {
        if (state.clawMode === 'idle') {
            startDrop();
        } else if (state.clawMode === 'dropping') {
            triggerGrab();
        }
    }

    btnDrop.addEventListener('click', handleClawTrigger);

    // Allow spacebar anywhere
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault(); // stop scrolling
            handleClawTrigger();
        }
    });

    gameWindow.addEventListener('mousedown', (e) => {
        if (e.target.closest('.arcade-controls')) return;
        handleClawTrigger();
    });

    // --- Claw Animation & Logic (Two-Step) ---
    function startDrop() {
        state.clawMode = 'dropping';
        clawGrabber.classList.remove('closed');

        // Remove CSS transition from arm, we drive it with requestAnimationFrame
        // so we can stop it instantly on second click
        clawArm.style.transition = 'none';

        const dropSpeed = 0.4; // px per ms
        let lastTime = performance.now();
        const maxDepth = windowRect.height - 80;

        function animateDrop(currentTime) {
            if (state.clawMode !== 'dropping') return; // Abort if state changed (grab triggered)

            const dt = currentTime - lastTime;
            lastTime = currentTime;

            state.clawCurrentDepth += dropSpeed * dt;

            // Auto hit bottom
            if (state.clawCurrentDepth >= maxDepth) {
                state.clawCurrentDepth = maxDepth;
                triggerGrab();
                return;
            }

            clawArm.style.height = `${state.clawCurrentDepth}px`;
            // Move grabber down the arm
            clawGrabber.style.transform = `translate(-50%, ${state.clawCurrentDepth - 30}px)`;

            state.dropAnimationFrame = requestAnimationFrame(animateDrop);
        }

        state.dropAnimationFrame = requestAnimationFrame(animateDrop);
    }

    function triggerGrab() {
        state.clawMode = 'grabbing';
        if (state.dropAnimationFrame) cancelAnimationFrame(state.dropAnimationFrame);

        clawGrabber.classList.add('closed');
        checkCollision();

        setTimeout(() => {
            retractClaw();
        }, 400); // Small delay on grab for feel
    }

    function checkCollision() {
        // Claw grab coords
        const clawGrabY = gameWindow.getBoundingClientRect().top + 10 + state.clawCurrentDepth + 30;
        const clawGrabX = gameWindow.getBoundingClientRect().left + state.clawX;

        let bestCandidate = null;
        let minDist = 9999;

        state.gameWords.forEach(w => {
            if (w.grabbed) return;
            const wRect = w.el.getBoundingClientRect();
            // Since rotation is visually wild, the bounding rect might be large.
            // That actually helps in finding overlaps.
            const wCenterX = wRect.left + wRect.width / 2;
            const wCenterY = wRect.top + wRect.height / 2;

            const dx = Math.abs(wCenterX - clawGrabX);
            const dy = Math.abs(wCenterY - clawGrabY);

            // Generous hitbox for dense piles
            if (dx < wRect.width / 2 + 25 && dy < wRect.height / 2 + 35) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDist) {
                    minDist = dist;
                    bestCandidate = w;
                }
            }
        });

        if (bestCandidate) {
            state.grabbedWord = bestCandidate;
            bestCandidate.grabbed = true;
            bestCandidate.el.classList.add('grabbed');
        }
    }

    function retractClaw() {
        state.clawMode = 'retracting';

        // Use CSS transition for retracting, it's easier and looks fine
        // Calculate duration based on current depth so speed is consistent
        const retractSpeed = 0.6; // px per ms
        const distance = state.clawCurrentDepth - 30; // back to resting 30px
        const duration = Math.abs(distance / retractSpeed);

        clawArm.style.transition = `height ${duration}ms linear`;
        clawArm.style.height = `30px`;

        // Retract grabber too
        clawGrabber.style.transition = `transform ${duration}ms linear`;
        clawGrabber.style.transform = `translate(-50%, 0px)`;

        state.clawCurrentDepth = 30;

        let start = null;
        function updateGrabbedPos(timestamp) {
            if (!start) start = timestamp;
            if (state.clawMode === 'retracting') {
                if (state.grabbedWord) {
                    const pitRelTop = wordPit.offsetTop;
                    // Read actual bounding rect height during transition
                    const currentArmH = clawArm.getBoundingClientRect().height;
                    const grabCenterY = 10 + currentArmH + 20;
                    const grabCenterX = state.clawX;

                    const wY = grabCenterY - pitRelTop - (state.grabbedWord.h / 2);
                    const wX = grabCenterX - (state.grabbedWord.w / 2);

                    state.grabbedWord.el.style.left = `${wX}px`;
                    state.grabbedWord.el.style.top = `${wY}px`;
                }
                requestAnimationFrame(updateGrabbedPos);
            }
        }
        requestAnimationFrame(updateGrabbedPos);

        setTimeout(() => {
            extractGrabbedWord();
        }, duration + 50);
    }

    function extractGrabbedWord() {
        clawGrabber.classList.remove('closed');
        if (state.grabbedWord) {
            // Animate it scaling out instead of dropping
            state.grabbedWord.el.style.transition = 'all 0.3s ease-in';
            state.grabbedWord.el.style.transform += ' scale(2)';
            state.grabbedWord.el.style.opacity = '0';

            setTimeout(() => {
                depositToInventory(state.grabbedWord);
                state.grabbedWord.el.remove();
                state.grabbedWord = null;
                resetClaw();
            }, 300);
        } else {
            resetClaw();
        }
    }

    function resetClaw() {
        state.clawMode = 'idle';
        clawCarriage.style.transition = 'none';
        clawArm.style.transition = 'none';
        clawGrabber.style.transition = 'none';
        clawGrabber.style.transform = `translate(-50%, 0px)`;
        state.clawCurrentDepth = 30; // Safety reset
    }

    // --- Inventory Bridge & Row Detection ---
    function depositToInventory(wordObj) {
        const hint = inventoryBelt.querySelector('.inventory-hint');
        if (hint) hint.remove();

        const magWord = document.createElement('div');
        magWord.className = 'magnetic-word';
        magWord.innerText = wordObj.text;
        magWord.id = `mag-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        inventoryBelt.appendChild(magWord);
        setupDragAndDrop(magWord);

        checkInventoryRowWrap();
    }

    // Check if the flexbox wrapped to a second line
    function checkInventoryRowWrap() {
        const words = Array.from(inventoryBelt.querySelectorAll('.magnetic-word'));
        if (words.length < 2) return;

        // Find the top offset of the first word
        const firstTop = words[0].offsetTop;
        let wrapped = false;

        for (let i = 1; i < words.length; i++) {
            // Give a few pixels of leeway, flexbox wrapping usually jumps significantly
            if (words[i].offsetTop > firstTop + 10) {
                wrapped = true;
                break;
            }
        }

        // Alternative simple threshold if flex measuring is finicky
        // But flex wrap detection is cool. Let's also add a max limit so it jumbles periodically.
        if (wrapped || words.length >= 8) {
            triggerJumbleSequence();
        }
    }

    function triggerJumbleSequence() {
        // Shake existing words
        state.gameWords.forEach(w => {
            if (!w.grabbed && w.el.parentElement === wordPit) {
                w.el.classList.add('shake');
                setTimeout(() => {
                    w.el.classList.remove('shake');
                }, 1000); // Shake for 1s
            }
        });

        // Dump new batch
        initWords(true);
    }

    // --- Composition Drag and Drop ---
    let draggedWord = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    const compBoard = document.getElementById('composition-board');
    const trashZone = document.getElementById('trash-zone');

    function setupDragAndDrop(el) {
        el.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Only left click
            e.preventDefault(); // prevent text selection

            draggedWord = el;

            const rect = el.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;

            // If dragging from inventory, move it into the DOM of the board
            // so we can use absolute positioning freely based on board bounds.
            if (el.parentElement === inventoryBelt) {
                compBoard.appendChild(el);
            }

            moveWordTo(e.clientX, e.clientY);
        });
    }

    // Globals for drag
    document.addEventListener('mousemove', (e) => {
        if (draggedWord) {
            moveWordTo(e.clientX, e.clientY);
            checkTrashHover(e.clientX, e.clientY);
        }
    });

    document.addEventListener('mouseup', (e) => {
        if (draggedWord) {
            if (isInTrash(e.clientX, e.clientY)) {
                draggedWord.remove(); // DELETE word
            } else {
                // Ensure it stays reasonably within bounds if dropped outside board slightly,
                // but for now absolute position is fine.
            }
            draggedWord = null;
            trashZone.classList.remove('hover');
        }
    });

    function moveWordTo(clientX, clientY) {
        const boardRect = compBoard.getBoundingClientRect();
        // Calculate position relative to the top-left of the composition board
        let x = clientX - boardRect.left - dragOffsetX;
        let y = clientY - boardRect.top - dragOffsetY;

        draggedWord.style.left = `${x}px`;
        draggedWord.style.top = `${y}px`;
    }

    function checkTrashHover(x, y) {
        if (isInTrash(x, y)) {
            trashZone.classList.add('hover');
        } else {
            trashZone.classList.remove('hover');
        }
    }

    function isInTrash(x, y) {
        const rect = trashZone.getBoundingClientRect();
        // generous hit box
        return (
            x >= rect.left - 20 && x <= rect.right + 20 &&
            y >= rect.top - 20 && y <= rect.bottom + 20
        );
    }

    // UI Buttons
    document.getElementById('btn-clear-canvas').addEventListener('click', () => {
        const words = compBoard.querySelectorAll('.magnetic-word');
        words.forEach(w => w.remove());
    });

    document.getElementById('btn-export').addEventListener('click', () => {
        alert("Poem Export: Take a screenshot to share your cyberpunk verse!");
    });

});
