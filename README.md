Incremental Angular unit tests in CI
====================================

<div align="center">
  <a name="logo" href="https://www.redfroggy.fr"><img src="assets/logo.png" alt="RedFroggy"></a>
  <h4 align="center">A RedFroggy project</h4>
</div>
<br/>
<div align="center">
  <a href="https://forthebadge.com"><img src="https://forthebadge.com/images/badges/fuck-it-ship-it.svg"/></a>
  <a href="https://forthebadge.com"><img src="https://forthebadge.com/images/badges/built-with-love.svg"/></a>
  <a href="https://forthebadge.com"><img src="https://forthebadge.com/images/badges/made-with-javascript.svg"/></a>
</div>
<div align="center">
   <a href="https://github.com/semantic-release/semantic-release"><img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg"/></a>
</div>
<br/>
<br/>

Most of the times, when an Angular code change is made by a developer, all unit tests are run in CI.
This project is a proof of concept on how only run impacted unit tests based on a commit change.

Getting started
-----------------
- `npm i angular-incremental-tests -D`
- In your `package.json` file add the following configuration

```json
"incrementalTests": {
    "ignoredFilesPatterns": [
      ".md",
      ".eslint*",
      "*.json",
      "!package.json",
      "!package-lock.json",
      ".mustache",
      "*.js"
    ],
    "rootDir": "src/app",
    "testCommand": "npm run test"
  }
```
| Option                | Description                       |
| --------------------- | --------------------------------- |
| ignoredFilesPatterns  | List of files patterns to ignore  |
| rootDir               | your application root directory   |
| testCommand           | The test command to run           |

- In your `package.json` file, add the following script:
    - `"test:incremental": "node node_modules/angular-incremental-tests/index.js"`
- You can then run: `npm run test:incremental` in your ci script.

Environment variables
--------------------
- The following command is run to list all files names changed in CI between two commits: `git diff --name-only CI_COMMIT_BEFORE_SHA CI_COMMIT_SHA`
- So you need to set both environment variables: `CI_COMMIT_BEFORE_SHA` and `CI_COMMIT_SHA`


