import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';

const fs = require('fs');
const packageJsonFile = require(__dirname + '/../../package.json');

const options: Partial<SimpleGitOptions> = {
  baseDir: process.cwd(),
  binary: 'git',
  maxConcurrentProcesses: 6,
};
const git: SimpleGit = simpleGit(options);

export class GitChangeWatcher {
  previousShaCommit: string | undefined;
  currentShaCommit: string | undefined;
  constructor(previousShaCommit: string | undefined, currentShaCommit: string | undefined) {
    this.previousShaCommit = previousShaCommit;
    this.currentShaCommit = currentShaCommit;
  }

  getDiffFiles(): Promise<string[]> {
    if (!this.previousShaCommit || !this.currentShaCommit) {
      return Promise.resolve([]);
    }

    return new Promise<string[]>((resolve, reject) => {
      // @ts-ignore
      git.diff(['--name-only', this.previousShaCommit, this.currentShaCommit], (error, result) => {
        if (error) {
          reject();
        }
        resolve(result ? this.cleanFiles(result.split('\n')) : []);
      });
    });
  }

  private cleanFiles(files: string[]): string[] {
    return files
      .map((s) => s.trim())
      .filter((s) => s!= '')
      .filter((s) => !this.matchIgnoredFile(s))
      .filter((s) => fs.existsSync(s))
      .sort((a) => a.includes('.spec') ? -1 : 1);
  }

  private matchIgnoredFile(file: string): boolean {
    return packageJsonFile.incrementalTests.ignoredFilesPatterns
      .map((ignoredPattern) => ignoredPattern.replace('*', ''))
      .some((ignoredPattern) => file.includes(ignoredPattern) &&
        !packageJsonFile.incrementalTests.ignoredFilesPatterns.includes(`!${file}`));
  }
}
