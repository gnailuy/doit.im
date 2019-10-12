import { loadWholePage } from './utils';

async function loadTaskListPage(page, month) {
  // URL
  const taskListURL = 'https://i.doit.im/home/#/archiver/monthly/' + month;

  // Open page
  await page.goto(taskListURL, {
    waitUntil: 'load'
  });

  // Load the whole exchange page
  await loadWholePage(page);

  return page;
}

async function crawlTaskListPage(page) {
  // Scrape the task list
}

async function crawl_task_list(page, month) {
  var items = await crawlTaskListPage(
    await loadTaskListPage(page, month));
  return items;
}

export { crawl_task_list };
