import puppeteer from 'puppeteer';

import * as utils from "./utils";

export async function loadReviewPage(page: puppeteer.Page, dateStr: string): Promise<puppeteer.Page> {
  // URL
  const reviewURL = 'https://i.doit.im/home/#/review/daily/' + dateStr + '/view';

  // Open page
  await page.goto(reviewURL, {
    waitUntil: 'load'
  });

  return page;
}

export async function goToPreviousDay(page: puppeteer.Page): Promise<puppeteer.Page> {
  // Click the Prev arrow
  await page.click('#review_daily > div > div.review-title > div.inner > div > div.prev-day');

  // Load the whole page
  await utils.loadWholePage(page);

  return page;
}

function isReviewResponse(response: puppeteer.Response): boolean {
  // URL Example: https://i.doit.im/review/daily/20191012?_=1571305092610
  let reviewRegex: RegExp = /https:\/\/i.doit.im\/review\/daily\/[0-9]{8}?_=[0-9]*/g
  return reviewRegex.test(response.url()) && response.status() === 200;
}

function evaluateReviewPage(review: any): any {
  const starsSelector = '#review_daily > div > div.review-daily > div > div.review-result > div.scores > div > div.star.star-2';

  if (!review || 'notes' !in review) {
    return {
      stars: document.querySelectorAll(starsSelector).length,
    };
  } else {
    return {
      stars: document.querySelectorAll(starsSelector).length,
      notes: review.notes,
      created: review.created,
      updated: review.updated,
    };
  }
}

export async function crawlReviewPage(page: puppeteer.Page): Promise<any> {
  // Wait for the review response to return
  let review: any = undefined;
  try {
    let reviewResponse: puppeteer.Response = await page.waitForResponse(isReviewResponse, {
      timeout: 5000
    });
    review = await reviewResponse.json();
  } catch (_) { }

  return await page.evaluate(evaluateReviewPage, review);
}
