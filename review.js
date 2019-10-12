async function loadReviewPage(page, dateStr) {
  // URL
  const reviewURL = 'https://i.doit.im/home/#/review/daily/' + dateStr + '/view';

  // Open page
  await page.goto(reviewURL, {
    waitUntil: 'load'
  });

  return page;
}

async function crawlReviewPage(page) {
  // Scrape the review page
  return {};
}

async function crawlReview(page, dateStr) {
  var detail = await crawlReviewPage(
    await loadReviewPage(page, dateStr));
  return detail;
}

module.exports.crawlReview = crawlReview;
