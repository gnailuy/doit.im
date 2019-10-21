# Doit.im Crawler

Export your [doit.im](http://doit.im/) tasks and daily reviews to local JSON files.

## Prerequisites

1. [node.js](https://nodejs.org/en/)
2. [npm](https://www.npmjs.com)

## Build, run, and debug

### Build the code

``` bash
# Install packages
npm install

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

### Debug the code

To debug the code, copy `launch.json.sample` in `.vscode` to `launch.json`, provide your username and password in it.
Then you are ready to debug the code in Visual Studio Code.

There are two default debug configurations to choose: `Launch Task Command` and `Launch Review Command`.

**DO NOT** commit `launch.json` to a public repository if it contains your password.
