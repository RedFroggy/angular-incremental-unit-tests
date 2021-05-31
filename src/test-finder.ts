import {Compiler, Dependencies} from './compiler';

const fs = require('fs');
const packageJsonFile = require(__dirname + '/../../package.json');
const glob = require("glob");

export class TestFinder {
  private compiler: Compiler;
  private moduleDependencies: Dependencies[];
  private readonly tsFiles: string[];

  constructor() {
    this.tsFiles = glob.sync(packageJsonFile.incrementalTests.rootDir + '/**/*.ts')
        .sort((a) => {
          if (a.includes('.module')) {
            return 1;
          }
          if (a.includes('.spec')) {
            return 1;
          }
          return -1;
        });
    this.compiler = new Compiler(this.tsFiles, {tsconfigDirectory: ''});
    this.moduleDependencies = this.compiler.flattenDependencies;
  }

  findCurrentTestFile(filePath: string): string[] {
    if (this.compiler.isTestFile(filePath)) {
      return [filePath];
    } else if (this.compiler.isComponentFile(filePath)) {
      return this.searchForTestFilesInSameFileFolder(filePath);
    }
  }

  findTestsFiles(filesPath: string[]): string[] {
   const testFiles: string[] = [].concat.apply([], filesPath.map((filePath) =>
       this.findTestFile(filePath))).filter(file => Boolean(file));
    return [...new Set(testFiles)]
  }

  findTestFile(filePath: string): string[] {

    let testFiles: string[] = [];

    if (!this.compiler.isComponentFile(filePath) && !this.compiler.isTestFile(filePath)) {

      if (this.compiler.isModuleFile(filePath)) {
        const moduleDep = this.compiler.getDependencyByFileName(filePath);
        if (moduleDep) {
             const specFiles: Dependencies[] = [].concat.apply([],
                 moduleDep.declarations.map(dependency => dependency.specFiles));
          testFiles = testFiles.concat(specFiles.map(specFile => specFile.file));

          // Get all modules that import the current module
          const importedByModules: Dependencies[] = this.moduleDependencies.filter(dependency =>
              dependency.imports && dependency.imports.some((imp) => imp.name === moduleDep.name));

          // Recursively look for test files in all modules that import the current one
          if(importedByModules && importedByModules.length) {
            importedByModules.forEach((impModule) => {
              testFiles = testFiles.concat(this.findTestFile(impModule.file));
            });
          }
        }
      } else {
        return;
      }
    } else {
      // If the current file has a test file
      testFiles = testFiles.concat(this.findCurrentTestFile(filePath));

      if (!this.compiler.isTestFile(filePath)) {
        // Find all component selector occurrences to find other components to test
        testFiles = testFiles.concat(this.findRelatedTestFiles(filePath));
      }
    }

    return testFiles;
  }

  findRelatedTestFiles(filePath: string): string[] {

    let testFiles: string[] = [];
    if (!this.compiler.isComponentFile(filePath)) {
      return [];
    }

    let componentFilePath = filePath;

    if (!filePath.includes('.ts')) {
      // TODO use compiler to retrieve ts file from html or style file
      const tsFile = filePath.substring(0, filePath.lastIndexOf('.')) + '.ts';
      if (fs.existsSync(componentFilePath)) {
        componentFilePath = tsFile;
      }
    }

    // Read the typescript component angular selector
    const componentSelector = this.readComponentSelector(componentFilePath);

    const parentDependencies = this.moduleDependencies.filter((dependency) => dependency.isComponent
        && dependency.templateContent.includes(componentSelector));
    const childDependency = this.compiler.getDependencyByFileName(componentFilePath);

    if (parentDependencies && childDependency)  {
      parentDependencies
          .forEach(parentDep => {
            if (!parentDep.childrenComponents) {
              parentDep.childrenComponents = [];
            }
            parentDep.childrenComponents.push(childDependency);
            this.compiler.cache[parentDep.name] = parentDep;
          });

      childDependency.parentComponents = parentDependencies;
      this.compiler.cache[childDependency.name] = childDependency;
    }

    if (parentDependencies && parentDependencies.length) {
      testFiles = testFiles.concat([].concat.apply([], parentDependencies
          .map(dependency => dependency.specFiles))
          .map((dependency: Dependencies) => dependency.file));

      // Recursive call to get all impacted components
      parentDependencies.forEach(parentDep =>
          testFiles = testFiles.concat(this.findRelatedTestFiles(parentDep.file)))
    }
    return testFiles;
  }

  searchForTestFilesInSameFileFolder(filePath: string): string[] {
    return this.compiler.getTestSpecFilesForComponent(filePath);
  }

  readComponentSelector(filePath: string): string {
    return this.compiler.readComponentSelector(filePath);
  };
}
