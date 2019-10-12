const utils = require('./utils');

async function loadTaskListPage(page, monthTs) {
  // URL
  const taskListURL = 'https://i.doit.im/home/#/archiver/monthly/' + monthTs;

  // Open page
  await page.goto(taskListURL, {
    waitUntil: 'load'
  });

  // Load the whole exchange page
  await utils.loadWholePage(page);

  return page;
}

async function crawlTaskListPage(page) {
  // Scrape the task list
  return [];
}

async function crawlTaskList(page, month) {
  var items = await crawlTaskListPage(
    await loadTaskListPage(page, month));
  return items;
}

async function loadTaskPage(page, taskId) {
  // URL
  const taskURL = 'https://i.doit.im/home/#/task/' + taskId;

  // Open page
  await page.goto(taskURL, {
    waitUntil: 'load'
  });

  return page;
}

async function crawlTaskPage(page) {
  // Scrape the task details
  return {};
}

async function crawlTask(page, taskId) {
  var detail = await crawlTaskPage(
    await loadTaskPage(page, taskId));
  return detail;
}

module.exports.crawlTaskList = crawlTaskList;
module.exports.crawlTask = crawlTask;
