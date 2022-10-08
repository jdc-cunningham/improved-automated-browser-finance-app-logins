require('dotenv').config({
  path: __dirname + '/.env'
});

const puppeteer = require('puppeteer');
const { getAuthCode } = require('./auth-looper');

// https://stackoverflow.com/a/46965281/2710227
const delay = (time) => {
  return new Promise(function(resolve) { 
    setTimeout(resolve, time)
  });
}

const takeScreenshot = async () => {
  await page.screenshot({
    path: "./screenshot.png",
    fullPage: true
  });
}

/**
 * this function will visit a url with Puppeteer
 * and run through the interaction steps to login, deal with 2FA if applicable
 * and then get the account balance and write it to a spreadsheet
 * @param {Object} jsonAccountAccessInfo 
 */
const processAccount = async (jsonAccountAccessInfo) => {
  // load site
  const { url, interactions, captcha } = jsonAccountAccessInfo;

  const browser = await puppeteer.launch({
    headless: !captcha,
    dumpio: false // if you want to see website's console log, interesting
    // https://stackoverflow.com/a/60747187/2710227
  });

  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 720 });

  await page.goto(url);
  await page.waitForSelector(interactions[0].dom_target);

  // console.log output from inside page.evaluate
  // https://stackoverflow.com/a/46245945/2710227
  page.on('console', async (msg) => {
    const msgArgs = msg.args();

    console.log('remote page console logs');

    for (let i = 0; i < msgArgs.length; ++i) {
      console.log(await msgArgs[i].jsonValue());
    }
  });

  let interactionStep = 0;

  // ready to run through interactions
  try {
    const processStep = async (step) => {
      const { type } = step;

      switch (type) {
        case "input":
          // there is a difference between page.$eval and page.evaluate
          await page.type(step.dom_target, process.env[step.value_lookup]);
          break;
        case "button":
          await page.evaluate(
            (step) => { document.querySelector(step.dom_target).click() },
            step
          );
          await delay(10000); // time to deal with captcha, captcha not always applicable
          break;
        case "2fa":
          if ("dom_targets" in step) { // multi-radio
            await page.waitForSelector(step.dom_targets);
            // this is not working, doesn't click
            // have tried querySelectorAll as well
            Array.from(await page.$$(step.dom_targets)).forEach((index, radio) => {
              if (index === step.which_node) {
                radio.click();
              }
            });
          } else {
            await page.waitForSelector(step.dom_target);
            await page.evaluate(
              (step) => { document.querySelector(step.dom_target).click() },
              step
            );
          }
          break;
        case "2fa input": // special case, requires waiting for code
          // waits for db auth code entry to be present within 10 minute max time frame
          let attempts = 0;
          const authCode = await getAuthCode(attempts, step["2fa_lookup"]);
          await page.type(step.dom_target, authCode.toString());
          break;
        case "balance target":
          const balance = await page.evaluate(
            (step) => { document.querySelector(step.dom_target).innerText },
            step
          );

          return {
            balance,
            column: step.spreadsheet_column,
            err: false
          };
        default:
          throw 'unknown interaction';
      }

      interactionStep += 1;

      if (interactionStep < interactions.length) {
        processStep(interactions[interactionStep]);
      }
    };

    return await processStep(interactions[interactionStep]);
  } catch (e) {
    return {
      err: true
    };
  }
};

module.exports = {
  processAccount
};
