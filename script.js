const chromeLauncher = require('chrome-launcher');
const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const {URL} = require('url');

let launchBrowser = async () => {
  return await puppeteer.launch({
    defaultViewport: null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
};

let login = async (browser, host, path, username, password) => {
  const page = await browser.newPage();
  await page.goto(host+path, {waitUntil: 'load'});
  await page.type('input[name=username]', username);
  await page.type('input[name=password]', password);
  await page.click('button[type=submit]');
  await page.waitForNavigation({waitUntil: 'domcontentloaded'});
  await page.close();
};

let runTest = async (browser, host, path) => {
  return await lighthouse(host+path, {
    port: (new URL(browser.wsEndpoint())).port,
    output: ['json','html'],
    disableDeviceEmulation: true,
    logLevel: 'info',
    throttlingMethod: 'provided',
  });
};


(async (req, res) => {
  const host = 'https://example.com';
  const loginPath = '/login';
  const testPath = '/users';
  const username = 'foo';
  const password = 'bar';

  const browser = await launchBrowser();
  await login(browser, host, loginPath, username, password); // if you need to login
  const {lhr, report} = await runTest(browser, host, testPath);
  console.log(lhr);
  const html = report[1];
  console.log(html);
  if(browser){
    await browser.close();
  }
})();
