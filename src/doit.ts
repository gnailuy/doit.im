import fs from 'fs';
import moment from 'moment';
import puppeteer from 'puppeteer';
import yargs from 'yargs'

import login from './login';
import * as review from './review';
import * as task from './task';
import * as utils from './utils';

async function saveTasks(page: puppeteer.Page, startDate: Date, endDate: Date, prefix: string): Promise<Array<any>> {
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
    logger = fs.createWriteStream(prefix + '.tasks.json', {
      flags: 'a', // appending
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

async function saveSomeday(page: puppeteer.Page, prefix: string): Promise<Array<any>> {
  let taskDetailList: Array<any> = [];

  page = await task.loadSomedayPage(page);
  console.log('Crawling tasks from someday box');
  let taskList: Array<any> = await task.crawlTaskList(page);
  await utils.sleep(utils.randomNumber(1000, 2000));

  let logger: fs.WriteStream | undefined = undefined;
  try {
    logger = fs.createWriteStream(prefix + '.someday.json', {
      flags: 'a', // appending
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

async function saveReviews(page: puppeteer.Page, startDate: Date, endDate: Date, prefix: string): Promise<Array<any>> {
  let reviewDetailList: Array<any> = [];

  let logger: fs.WriteStream | undefined = undefined;
  try {
    logger = fs.createWriteStream(prefix + '.reviews.json', {
      flags: 'a', // appending
    })

    // Foreach day between start and end
    page = await review.loadReviewPage(page, moment(endDate).format('YYYYMMDD'));
    for (let d: Date = new Date(endDate); d >= startDate; d.setDate(d.getDate() - 1)) {
      let dStr: string = moment(d).format('YYYYMMDD');
      console.log('Crawling daily review of date: ' + dStr);

      let reviewDetail: any = await review.crawlReviewPage(page, dStr);
      if (reviewDetail !== null) {
        reviewDetailList.push(reviewDetail);
        logger.write(JSON.stringify(reviewDetail, null, 0) + '\n');
      } else {
        console.log('Daily review of date ' + dStr + ' is unknown');
      }

      await utils.sleep(utils.randomNumber(1000, 2000));
      await review.goToPreviousDay(page);
    }
  } finally {
    if (logger) {
      logger.end();
    }
  }

  return reviewDetailList;
}

async function run(argv: any, type: string = 'task'): Promise<any> {
  // From start date to today; doit.im uses Beijing time
  let startDate: Date = new Date(Date.parse(argv.start + 'T00:00:00+08:00'));
  let endDate: Date = new Date(Date.parse(moment(new Date()).format('YYYY-MM-DD') + 'T00:00:00+08:00'));

  // Init browser and page
  let browser: puppeteer.Browser = await utils.launchBrowser(argv.debug);
  let page: puppeteer.Page = await utils.createNewPage(browser);

  // Login
  await login(page, argv.username, argv.password);

  // Crawl and save data
  try {
    switch (type) {
      case 'task': {
        console.log('Crawling tasks ...');
        let tasks: Array<any> = await saveTasks(page, startDate, endDate, argv.output);
        console.log('Tasks finished: ' + tasks.length);
      }
      case 'someday': {
        console.log('Crawling someday box ...');
        let tasks: Array<any> = await saveSomeday(page, argv.output);
        console.log('Someday box finished: ' + tasks.length);
      }
      case 'review': {
        console.log('Crawling reviews ...');
        let reviews: Array<any> = await saveReviews(page, startDate, endDate, argv.output);
        console.log('Reviews finished: ' + reviews.length);
      }
    }
  } catch (e) {
    console.log(e);
  } finally {
    await page.close();
    browser.close();
  }
}

yargs.showHelpOnFail(true).demandCommand()
.command('task', 'Crawl the tasks archive page', () => {}, async function(argv: any) {
  await run(argv, 'task');
}).command('someday', 'Crawl the someday page', () => {}, async function(argv: any) {
  await run(argv, 'someday');
}).command('review', 'Crawl the daily review page', () => {}, async function(argv: any) {
  await run(argv, 'review');
}).option('debug', {
  alias: 'd',
  default: false,
  describe: 'Disable headless mode to debug',
  global: true,
}).option('start', {
  alias: 's',
  default: '2014-01-01',
  describe: 'Crawl backwards from today to this date (YYYY-MM-DD)',
  global: true,
}).option('output', {
  alias: 'o',
  default: './output',
  describe: 'Prefix of the output file',
  global: true,
}).option('username', {
  alias: 'u',
  demandOption: true,
  describe: 'Your email to login to doit.im',
  global: true,
}).option('password', {
  alias: 'p',
  demandOption: true,
  describe: 'Your secret password',
  global: true,
}).help('help').alias('help', 'h').alias('version', 'v')
.argv;
