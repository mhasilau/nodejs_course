const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const webServer = express()
webServer.use(express.json());
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
                if (err)  new Error(err.message);
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
    return new Promise((resolve, reject) => {
        fs.readFile(votesFilePath, 'utf8', (err, fileContent) => {
            if (err) return reject(err);

            let fileContentJson = JSON.parse(fileContent);
            for (let candidate of fileContentJson) {
                if (candidate.candidateId === Number(vote.vote)) {
                    candidate.votes = candidate.votes + 1;
                }
            }

            fs.writeFile(votesFilePath, JSON.stringify(fileContentJson), (err) => {
                if (err) return reject(err);
                resolve(fileContentJson);
            });
        });
    });
}

webServer.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

webServer.post('/vote', async (req, res) => {
    try {
        const updatedVotes = await updateVotes(req.body);
        res.status(200).json(updatedVotes);
    } catch (error) {
        console.error('Error updating votes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

webServer.get('/variants', (req, res) => {
    res.json(variants);
});

webServer.get('/format', async (req, res) => {
    const fileContent = fs.readFileSync(votesFilePath, 'utf8');
    const json = JSON.parse(fileContent);
    const format = req.headers.accept;

    switch (format) {
        case 'application/json':
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Content-Disposition", 'attachment; filename="voting_results.json"');
            res.status(200).send(JSON.stringify({data: json}, null, 2));
            break;
        case 'application/xml':
            res.setHeader("Content-Type", "application/xml");
            res.setHeader("Content-Disposition", 'attachment; filename="voting_results.xml"');
            res.status(200).send(createXML(json));
            break;
        case 'text/html':
            res.setHeader("Content-Type", "text/html");
            res.setHeader("Content-Disposition", 'attachment; filename="voting_results.html"');
            res.status(200).send(createHTML(json));
            break;
        default:
            res.status(406).send('Not Acceptable');
    }
});


function createHTML(data) {
    let startDiv = '<div>'
    const endDiv = '</div>'

    data.forEach((item) => {
        const candidate = `
                                <div>
                                <span>${item.value}</span> набрал(а) <span>${item.votes}</span> голосов
                                </div>
                                `
        startDiv += candidate
    })
    return startDiv + endDiv
}

function createXML(data) {
    let startDiv = '<busket>'
    const endDiv = '</busket>'

    data.forEach((item) => {
        const candidate = `
                                <note>
                                <candidate>${item.value}</candidate> набрал(а) <votes>${item.votes}</votes> голосов
                                </note>
                                `
        startDiv += candidate
    })
    return startDiv + endDiv
}

webServer.post('/stat', (req, res) => {
    let fileContent = fs.readFileSync(votesFilePath, 'utf8');
    res.json(JSON.parse(fileContent));
});










webServer.listen(port, () => {
    console.log(`Server started on port ${port}`);
});