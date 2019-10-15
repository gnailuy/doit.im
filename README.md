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
2. Set `-d` to `false` to launch Chromium headless;
3. Crawler will stop on the date specified by `-s`;

``` bash
# Show help
npm run start -- -h

# Run the crawler
npm run start -- -d true -t true -r true -u "username@example.com" -p "password" -s "2014-10-01"
```

To debug the code, copy `launch.json.sample` in `.vscode` to `launch.json`, provide your username and password in it.
Then you are ready to debug the code in Visual Studio Code.
