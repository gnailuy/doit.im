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

function evaluateClassAttribute(selector) {
  return document.querySelector(selector).getAttribute('class');
}

function evaluateTaskPage(item) {
  const titleSelector = 'div.task-view.ng-scope > h3 > span.title.ng-binding';
  const noteSelector = 'div.task-view.ng-scope > ul > li.note > div';
  const subtasksSelector = 'div.task-view.ng-scope > ul > li.subtasks.ng-scope > div.inner > ul > li'
  const prioritySelector = 'div.task-view.ng-scope > div > div.item.pri';
  const timeSelector = 'div.task-view.ng-scope > div > div.item.time.ng-binding';
  const contextSelector = 'div.task-view.ng-scope > div > div.item.context.ng-binding';
  const goalSelector = 'div.task-view.ng-scope > div > div.item.goal.ng-binding';
  const projectSelector = 'div.task-view.ng-scope > div > div.item.project.ng-binding';
  const tagsSelector = 'div.task-view.ng-scope > div > div.item.tags > span';
  const commentsSelector = 'div.task-view.ng-scope > ul > li.comments.animate-list.ng-scope > div.con > ul > li';
  const estimateHourSelector = '#task_paper > div.task-estimate.ng-scope > div.estimate > div.time-wrap > input.h';
  const estimateMinuteSelector = '#task_paper > div.task-estimate.ng-scope > div.estimate > div.time-wrap > input.m';
  const spentHourSelector = '#task_paper > div.task-estimate.ng-scope > div.spent > div.time-wrap > input.h'
  const spentMinuteSelector = '#task_paper > div.task-estimate.ng-scope > div.spent > div.time-wrap > input.m'

  const subtaskTitleSelector = 'div.title > span';
  var subtaskElements = [...document.querySelectorAll(subtasksSelector)];
  var subtasks = subtaskElements.map(el => {
    return el.querySelector(subtaskTitleSelector);
  });

  const commentAuthorSelector = 'div.comment-body > div.comment-header > span.comment-author.ng-binding';
  const commentTimeSelector = 'div.comment-body > div.comment-header > span.comment-time.ng-binding';
  const commentContentSelector = 'div.comment-body > div.comment-content.ng-binding';
  var commentElements = [...document.querySelectorAll(commentsSelector)];
  var comments = commentElements.map(el => {
    return {
      author: el.querySelector(commentAuthorSelector).innerText,
      time: el.querySelector(commentTimeSelector).innerText,
      content: el.querySelector(commentContentSelector).innerText,
    };
  });

  return {
    type: 'task',
    href: item['href'],
    id: item['id'],
    title: item['title'],
    title_in: document.querySelector(titleSelector).innerText,
    note: document.querySelector(noteSelector).innerHTML,
    subtasks: subtasks,
    priority: document.querySelector(prioritySelector).getAttribute('class'),
    scheduleTime: document.querySelector(timeSelector).innerText,
    time: document.querySelector(timeSelector).getAttribute('title'),
    context: document.querySelector(contextSelector).innerText,
    goal: document.querySelector(goalSelector).innerText,
    project: document.querySelector(projectSelector).innerText,
    tags: [...document.querySelectorAll(tagsSelector)].map(el => el.innerText),
    estimateTime: {
      hour: document.querySelector(estimateHourSelector).getAttribute('value'),
      minute: document.querySelector(estimateMinuteSelector).getAttribute('value'),
    },
    spentTime: {
      hour: document.querySelector(spentHourSelector).getAttribute('value'),
      minute: document.querySelector(spentMinuteSelector).getAttribute('value'),
    },
    comments: comments,
  };
}

function evaluateGoalPage(item) {
  return {
    type: 'goal',
    href: item['href'],
    id: item['id'],
    title: item['title'],
    // TODO: evaluate
  };
}

function evaluateProjectPage(item) {
  return {
    type: 'project',
    href: item['href'],
    id: item['id'],
    title: item['title'],
    // TODO: evaluate
  };
}

async function taskPageType(page) {
  const taskNoteSelector = 'div.task-view.ng-scope > ul > li.note > div';
  const goalSelector = '#goal_info';
  const projectSelector = '#project_info';

  try {
    // Wait for the task note element to load
    // For goal/poject, wait timeout
    await page.waitForSelector(taskNoteSelector, {
      timeout: 5000
    });
  } catch (_) { }

  var goalElement = await page.$(goalSelector);
  var projectElement = await page.$(projectSelector);

  if (goalElement === null || projectElement === null) {
    return 'task';
  } else {
    var goalClass = await page.evaluate(evaluateClassAttribute, goalSelector);
    var projectClass = await page.evaluate(evaluateClassAttribute, projectSelector);

    if (goalClass.indexOf('hide') === -1) {
      return 'goal';
    } else if (projectClass.indexOf('hide') === -1) {
      return 'project';
    }
  }

  return null;
}

async function crawlTaskPage(page, taskItem) {
  var pageType = await taskPageType(page);
  if (pageType === 'task') {
    return await page.evaluate(evaluateTaskPage, taskItem);
  } else if (pageType === 'goal') {
    return await page.evaluate(evaluateGoalPage, taskItem);
  } else if (pageType === 'project') {
    return await page.evaluate(evaluateProjectPage, taskItem);
  } else {
    return null;
  }
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
