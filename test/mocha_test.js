const puppeteer = require('puppeteer');
const { expect } = require('chai');

const _ = require('lodash');
const globalVariables = _.pick(global, ['browser', 'expect']);

// puppeteer options
const opts = {
  headless: false,
  slowMo: 100,
  timeout: 10000
};

// expose variables
before (async function () {
  global.expect = expect;
  global.browser = await puppeteer.launch(opts);
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

  it('should have the correct page title', async function () {
    expect(await page.title()).to.eql('Puppeteer Mocha');
  });

  it('should have the toolbar', async function () {
    expect(await paige.$("#tool")).to.exist;
  });
});
