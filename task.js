const utils = require('./utils');

async function loadTaskListPage(page, monthTs) {
  // URL
  const taskListURL = 'https://i.doit.im/home/#/archiver/monthly/' + monthTs;

  // Open page
  await page.goto(taskListURL, {
    waitUntil: 'load'
  });

  // Load the whole page
  await utils.loadWholePage(page);

  return page;
}

async function goToPreviousMonth(page) {
  // Click the Prev button
  await page.click('#group_monthly > li.control.prev.btn-4');

  // Load the whole page
  await utils.loadWholePage(page);

  return page;
}

async function crawlTaskList(page) {
  // Scrape the task list
  return await page.evaluate(() => {
    const taskListSelector = 'li.task.ng-scope.completed';
    const taskSelector = 'a.link-title.ng-binding';

    // Save tasks into an array
    var tasks = [...document.querySelectorAll(taskListSelector)];

    // For each task, extract the title and ID
    return tasks.map(el => {
      var task = el.querySelector(taskSelector);
      return {
        title: task.innerText,
        href: task.href.trim(), // Full URL here
        id: task.href.trim().split('/')[6],
      };
    });
  });``
}

async function loadTaskPage(page, taskItem) {
  // Open page
  await page.goto(taskItem['href'], {
    waitUntil: 'load'
  });

  return page;
}

async function crawlTaskPage(page, taskItem) {
  // Scrape the task details
  return await page.evaluate((item) => {
    // TODO: more selector and more data
    const taskSelector = 'a.link-title.ng-binding';

    return {
      title: item['title'],
      href: item['href'],
      id: item['id'],
    };
  }, taskItem);``
}

async function crawlTask(page, taskItem) {
  var detail = await crawlTaskPage(
    await loadTaskPage(page, taskItem), taskItem);
  return detail;
}

module.exports.loadTaskListPage = loadTaskListPage;
module.exports.goToPreviousMonth = goToPreviousMonth;
module.exports.crawlTaskList = crawlTaskList;
module.exports.crawlTask = crawlTask;
