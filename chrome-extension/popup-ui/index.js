// the end goal of this interface is to produce a JSON interaction structure
// like sample-account.json
// interactions is an array but here it's an object due to the id key
// on save it is turned into an array by order of interaction creation

// temporarily store data until done, then inserted into db
let storage = localStorage.getItem('ibfa-temp-store');
storage = storage ? JSON.parse(storage) : {};

// pop-ui interactive elements
const accountUrl = document.getElementById('account-url');
const selectInteraction = document.getElementById('select-interaction-type');
const addInteraction = document.getElementById('add-interaction');
const addedInteractions = document.getElementById('added-interactions');
const addAccount = document.getElementById('add-account');

const sendMessageToInjectedScript = (msg) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, msg, (response) => {
      // not doing anything with response yet
    });
  });
}

// globally bounded event for future elements
// this captures modifications to input elements primarily for interactions
// forms the object and saves, keeps order of interactions
document.addEventListener('keyup', (el) => {
  const parentId = el.target.parentNode.parentNode.id;
  const interactionType = document.getElementById(parentId).getAttribute('data-type');
  console.log('parent id', parentId);

  if (!('interactions' in storage)) {
    storage['interactions'] = {};
  }

  storage['interactions'][parentId] = {
    id: parentId,
    type: interactionType
  };

  switch (interactionType) {
    case "input":
      Array.from(document.getElementById(parentId).getElementsByTagName('INPUT')).forEach(input => {
        storage['interactions'][parentId][input.name] = input.value;
      });
      break;
    case "button":
      Array.from(document.getElementById(parentId).getElementsByTagName('INPUT')).forEach(input => {
        storage['interactions'][parentId][input.name] = input.value;
      });
      break;
    case "2fa option":
      Array.from(document.getElementById(parentId).getElementsByTagName('INPUT')).forEach(input => {
        storage['interactions'][parentId][input.name] = input.value;
      });
      break;
    case "2fa input":
      Array.from(document.getElementById(parentId).getElementsByTagName('INPUT')).forEach(input => {
        storage['interactions'][parentId][input.name] = input.value;
      });
      break;
    case "balance target":
      Array.from(document.getElementById(parentId).getElementsByTagName('INPUT')).forEach(input => {
        storage['interactions'][parentId][input.name] = input.value;
      });
      break;
    default:
      // do nothing
      break;
  }

  saveData();
});

document.addEventListener('click', (el) => {
  if (el.target.nodeName === "BUTTON" && el.target.name === "remove") {
    const parentId = el.target.parentNode.id;
    console.log(parentId, storage);
    delete storage.interactions[parentId];
    document.getElementById(parentId).remove();
    console.log(storage);
    saveData();
  }

  if (el.target.nodeName === "BUTTON" && el.target.name === "element-picker") {
    console.log('pick');
    const parentId = el.target.parentNode.parentNode.id;

    sendMessageToInjectedScript({
      cmd: 'show-hover-element-picker',
      parentId
    });
  }
});

const renderHtml = (interaction) => {
  console.log(interaction);
  switch (interaction.type) {
    case "input":
      return `<div id="${interaction.id || Date.now()}" data-type="input" class="interaction-group">
        <p class="bold">type: ${interaction.type || ""}</p>
        <span>name: <input type="text" name="name" value="${interaction.name || ""}"/></span>
        <span>
          dom target: <input type="text" name="dom_target" value="${interaction.dom_target || ""}"/>
          ${!interaction.dom_target ? `<button type="button" name="element-picker" title="click this then hover over element on website">pick element</button>` : ""}
        </span>
        <span>value lookup: <input type="text" name="value_lookup" value="${interaction.value_lookup || ""}"/></span>
        <button name="remove" type="button">remove</button>
      </div>`; // minor duplicate wrapper code
    case "button":
      return `<div id="${Date.now()}" data-type="button" class="interaction-group">
        <p class="bold">type: ${interaction.type || ""}</p>
        <span>name: <input type="text" name="name" value="${interaction.name || ""}"/></span>
        <span>
          dom target: <input type="text" name="dom_target" value="${interaction.dom_target || ""}"/>
          ${!interaction.dom_target ? `<button type="button" name="element-picker" title="click this then hover over element on website">pick element</button>` : ""}
        </span>
        <button name="remove" type="button">remove</button>
      </div>`;
    case "2fa option":
      // url is not really important here but can be used
      // there is also the possiblity of multi select issue that's problematic on puppeteer side
      return `<div id="${Date.now()}" data-type="2fa option" class="interaction-group">
        <p class="bold">type: ${interaction.type || ""}</p>
        <span>url: <input type="text" name="url" value="${interaction.url || ""}"/></span>
        <span>
          dom target: <input type="text" name="dom_target" value="${interaction.dom_target || ""}"/>
          ${!interaction.dom_target ? `<button type="button" name="element-picker" title="click this then hover over element on website">pick element</button>` : ""}
        </span>
        <button name="remove" type="button">remove</button>
      </div>`;
    case "2fa input":
      return `<div id="${Date.now()}" data-type="2fa input" class="interaction-group">
        <p class="bold">type: ${interaction.type || ""}</p>
        <span>name: <input type="text" name="name" value="${interaction.name || ""}"/></span>
        <span>
          dom target: <input type="text" name="dom_target" value="${interaction.dom_target || ""}"/>
          ${!interaction.dom_target ? `<button type="button" name="element-picker" title="click this then hover over element on website">pick element</button>` : ""}
        </span>
        <span>2fa lookup: <input type="text" name="2fa_lookup" value="${interaction.value_lookup || ""}"/></span>
        <button name="remove" type="button">remove</button>
      </div>`;
    case "balance target":
      return `<div id="${Date.now()}" data-type="balance target" class="interaction-group">
        <p class="bold">type: ${interaction.type || ""}</p>
        <span>
          dom target: <input type="text" name="dom_target" value="${interaction.dom_target || ""}"/>
          ${!interaction.dom_target ? `<button type="button" name="element-picker" title="click this then hover over element on website">pick element</button>` : ""}
        </span>
        <span>spreadsheet column: <input type="text" name="2fa_lookup" value="${interaction.spreadsheet_column || ""}"/></span>
        <button name="remove" type="button">remove</button>
      </div>`;
    default:
      return '<p class="bold">Unknown type</p>';
  }
}

const loadData = () => {
  if (Object.keys(storage).length) {
    Object.keys(storage).forEach(key => {
      if (key === 'url') {
        accountUrl.value = storage[key];
      } else if (key === 'interactions') {
        // assumes only interactions
        Object.keys(storage.interactions).forEach(interactionId => {
          addedInteractions.innerHTML += renderHtml(storage.interactions[interactionId]); // dangerous eg. XSS
        });
      }
    });
  }
};

loadData();

const saveData = () => {
  localStorage.setItem('ibfa-temp-store', JSON.stringify(storage));
}

// could add more but paste makes sense
accountUrl.addEventListener('paste', (e) => {
  console.log('paste');
  storage['url'] = e.clipboardData.getData('text/plain');
  saveData();
});

addInteraction.addEventListener('click', () => {
  const selectedInteraction = selectInteraction.value;

  addedInteractions.innerHTML += renderHtml({ // jank object due to shared renderer
    type: selectedInteraction
  });
});

// receive from dom-interaction.js
chrome.runtime.onMessage.addListener((request, sender, callback) => {
  const msg = request;
  
  if (msg?.elementPath) {
    // validate what it is and clean, also do it on server side
    console.log(msg);
    document.getElementsById(msg.parentId).querySelector('input[name=dom_target]').value = msg.elementPath;
  }

  // have to call this to avoid error
  callback('poup-ui ack');
});