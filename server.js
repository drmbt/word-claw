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

const defaultVocab = require('./vocab');

app.get('/api/config', (req, res) => {
    let vocabConfigList = [...defaultVocab]; // Clone to prevent mutation

    // If the .env specifically provides a comma separated list, append it to the pool
    if (process.env.WORD_LIST) {
        const customWords = process.env.WORD_LIST.split(',').map(s => s.trim()).filter(s => s.length > 0);
        vocabConfigList = vocabConfigList.concat(customWords);
    }

    res.json({
        maxWordCount: parseInt(process.env.MAX_WORD_COUNT) || 50,
        wordList: vocabConfigList,
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Word Claw server listening on port ${port}, available on LAN 0.0.0.0`);
});
