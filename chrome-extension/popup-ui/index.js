// the end goal of this interface is to produce a JSON interaction structure
// like sample-account.json

// temporarily store data until done, then inserted into db
let storage = localStorage.getItem('ibfa-temp-store');
storage = storage ? JSON.parse(storage) : {};

// pop-ui interactive elements
const accountUrl = document.getElementById('account-url');
const selectInteraction = document.getElementById('select-interaction-type');
const addInteraction = document.getElementById('add-interaction');
const addedInteractions = document.getElementById('added-interactions');
const addAccount = document.getElementById('add-account');

const renderHtml = (interaction) => {
  console.log(interaction);
  switch (interaction.type) {
    case "input":
      return `<div class="interaction-group">
        <p class="bold">type: ${interaction.type || ""}</p>
        <span>name: <input type="text" value="${interaction.name || ""}"/></span>
        <span>dom target: <input type="text" name="dom_target" value="${interaction.dom_target || ""}"/></span>
        <span>value lookup: <input type="text" name="value_lookup" value="${interaction.value_lookup || ""}"/></span>
      </div>`; // minor duplicate wrapper code
    case "button":
      return `<div class="interaction-group">
        <p class="bold">type: ${interaction.type || ""}</p>
        <span>name: <input type="text" value="${interaction.name || ""}"/></span>
        <span>dom target: <input type="text" name="dom_target" value="${interaction.dom_target || ""}"/></span>
      </div>`;
    case "2fa option":
      // url is not really important here but can be used
      // there is also the possiblity of multi select issue that's problematic on puppeteer side
      return `<div class="interaction-group">
        <p class="bold">type: ${interaction.type || ""}</p>
        <span>url: <input type="text" value="${interaction.url || ""}"/></span>
        <span>dom target: <input type="text" name="dom_target" value="${interaction.dom_target || ""}"/></span>
      </div>`;
    case "2fa input":
      return `<div class="interaction-group">
        <p class="bold">type: ${interaction.type || ""}</p>
        <span>name: <input type="text" value="${interaction.name || ""}"/></span>
        <span>dom target: <input type="text" name="dom_target" value="${interaction.dom_target || ""}"/></span>
        <span>2fa lookup: <input type="text" name="2fa_lookup" value="${interaction.value_lookup || ""}"/></span>
      </div>`;
    case "balance target":
      return `<div class="interaction-group">
        <p class="bold">type: ${interaction.type || ""}</p>
        <span>dom target: <input type="text" name="dom_target" value="${interaction.dom_target || ""}"/></span>
        <span>spreadsheet column: <input type="text" name="2fa_lookup" value="${interaction.spreadsheet_column || ""}"/></span>
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
        storage['interactions'].forEach(interaction => {
          addedInteractions.innerHTML += renderHtml(interaction); // dangerous eg. XSS
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