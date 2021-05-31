import {GitChangeWatcher} from './git-change-watcher';
import {TestFinder} from './test-finder';

const {execSync} = require("child_process");

const packageJsonFile = require(__dirname + '/../../package.json');

const testFinder: TestFinder = new TestFinder();
const gitChangeWatcher: GitChangeWatcher = new GitChangeWatcher(process.env.CI_COMMIT_BEFORE_SHA,
  process.env.CI_COMMIT_SHA);

const run = async () => {
  console.time('incremental_tests');

  const files: string[] = await gitChangeWatcher.getDiffFiles();

  if (files && files.length > 0) {
    console.log(`${files.length} files have changed`, files);

    const filesToTest = testFinder.findTestsFiles(files);
    console.log(`${filesToTest.length} tests file will be ran`);

    console.timeEnd('incremental_tests');
    return executeTests(filesToTest);
  }

  console.warn(`No tests to run with git diff: ${process.env.PREVIOUS_COMMIT_SHA} and ${process.env.CURRENT_COMMIT_SHA}`);
  console.timeEnd('incremental_tests');
}

const executeTests = (filesToTest) => {
  return execSync(`${packageJsonFile.incrementalTests.testCommand} ` + filesToTest.join('\\|'), {stdio:[0, 1, 2]});
}

run();
