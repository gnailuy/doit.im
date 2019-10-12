const utils = require('./utils');

async function login(page, user, pass) {
  // URL
  const loginURL = 'https://i.doit.im/signin?original=https%3A%2F%2Fi.doit.im%2Fhome%2F';

  // Open page
  await page.goto(loginURL, {
    waitUntil: 'load'
  });

  // Fill user and pass, click remember me, then submit
  await page.$eval('input[name=username]', (el, value) => el.value = value, user);
  await page.$eval('input[name=password]', (el, value) => el.value = value, pass);

  const checkbox = await page.$('input[name="autologin"]');
  await checkbox.click();

  const submit = await page.$('input[type="submit"]');
  await submit.click();

  // Wait for redirection
  await page.waitForNavigation({
    'waitUntil': 'load'
  });

  return page;
}

module.exports.login = login;
