import puppeteer from 'puppeteer';

async function loadReviewPage(page: puppeteer.Page, dateStr: string): Promise<puppeteer.Page> {
  // URL
  const reviewURL = 'https://i.doit.im/home/#/review/daily/' + dateStr + '/view';

  // Open page
  await page.goto(reviewURL, {
    waitUntil: 'load'
  });

  return page;
}

async function crawlReviewPage(page: puppeteer.Page): Promise<any> {
  // Scrape the review page
  return {};
}

export async function crawlReview(page: puppeteer.Page, dateStr: string): Promise<any> {
  return await crawlReviewPage(
    await loadReviewPage(page, dateStr));
}
