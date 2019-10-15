import puppeteer from 'puppeteer'

export default async function login(page: puppeteer.Page, user: string, pass: string): Promise<puppeteer.Page> {
  // URL
  const loginURL: string = 'https://i.doit.im/signin?original=https%3A%2F%2Fi.doit.im%2Fhome%2F';

  // Open page
  await page.goto(loginURL, {
    waitUntil: 'load'
  });

  // Fill user and pass, click remember me
  await page.$eval('input[name=username]', (el: Element, value: string) => el.setAttribute('value', value), user);
  await page.$eval('input[name=password]', (el: Element, value: string) => el.setAttribute('value', value), pass);
  await page.click('input[name="autologin"]');

  // Click submit and wait for redirection
  await page.click('div[class="submit_btn_box"]');
  await page.waitForNavigation({
    'waitUntil': 'load'
  });

  return page;
}
