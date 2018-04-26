const puppeteer = require('puppeteer');
const { expect } = require('chai');

const _ = require('lodash');
const globalVariables = _.pick(global, ['browser', 'expect']);


// expose variables
before (async function () {
  global.expect = expect;
  global.browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
});

after (function () {
  browser.close();

  global.browser = globalVariables.browser;
  global.expect = globalVariables.expect;
});

describe('camicrosope Viewer', function () {
  let page;

  before (async function () {
    page = await browser.newPage();
    await page.goto('http://localhost:3000/osdCamicroscope.php?tissueId=TESTING');
  });

  after (async function () {
    await page.close();
  })

  it('should have the toolbar', async function () {
    expect(await page.$("#tool")).to.exist;
  });
});
