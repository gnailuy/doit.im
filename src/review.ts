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

function isReviewResponse(response: puppeteer.Response): boolean {
  return response.url().startsWith('https://i.doit.im/review/daily/20191013') && response.status() === 200
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

async function crawlReviewPage(page: puppeteer.Page): Promise<any> {
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

export async function crawlReview(page: puppeteer.Page, dateStr: string): Promise<any> {
  return await crawlReviewPage(
    await loadReviewPage(page, dateStr));
}
