# Doit.im Crawler

## Prerequisites

1. [node.js](https://nodejs.org/en/)
2. [npm](https://www.npmjs.com)

## Build, run, and debug

F**k the GFW first, or `npm` might not be able to download Chromium

### Build the code

``` bash
# Install packages
npm i

# Build
npm run compile

```

### Run the crawler

1. You can use `node dist/doit.js` to replace the `npm run start --` command;
2. Set `--debug` to `false` to launch Chromium headless;
3. Crawler goes backwards from today and stops on the date specified by `--start`;

``` bash
# Show help
npm run start
# or
npm run start -- --help

# Crawl tasks archive page
npm run start -- task --debug true --username "username@example.com" --password "password" --start "2014-10-01"

# Crawl daily review page
npm run start -- review --debug true --username "username@example.com" --password "password" --start "2014-10-01"
```

To debug the code, copy `launch.json.sample` in `.vscode` to `launch.json`, provide your username and password in it.
Then you are ready to debug the code in Visual Studio Code.

There are two default debug configurations to choose: `Launch Task Command` and `Launch Review Command`.
