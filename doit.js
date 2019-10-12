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
}).option('output', {
  alias: 'o',
  default: './output'
}).option('username', {
  alias: 'u',
  default: 'username@example.com'
}).option('password', {
  alias: 'p',
  default: 'password'
}).argv

const fs = require('fs')
const puppeteer = require('puppeteer');
const moment = require('moment');

const login = require('./login');
const review = require('./review');
const task = require('./task');
const utils = require('./utils');

async function saveTasks(page, startDate, endDate) {
  var taskList = [];
  var taskDetailList = [];

  // Foreach month between start and end
  page = await task.loadTaskListPage(page, endDate.getTime());
  for (var d = new Date(endDate); d >= startDate; d.setMonth(d.getMonth() - 1)) {
    console.log('Crawling tasks of month: ' + moment(d).format('YYYYMM'));
    var monthList = await task.crawlTaskList(page);
    taskList.push(...monthList);

    await utils.sleep(utils.randomNumber(1000, 2000));
    await task.goToPreviousMonth(page);
  }

  try {
    var logger = fs.createWriteStream(argv.output + '.tasks.json', {
      flags: 'a' // appending
    })

    for (i in taskList) {
      var t = taskList[i];
      console.log('Crawling task: ' + t['id']);

      var taskDetail = await task.crawlTask(page, t);
      taskDetailList.push(taskDetail);
      logger.write(JSON.stringify(taskDetail, null, 0) + '\n');

      await utils.sleep(utils.randomNumber(1000, 2000));
    }
  } finally {
    logger.end();
  }

  return taskDetailList;
}

async function saveReviews(page, startDate, endDate) {
  var reviews = [];

  // Foreach day between start and end
  for (var d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    console.log(moment(d).format('YYYYMMDD'));
    // Save the daily review of the day
  }

  return reviews;
}

async function run(startDate, endDate) {
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

  // Crawl and save data
  try {
    if (argv.task) {
      console.log('Crawling tasks ...');
      var tasks = await saveTasks(page, startDate, endDate);
      console.log('Tasks finished: ' + tasks.length);
    }
    if (argv.review) {
      console.log('Crawling reviews ...');
      var reviews = await saveReviews(page, startDate, endDate);
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

// From start date to today; doit.im uses Beijing time
run(new Date(Date.parse(argv.start + 'T00:00:00+08:00')),
    new Date(Date.parse(moment(new Date()).format('YYYY-MM-DD') + 'T00:00:00+08:00'))).catch((e) => {
  console.log(e);
  process.exit(-1);
});
