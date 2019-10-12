// Scroll down to load the whole page
async function loadWholePage(page) {
  await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 600;
      var timer = setInterval(() => {
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

function randomNumber(start = 0, end = 10) {
  return start + Math.floor(Math.random() * (end - start + 1)); // [start, end]
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

function firstDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

module.exports.loadWholePage = loadWholePage;
module.exports.randomNumber = randomNumber;
module.exports.sleep = sleep;
