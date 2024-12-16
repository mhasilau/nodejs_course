// Получение нужных элементов
// Блоки
const savedMethodsDiv = document.querySelector('.saved-methods')
const reqBodyDiv = document.querySelector('.req-body')
const reqParamsDiv = document.querySelector('.req-params')
const reqHeadersDiv = document.querySelector('.req-headers')

const paramsDiv = document.querySelector('.params')
const headersDiv = document.querySelector('.headers')
const responseDiv = document.querySelector('.response')

// Кнопки и элементы
const httpMethodSelect = document.getElementById('http-method');
const httpUrl = document.getElementById('req-url');
const httpBody = document.getElementById('req-body');

const addHeaderButton = document.querySelector('#add-header');
const addParamButton = document.querySelector('#add-param');

const saveBtn = document.querySelector('#save');
const submitBtn = document.querySelector('#submit');
const cleanBtn = document.querySelector('#clean');

const loading = document.querySelector('.loading');
loading.style.display = 'none';


let methodSelect;
httpMethodSelect.onchange = () => {
    methodSelect = httpMethodSelect.value;

    if (methodSelect) {
        showParams()
    }

    switch (methodSelect) {
        case 'GET':
            reqBodyDiv.style.display = 'none'
            break;

        case 'POST':
            reqBodyDiv.style.display = 'block'
            break;

        case 'PUT':
            reqBodyDiv.style.display = 'block'
            break;

        case 'DELETE':
            reqBodyDiv.style.display = 'none'
            break;

        default:
            break;
    }
}

hideParams()

function hideParams() {
    reqBodyDiv.style.display = 'none'
    reqParamsDiv.style.display = 'none'
    reqHeadersDiv.style.display = 'none'
}

function showParams() {
    reqBodyDiv.style.display = 'block'
    reqParamsDiv.style.display = 'block'
    reqHeadersDiv.style.display = 'block'
}

addParamButton.onclick = () => {
    const newRow = addNewParams();
    paramsDiv.appendChild(newRow);
}

function addNewParams() {
    const row = document.createElement('div');
    row.className = 'param w-100';
    row.innerHTML = `
      <input type="text" class="w-40" placeholder="limit">
      <input type="text" class="w-40" placeholder="100">
                <button id="del-param" class="request-btn delete-btn">Удалить</button>
    `;

    const deleteButton = row.querySelector('#del-param');
    deleteButton.addEventListener('click', () => row.remove());

    return row;
}

addHeaderButton.onclick = () => {
    const newRow = addNewHeaders();
    headersDiv.appendChild(newRow);
}

function addNewHeaders() {
    const row = document.createElement('div');
    row.className = 'header w-100';
    row.innerHTML = `
                <select id="http-header" class="w-40">
                    <option value="" disabled selected>Выберите заголовок</option>
                    <option value="Accept">Accept</option>
                    <option value="Content-Type">Content-Type</option>
                </select>
                <input type="text" class="w-40">
                <button id="del-header" class="request-btn delete-btn">Удалить</button>
    `;

    const deleteButton = row.querySelector('#del-header');
    deleteButton.addEventListener('click', () => row.remove());

    return row;
}


function collectAndSubmitData(todo) {

    let body = httpBody.value ? JSON.parse(httpBody.value) : '{}'

    const requestData = {
        method: httpMethodSelect.value,
        url: httpUrl.value,
        body: body,
        params: {},
        headers: {}
    };

    const paramsReq = {}
    // Collect params
    const paramRows = paramsDiv.querySelectorAll('.param');
    paramRows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        if (inputs[0].value && inputs[1].value) {
            const paramKey = inputs[0].value
            const paramValue = inputs[1].value
            paramsReq[paramKey] = paramValue
        }
    });
    requestData.params = paramsReq;

    const headersReq = {}
    // Collect headers
    const headerRows = headersDiv.querySelectorAll('.header');
    headerRows.forEach(row => {

        const select = row.querySelector('select');
        const input = row.querySelector('input');

        if (select.value && input.value) {
            const headerKey = select.value
            const headerValue = input.value
            headersReq[headerKey] = headerValue
        }
    });
    requestData.headers = headersReq
    requestData.id = new Date().getTime()

    switch (todo) {
        case 'POST':
            sendRequest(requestData)
            break;
        case 'SAVE':
            saveRequest(requestData)
            break;
    }
}

submitBtn.onclick = () => collectAndSubmitData('POST')
saveBtn.onclick = () => collectAndSubmitData('SAVE')
cleanBtn.onclick = clearForm;

function clearForm() {
  httpMethodSelect.selectedIndex = 0;
  httpUrl.value = '';
  httpBody.value = '';
  paramsDiv.innerHTML = '';
  headersDiv.innerHTML = '';
  responseDiv.innerHTML = ''

  hideParams();

  reqBodyDiv.style.display = 'none';
}

function sendRequest(data) {
    loading.style.display = 'flex';
    console.log(data)
    responseDiv.innerHTML = ''

    fetch('/request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'  // Set the correct content type
        },
        body: JSON.stringify(data)
    }).then(res => res.json()).then(res => {
        renderResponseData(res)
        console.log(res)
    }).catch(error => console.error('Ошибка:', error))
    .finally(() => loading.style.display = 'none' );
}

function renderResponseData(data) {
    console.log(data);
    console.log(data.ok)
    responseDiv.innerHTML = '';

    // Create and append response header
    const h2 = document.createElement('h2');
    h2.innerHTML = `Ответ на запрос`;
    responseDiv.appendChild(h2);

    if(!data.info.status) {


        // Create and append status
        const error = document.createElement('h5');
        error.innerHTML = `Статус ответа ${data.error}`;
        responseDiv.appendChild(error);

        // Create and append message
        const message = document.createElement('h5');
        message.innerHTML = `Сообщение: <span>${data.details}</span>`;
        responseDiv.appendChild(message);
        return
    }


    // Create and append status
    const status = document.createElement('h5');
    status.innerHTML = `Статус ответа ${data.info.status}`;
    responseDiv.appendChild(status);

    // Create and append message
    const message = document.createElement('h5');
    message.innerHTML = `Сообщение: <span>${data.info.message}</span>`;
    responseDiv.appendChild(message);

    // Create and append headers
    const headers = document.createElement('div');
    headers.classList.add('res-headers');
    const ul = document.createElement('ul');
    for (let header in data.headers) {
        const li = document.createElement('li');
        li.innerText = `${header}: ${data.headers[header]}`;
        ul.appendChild(li);
    }
    headers.appendChild(ul);
    responseDiv.appendChild(headers);

    // Create and append body
    const bodyDiv = document.createElement('div');
    bodyDiv.classList.add('res-body');
    const body_h5 = document.createElement('h5');
    body_h5.innerHTML = 'Тело ответа:';
    bodyDiv.appendChild(body_h5);

    const contentType = data.headers['content-type'] || '';

    try {

        if (contentType.includes('image')) {
            const img = document.createElement('img');
            img.src = `data:${contentType};base64,${data.body}`;
            img.alt = 'Response Image';
            img.style.maxWidth = '100%';
            bodyDiv.appendChild(img);
        } else if (contentType.includes('json')) {
            const decodedBody = atob(data.body);
            const pre = document.createElement('pre');
            pre.innerText = JSON.stringify(JSON.parse(decodedBody), null, 2);
            bodyDiv.appendChild(pre);
        } else if (contentType.includes('css')) {
            const textarea = document.createElement('textarea');
            textarea.value = data.body;
            textarea.classList.add('w-100');
            textarea.readOnly = true;
            bodyDiv.appendChild(textarea);
        } else if (contentType.includes('text')) {
            const decodedBody = atob(data.body);
            const textarea = document.createElement('textarea');
            textarea.value = decodedBody;
            textarea.classList.add('w-100');
            textarea.readOnly = true;
            bodyDiv.appendChild(textarea);
        } else {
            const pre = document.createElement('pre');
            pre.innerText = decodedBody;
            bodyDiv.appendChild(pre);
        }
    } catch (error) {
        console.error('Error decoding or parsing response body:', error);
        const errorMsg = document.createElement('p');
        errorMsg.innerText = 'Error displaying response body. See console for details.';
        bodyDiv.appendChild(errorMsg);
    }

    responseDiv.appendChild(bodyDiv);
}

document.querySelectorAll('.save-submit').forEach(button => {
    button.addEventListener('click', async function () {
        const request = this.dataset.request;
        console.log('save',request)
        await getSavedReqById(request)
    });
});

document.querySelectorAll('.delete-save-method').forEach(button => {
    button.addEventListener('click', async function () {
        const requestId = this.dataset.request;
        console.log('Deleting Request ID:', requestId);
        await deleteSavedRequest(requestId);
    });
});

async function getSavedReqById(id) {
    fetch(`/request/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'  // Set the correct content type
        },
    }).then(res => res.json()).then(res => sendRequest(res))
}

function saveRequest(data) {
    loading.style.display = 'flex';

    fetch('/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'  // Set the correct content type
        },
        body: JSON.stringify(data)
    })
        .catch(error => console.error('Ошибка:', error))
        .finally(() => loading.style.display = 'none' );
}

function deleteSavedRequest(id) {
    return fetch(`/delete-request/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(res => res.json())
        .then(res => {
            console.log('Deleted:', res);
            // Обновите UI после успешного удаления
            location.reload(); // Или используйте более элегантный способ обновления списка
        })
        .catch(error => console.error('Error deleting request:', error));
}

