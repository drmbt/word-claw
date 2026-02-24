require('dotenv').config({ path: process.env.ENV_FILE_PATH || '/mars/config/word-claw/.env' });
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 1010;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
// Also serve from root since we are transitioning to a backend
app.use(express.static(__dirname));

app.get('/api/config', (req, res) => {
    // Provide a massive default vocab list if none is set in the env
    const defaultVocab = [
        "the", "of", "and", "a", "to", "in", "is", "you", "that", "it", "he", "was", "for", "on", "are", "as", "with", "his", "they", "I",
        // ... (Adding a large list of words to make it interesting)
        "love", "death", "blood", "neon", "cyber", "flesh", "machine", "ghost", "shell", "soul", "heart", "mind", "memory", "data", "system",
        "fuck", "shit", "damn", "bitch", "cunt", "motherfucker", "asshole", "dick", "pussy", "cock", "slut", "whore", "bastard", "crap", "piss",
        // Sexual and R-rated
        "sex", "orgasm", "climax", "penetration", "lust", "desire", "erotic", "kink", "fetish", "bondage", "sadism", "masochism", "dominant", "submissive",
        // Pop culture
        "matrix", "jedi", "sith", "vader", "skywalker", "hobbit", "gandalf", "mordor", "hogwarts", "potter", "voldemort", "batman", "joker", "gotham", "superman",
        "thanos", "avengers", "stark", "wakanda", "targaryen", "stark", "lannister", "westeros", "dragon", "terminator", "skynet", "predator", "alien", "ripley",
        // Action verbs
        "destroy", "kill", "murder", "smash", "break", "crush", "burn", "melt", "freeze", "shock", "electrocute", "slice", "cut", "tear", "rip",
        // Adjectives
        "bloody", "violent", "fucking", "goddamn", "beautiful", "gorgeous", "vile", "disgusting", "horrific", "terrifying", "amazing", "incredible", "awesome",
        // Nouns
        "knife", "gun", "sword", "bomb", "bullet", "laser", "plasma", "fire", "ice", "poison", "toxin", "venom", "acid", "radioactive", "nuclear",
        // More literary/poetic
        "whisper", "shadow", "moonlight", "starlight", "ocean", "tide", "breeze", "storm", "thunder", "lightning", "rain", "snow", "frost", "ember", "ash",
        "sorrow", "grief", "joy", "bliss", "ecstasy", "agony", "pain", "pleasure", "laughter", "tears", "smile", "frown", "kiss", "embrace", "touch",
        "dream", "nightmare", "vision", "hallucination", "illusion", "reality", "truth", "lie", "deception", "betrayal", "loyalty", "honor", "glory", "shame",
        // Body parts
        "eye", "lip", "tongue", "tooth", "bone", "skin", "muscle", "vein", "artery", "nerve", "spine", "skull", "brain", "lung", "stomach", "liver", "kidney",
        "hand", "finger", "thumb", "wrist", "arm", "elbow", "shoulder", "neck", "throat", "chest", "breast", "nipple", "belly", "navel", "hip", "thigh", "knee", "calf", "ankle", "foot", "toe",
        // Miscellaneous
        "time", "space", "void", "abyss", "infinity", "eternity", "cosmos", "universe", "galaxy", "star", "planet", "world", "earth", "sun", "moon",
        "god", "devil", "angel", "demon", "spirit", "phantom", "specter", "wraith", "monster", "beast", "creature", "mutant", "cyborg", "android", "robot",
        "virus", "malware", "glitch", "bug", "crash", "error", "failure", "success", "victory", "defeat", "triumph", "catastrophe", "disaster", "apocalypse"
    ];

    let vocabConfigList = defaultVocab;
    // If the .env specifically provides a comma separated list
    if (process.env.WORD_LIST) {
        vocabConfigList = process.env.WORD_LIST.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }

    res.json({
        maxWordCount: parseInt(process.env.MAX_WORD_COUNT) || 50,
        wordList: vocabConfigList,
    });
});

app.listen(port, () => {
    console.log(`Word Claw server listening on port ${port}`);
});
