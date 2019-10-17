import puppeteer from 'puppeteer'

export async function launchBrowser(debug: boolean = false, devtools: boolean = false): Promise<puppeteer.Browser> {
  // Open browser
  return await puppeteer.launch({
    headless: !debug,
    devtools: devtools,
  });
}

export async function createNewPage(browser: puppeteer.Browser): Promise<puppeteer.Page> {
  // Create new page and set window size
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(120000);
  page.setViewport({
    width: 1200,
    height: 800,
  });

  return page;
}

// Scroll down to load the whole page
export async function loadWholePage(page: puppeteer.Page): Promise<any> {
  await page.evaluate(() => {
    return new Promise((resolve, _) => {
      let totalHeight: number = 0;
      let distance: number = 600;
      let timer: NodeJS.Timeout = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          window.scrollTo(0, 0);
          clearInterval(timer);
          resolve();
        }
      }, 500);
    })
  });
}

export function randomNumber(start: number = 0, end: number = 10): number {
  return start + Math.floor(Math.random() * (end - start + 1)); // [start, end]
}

export function sleep(ms: number): Promise<any> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  })
}
