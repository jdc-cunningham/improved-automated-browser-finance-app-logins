require('dotenv').config({
  path: __dirname + '/.env'
});

const puppeteer = require('puppeteer');
const { getAuthCode } = require('../../auth-looper.js');

/**
 * this function will visit a url with Puppeteer
 * and run through the interaction steps to login, deal with 2FA if applicable
 * and then get the account balance and write it to a spreadsheet
 * @param {Object} jsonAccountAccessInfo 
 */
const processAccount = async (jsonAccountAccessInfo) => {
  // load site
  const { url, interactions } = jsonAccountAccessInfo;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let interactionStep = 0;

  page.setViewport({ width: 1280, height: 720 });
  await page.goto(url);
  await page.waitForSelector(interactions[0].dom_target);

  // ready to run through interactions
  try {
    const processStep = async (step) => {
      const { type } = step;

      switch (type) {
        case "input":
          await page.$eval(step.dom_target, (el) => el.value = process.env[step.value_lookup]);
          break;
        case "button":
          await page.$eval(step.dom_target, el => el.click());
          break;
        case "2fa":
          if (dom_targets in step) { // multi-radio
            await page.$eval(
              () => document.querySelectorAll(step.dom_targets)[step.which_node].click()
            ); // https://stackoverflow.com/a/55524107/2710227
          } else {
            await page.$eval(step.dom_target, el => el.click());
          }
          break;
        case "2fa input": // special case, requires waiting for code
          // waits for db auth code entry to be present within 10 minute max time frame
          const authCode = await getAuthCode(step["2fa_lookup"]);
          await page.$eval(step.dom_target, (el) => el.value = authCode);
        case "balance target":
          const balance = await page.$eval(step.dom_target, el => el.textContent);

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
        processStep(interactionStep);
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
