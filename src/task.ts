import puppeteer from 'puppeteer';

import * as utils from "./utils";

export async function loadTaskListPage(page: puppeteer.Page, monthTs: number): Promise<puppeteer.Page> {
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

export async function goToPreviousMonth(page: puppeteer.Page): Promise<puppeteer.Page> {
  // Click the Prev button
  await page.click('#group_monthly > li.control.prev.btn-4');

  // Load the whole page
  await utils.loadWholePage(page);

  return page;
}

export async function crawlTaskList(page: puppeteer.Page): Promise<Array<any>> {
  // Scrape the task list
  return await page.evaluate(() => {
    const taskListSelector = 'li.task.ng-scope.completed';
    const taskSelector = 'a.link-title.ng-binding';

    // Save tasks into an array
    let tasks: Array<Element> = [...document.querySelectorAll(taskListSelector)];

    // For each task, extract the title and ID
    return tasks.map((el: Element) => {
      const baseURL = 'https://i.doit.im/home/';
      let task: HTMLElement = el.querySelector(taskSelector) as HTMLElement;
      return {
        title: task.innerText,
        href: baseURL + task.getAttribute('href')!.trim(), // Full URL here
        id: task.getAttribute('href')!.trim().split('/')[2],
      };
    });
  });
}

async function loadTaskPage(page: puppeteer.Page, taskItem: any): Promise<puppeteer.Page> {
  // Open page
  await page.goto(taskItem.href, {
    waitUntil: 'load'
  });

  return page;
}

function evaluateClassAttribute(selector: string): string {
  return document.querySelector(selector)!.getAttribute('class')!;
}

function evaluateTaskPage(item: any): any {
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
  let subtaskElements: Array<Element> = [...document.querySelectorAll(subtasksSelector)];
  let subtasks: Array<string> = subtaskElements.map((el: Element) => {
    return (el.querySelector(subtaskTitleSelector) as HTMLElement).innerText;
  });

  const commentAuthorSelector = 'div.comment-body > div.comment-header > span.comment-author.ng-binding';
  const commentTimeSelector = 'div.comment-body > div.comment-header > span.comment-time.ng-binding';
  const commentContentSelector = 'div.comment-body > div.comment-content.ng-binding';
  let commentElements: Array<Element> = [...document.querySelectorAll(commentsSelector)];
  let comments = commentElements.map((el: Element) => {
    return {
      author: (el.querySelector(commentAuthorSelector) as HTMLElement).innerText,
      time: (el.querySelector(commentTimeSelector) as HTMLElement).innerText,
      content: (el.querySelector(commentContentSelector) as HTMLElement).innerText,
    };
  });

  return {
    type: 'task',
    href: item.href,
    id: item.id,
    title: item.title,
    title_inner: (document.querySelector(titleSelector) as HTMLElement).innerText,
    note: (document.querySelector(noteSelector) as HTMLElement).innerHTML,
    subtasks: subtasks,
    priority: (document.querySelector(prioritySelector) as HTMLElement).getAttribute('class'),
    scheduleTime: (document.querySelector(timeSelector) as HTMLElement).innerText,
    time: (document.querySelector(timeSelector) as HTMLElement).getAttribute('title'),
    context: (document.querySelector(contextSelector) as HTMLElement).innerText,
    goal: (document.querySelector(goalSelector) as HTMLElement).innerText,
    project: (document.querySelector(projectSelector) as HTMLElement).innerText,
    tags: [...document.querySelectorAll(tagsSelector)].map((el: Element) => (el as HTMLElement).innerText),
    estimateTime: {
      hour: (document.querySelector(estimateHourSelector) as HTMLElement).getAttribute('value'),
      minute: (document.querySelector(estimateMinuteSelector) as HTMLElement).getAttribute('value'),
    },
    spentTime: {
      hour: (document.querySelector(spentHourSelector) as HTMLElement).getAttribute('value'),
      minute: (document.querySelector(spentMinuteSelector) as HTMLElement).getAttribute('value'),
    },
    comments: comments,
  };
}

function evaluateGoalPage(item: any): any {
  return {
    type: 'goal',
    href: item.href,
    id: item.id,
    title: item.title,
    // TODO: evaluate
  };
}

function evaluateProjectPage(item: any): any {
  return {
    type: 'goal',
    href: item.href,
    id: item.id,
    title: item.title,
    // TODO: evaluate
  };
}

async function taskPageType(page: puppeteer.Page): Promise<string | null> {
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

  let goalElement: puppeteer.ElementHandle<Element> | null = await page.$(goalSelector);
  let projectElement: puppeteer.ElementHandle<Element> | null = await page.$(projectSelector);

  if (goalElement === null || projectElement === null) {
    return 'task';
  } else {
    let goalClass: string = await page.evaluate(evaluateClassAttribute, goalSelector);
    let projectClass: string = await page.evaluate(evaluateClassAttribute, projectSelector);

    if (goalClass.indexOf('hide') === -1) {
      return 'goal';
    } else if (projectClass.indexOf('hide') === -1) {
      return 'project';
    }
  }

  return null;
}

async function crawlTaskPage(page: puppeteer.Page, taskItem: any): Promise<any> {
  let pageType: string | null = await taskPageType(page);
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

export async function crawlTask(page: puppeteer.Page, taskItem: any): Promise<any> {
  return await crawlTaskPage(
    await loadTaskPage(page, taskItem), taskItem);
}
