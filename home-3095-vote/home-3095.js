const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const urlencodedParser = express.urlencoded({extended: false});

const webServer = express()
webServer.use(bodyParser.json());

const port = 7481;

const votesFilePath = path.join(__dirname, 'votes.txt');

const variants = [
    {
        candidateId: 0,
        value: 'Камала Харрис',
        votes: 0
    },
    {
        candidateId: 1,
        value: 'Тим Уолз',
        votes: 0
    },
    {
        candidateId: 2,
        value: 'Дональд Трамп',
        votes: 0
    },
    {
        candidateId: 3,
        value: 'Джеймс Дэвид Вэнс',
        votes: 0
    }
]

function createFile() {
    console.log('createFile');

    fs.access(votesFilePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File does not exist, create it
            fs.appendFile(votesFilePath, JSON.stringify(variants), (err) => {
                if (err) throw err;
                console.log('File created and data has been added!');
            });
        } else {
            // File already exists
            console.log('File already exists. Not recreating.');
        }
    });
}

createFile()

function updateVotes(vote) {
    let fileContent = fs.readFileSync(votesFilePath, 'utf8');
    let fileContentJson = JSON.parse(fileContent)
    for (let candidate of fileContentJson) {
        if (candidate.candidateId === Number(vote.vote)) {
            candidate.votes =  candidate.votes + 1
        }
    }

    fs.writeFile(votesFilePath, JSON.stringify(fileContentJson), (err) => {
        if (err) throw err;
        console.log('File created and data has been added!');
    });
    return fileContentJson

}

webServer.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

webServer.post('/stat',urlencodedParser, (req, res) => {
    updateVotes(req.body)
    res.sendFile( path.resolve(__dirname, 'votes.html') )
});

webServer.get('/variants', (req, res) => {
    res.json(variants);
});

webServer.get('/votes', (req, res) => {
    let fileContent = fs.readFileSync(votesFilePath, 'utf8');
    res.json(JSON.parse(fileContent));
});










webServer.listen(port, () => {
    console.log(`Server started on port ${port}`);
});