const argv = require('yargs').option('debug', {
  alias: 'd',
  default: false
}).option('task', {
  alias: 't',
  default: false
}).option('review', {
  alias: 'r',
  default: false
}).option('start', {
  alias: 's',
  default: '2014-01-01'
}).option('end', {
  alias: 'e',
  default: '2019-12-01'
}).option('username', {
  alias: 'u',
  default: 'username@example.com'
}).option('password', {
  alias: 'p',
  default: 'password'
}).argv

const puppeteer = require('puppeteer');

const login = require('./login');
const review = require('./review');
const task = require('./task');
const utils = require('./utils');

async function saveTasks(page, start, end) {
  // Foreach month between start and end
  // Get task list of that month
  // Foreach task
  // Save the task details
  // Loop over tasks in one page
}

async function saveReviews(page, start, end) {
  // Foreach day between start and end
  // Save the daily review of the day
}

async function run() {
  // Open browser and set window size
  const browser = await puppeteer.launch({
    headless: !argv.debug,
    ignoreHTTPSErrors: true // doit.im certification is expired
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(120000);
  page.setViewport({
    width: 1200,
    height: 800
  });

  // Login
  await login.login(page, argv.username, argv.password)
  await sleep(randomNumber(1000, 2000));

  // Crawl and save data
  try {
    if (argv.task) {
      var tasks = await saveTasks(page, argv.start, argv.end);
      console.log('Tasks finished: ' + tasks.length);
    }
    if (argv.review) {
      var reviews = await saveReviews(page, argv.start, argv.end);
      console.log('Reviews finished: ' + reviews.length);
    }
    console.log('All done.');
  } catch (e) {
    console.log(e);
  } finally {
    await page.close();
    browser.close();
  }
}

run().catch((e) => {
  console.log(e);
  process.exit(-1);
});
