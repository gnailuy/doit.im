const utils = require('./utils');

async function login(page, user, pass) {
  // URL
  const loginURL = 'https://i.doit.im/signin?original=https%3A%2F%2Fi.doit.im%2Fhome%2F';

  // Open page
  await page.goto(loginURL, {
    waitUntil: 'load'
  });

  // Fill user and pass, click remember me
  await page.$eval('input[name=username]', (el, value) => el.value = value, user);
  await page.$eval('input[name=password]', (el, value) => el.value = value, pass);
  await page.click('input[name="autologin"]');

  // Click submit and wait for redirection
  await page.click('div[class="submit_btn_box"]');
  await page.waitForNavigation({
    'waitUntil': 'load'
  });

  return page;
}

module.exports.login = login;
