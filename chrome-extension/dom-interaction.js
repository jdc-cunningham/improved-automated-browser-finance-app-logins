let elementPickEnabled = false;
let parentId = "";
let type = "";

// expects object
const sendMessageToExtension = (msg) => {
  chrome.runtime.sendMessage(msg);
}

// receive messages from chrome extension icon
// primary to hide/show the injected UI
chrome.runtime.onMessage.addListener((request, sender, callback) => {
  const msg = request;

  if (msg?.cmd) {
    if (msg.cmd === 'show-hover-element-picker') {
      elementPickEnabled = true;
      parentId = msg.parentId;
      type = msg.type;
    }
  }

  // have to call this to avoid error
  callback('dom ack');
});

// this is for document.querySelector for puppeteer to use
const domPathFinder = (el) => {
  const elementString = el.outerHTML;
  let tag = 'input';

  if (elementString.indexOf('<button') !== -1) {
    tag = 'button';
  }

  if (elementString.indexOf('<span') !== -1) {
    tag = 'span';
  }

  
  if (elementString.indexOf('<a') !== -1) {
    tag = 'a';
  }

  if (elementString.indexOf('id') !== -1) {
    return `${tag}#${el.id}`;
  } else {
    return `${tag}.${Array.from(el.classList).join('.')}`;
  }
}

document.addEventListener('mouseover', (el) => {
  if (elementPickEnabled) {
    el.target.style.border = "2px solid red";
  }
});

document.addEventListener('mouseout', (el) => {
  if (elementPickEnabled) {
    el.target.style.border = "";
  }
});

document.addEventListener('click', (el) => {
  if (elementPickEnabled) {
    // determine unique selector for element
    el.target.style.border = "";
    elementPickEnabled = false;

    sendMessageToExtension({
      elementPath: domPathFinder(el.target),
      parentId,
      type
    });

    // reset
    parentId = "";
    type = "";
  }
});