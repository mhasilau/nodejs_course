const express = require('express');
const path = require('path');
const fs = require("fs").promises;
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { engine } = require('express-handlebars');


const webServer = express();
webServer.engine('handlebars', engine());
webServer.set('view engine', 'handlebars');
webServer.use(express.json());
webServer.use(cors());

webServer.use(express.static(path.join(__dirname, 'site')));

const port = 7480;
const savedFilePath = path.join(__dirname, 'saved-requests');

async function saveFile(data) {
    const dataString = JSON.stringify(data) + '\n'; // Ensure newline at the end

    try {
        await fs.appendFile(savedFilePath, dataString);
        console.log('Data has been added to file!');
    } catch (err) {
        console.error('Error writing to file:', err);
        throw err; // Rethrow error for handling in the calling function
    }
}

async function ensureFileExists() {
    try {
        await fs.access(savedFilePath);
    } catch (err) {
        if (err.code === 'ENOENT') {
            // File does not exist, create it
            await fs.writeFile(savedFilePath, '', 'utf8'); // Create an empty file
            console.log('Created missing saved-requests file.');
        } else {
            console.error('Error checking file existence:', err);
        }
    }
}

ensureFileExists();

function objectToQueryString(obj) {
    let queryString = "?";
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (queryString !== "") {
                queryString += "&";
            }
            queryString += encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
        }
    }
    return queryString;
}

async function deleteFileObject(id) {
    try {
        const fileData = await fs.readFile(savedFilePath, 'utf8');
        let allData = fileData.trim().split('\n').map(line => JSON.parse(line));
        allData = allData.filter(obj => Number(obj.id) !== Number(id));
        const updatedDataString = allData.map(obj => JSON.stringify(obj)).join('\n');
        await fs.writeFile(savedFilePath, updatedDataString);
        return allData;
    } catch (err) {
        console.error('Error in deleteFileObject:', err);
        throw err;
    }
}

webServer.get('/', async (req, res, next) => {
    try {
        const request = await getSaved();
        res.render('postman', {
            layout: 'main_layout',
            request: request,
        });
    } catch (error) {
        next(error);
    }
});

webServer.post('/save', async (req, res) => {
    console.log(req.body);
    try {
        await saveFile(req.body); // Save data to file
        const request = await getSaved(); // Retrieve updated data
        res.render('postman', { // Render view with updated data
            layout: 'main_layout',
            request: request,
        });
    } catch (err) {
        console.error(err); // Log error for debugging
        return res.status(500).json({ error: 'Failed to save data' });
    }
});
async function getSaved() {
    try {
        const fileData = await fs.readFile(savedFilePath, 'utf8');
        if (fileData) {
            const allData = fileData.trim().split('\n').map(line => {
                try {
                    return JSON.parse(line);
                } catch (err) {
                    console.error('Error parsing line:', line, err);
                    return null; // Return null for invalid lines
                }
            }).filter(item => item !== null); // Filter out invalid entries
            return allData;
        } else {
            return [];
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error('Saved requests file not found.');
            return []; // Return an empty array if no file exists
        }
        console.error('Error reading file:', err);
        throw err; // Rethrow error for handling in the calling function
    }
}

webServer.get('/request/:id', async (req, res) => {
    const id = req.params.id;
    console.log('id',id)
    try {
        const fileData = await fs.readFile(savedFilePath, 'utf8');
        if (fileData) {
            const allData = fileData.trim().split('\n').map(line => JSON.parse(line));
            const requestData = allData.find(item => Number(item.id) === Number(id));
            console.log(requestData)
            if (requestData) {
                res.json(requestData);
            } else {
                res.status(404).json({ error: 'Request not found' });
            }
        } else {
            res.status(404).json({ error: 'No saved requests found' });
        }
    } catch (err) {
        console.error('Error reading file:', err);
        res.status(500).json({ error: 'Failed to retrieve request data' });
    }
});

webServer.post('/request', async (req, res) => {
    const {method, url, params, body, headers} = req.body;
    let resBody;
    let resHeaders = {};

    try {
        let query = '';
        if (Object.values(params).length) {
            query = objectToQueryString(params);
        }

        const response = await fetch(url + query, {
            method: method,
            headers: headers,
            body: method === 'POST' || method === 'PUT' ? JSON.stringify(body) : undefined,
            redirect: 'manual'
        });

        // Преобразуем заголовки в обычный объект
        response.headers.forEach((value, key) => {
            resHeaders[key] = value;
        });

        // Проверяем тип контента
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('text/css')) {
            // Для CSS-файлов возвращаем как текст
            resBody = await response.text();
        } else {
            // Для других типов пробуем получить как arrayBuffer и конвертировать в base64
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            resBody = buffer.toString('base64');
        }

        res.send({
            info: {
                status: response.status,
                message: response.statusText,
            },
            headers: resHeaders,
            body: resBody
        });

    } catch (e) {
        console.error('Ошибка fetch:', e);
        return res.status(500).json({ error: 'Не удалось получить данные', details: e.message });
    }
});


webServer.delete('/delete-request/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const updatedData = await deleteFileObject(id);
        res.json(updatedData);
    } catch (err) {
        console.error('Error deleting request:', err);
        res.status(500).json({ error: 'Failed to delete data' });
    }
});

webServer.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
