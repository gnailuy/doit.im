import { launch } from 'puppeteer';
import { option } from 'yargs';

import { crawl_task_list, crawl_task } from './task';
import { crawl_review } from './review';

import { sleep, randomNumber } from './utils';

const argv = option('debug', {
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
}).argv

async function saveTasks(page, start, end) {
  // Foreach month between start and end
  // Get task list of that month
  // Foreach task
  // Save the task details
  var items = await crawl_task_list(page, month);
  if (argv.debug) {
    console.log(JSON.stringify(items, null, 4));
  }
  console.log('Loaded task list for ' + month + ', totally ' + items.length + ' tasks to scrape');

  // Loop over tasks in one page
  for (let i = 0; i < items.length; i++) {
    try {
      var exchangeURL = items[i]['href'];
      var d = await ___run(page, exchangeURL, 'exchange');
      items[i]['details'] = d;

      // Insert to mongo
      upsertItem(items[i], exchangeSchema);

      if (argv.debug) {
        console.log(JSON.stringify(items[i], null, 4));
      }
      console.log('Inserted: ' + items[i].name + ' @ ' + items[i].href);
    } catch (e) {
      console.log(e);
      console.log('Error: ' + items[i].name + ' @ ' + items[i].href);
    }
    await sleep(randomNumber(1000, 2000));
  }

  return items;
}

async function saveReviews(page, start, end) {
  // Foreach day between start and end
  // Save the daily review of the day
}

async function run() {
  // Open browser and set window size
  const browser = await launch({
    headless: !argv.debug,
    ignoreHTTPSErrors: true // doit.im certification is expired
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(120000);
  page.setViewport({
    width: 1200,
    height: 800
  });

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
