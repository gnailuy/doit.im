import fs from 'fs';
import moment from 'moment';
import puppeteer from 'puppeteer';
import yargs from 'yargs'

import login from './login';
import * as review from './review';
import * as task from './task';
import * as utils from './utils';

let argv: yargs.Arguments = yargs.option('debug', {
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
}).option('help', {
  alias: 'h',
  default: false
}).argv;

async function saveTasks(page: puppeteer.Page, startDate: Date, endDate: Date): Promise<Array<any>> {
  let taskList: Array<any> = [];
  let taskDetailList: Array<any> = [];

  // Foreach month between start and end
  page = await task.loadTaskListPage(page, endDate.getTime());
  for (let d: Date = new Date(endDate); d >= startDate; d.setMonth(d.getMonth() - 1)) {
    console.log('Crawling tasks of month: ' + moment(d).format('YYYYMM'));
    let monthList: Array<any> = await task.crawlTaskList(page);
    taskList.push(...monthList);

    await utils.sleep(utils.randomNumber(1000, 2000));
    await task.goToPreviousMonth(page);
  }

  let logger: fs.WriteStream | undefined = undefined;
  try {
    logger = fs.createWriteStream(argv.output + '.tasks.json', {
      flags: 'a' // appending
    })

    for (let t of taskList) {
      console.log('Crawling task: ' + t.id);

      let taskDetail: any = await task.crawlTask(page, t);
      if (taskDetail !== null) {
        taskDetailList.push(taskDetail);
        logger.write(JSON.stringify(taskDetail, null, 0) + '\n');
      } else {
        console.log('Task ' + t.id + ' is of unknown type');
      }

      await utils.sleep(utils.randomNumber(1000, 2000));
    }
  } finally {
    if (logger) {
      logger.end();
    }
  }

  return taskDetailList;
}

async function saveReviews(page: puppeteer.Page, startDate: Date, endDate: Date): Promise<Array<any>> {
  let reviews: Array<any> = [];

  // Foreach day between start and end
  for (let d: Date = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    console.log(moment(d).format('YYYYMMDD'));
    // Save the daily review of the day
  }

  return reviews;
}

async function run(startDate: Date, endDate: Date): Promise<any> {
  // Open browser and set window size
  const browser = await puppeteer.launch({
    headless: !argv.debug,
    // ignoreHTTPSErrors: true,
    // devtools: true,
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(120000);
  page.setViewport({
    width: 1200,
    height: 800
  });

  // Login
  await login(page, argv.username, argv.password)

  // Crawl and save data
  try {
    if (argv.task) {
      console.log('Crawling tasks ...');
      let tasks: Array<any> = await saveTasks(page, startDate, endDate);
      console.log('Tasks finished: ' + tasks.length);
    }
    if (argv.review) {
      console.log('Crawling reviews ...');
      let reviews: Array<any> = await saveReviews(page, startDate, endDate);
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

if (argv.help) {
  yargs.showHelp();
  process.exit(0);
}

// From start date to today; doit.im uses Beijing time
run(
  new Date(Date.parse(argv.start + 'T00:00:00+08:00')),
  new Date(Date.parse(moment(new Date()).format('YYYY-MM-DD') + 'T00:00:00+08:00'))
  ).catch((e) => {
  console.log(e);
  process.exit(-1);
});
