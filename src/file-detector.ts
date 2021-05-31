import { FileTypeEnum } from './file-type.enum';

export class FileDetector {
  private static patterns: Map<FileTypeEnum, string[]> = new Map([
    [FileTypeEnum.COMPONENT, ['.component']],
    [FileTypeEnum.DIRECTIVE, ['.directive']],
    [FileTypeEnum.TEST_FILE, ['.spec.ts']],
    [FileTypeEnum.MODULE, ['.module.ts']],
    [FileTypeEnum.SERVICE, ['.service.ts']]
  ])

  static detectFile(filePath: string): FileTypeEnum {
    let typeEnum: FileTypeEnum = FileTypeEnum.OTHER;
    this.patterns.forEach((patterns, type) => {
      if (patterns.some((s) => filePath.toLowerCase().includes(s))) {
        typeEnum = type;
      }
    });

    return typeEnum;
  }

  static isTestFile(filePath: string): boolean {
    return this.detectFile(filePath) === FileTypeEnum.TEST_FILE;
  }

  static isComponentFile(filePath: string): boolean {
    return this.detectFile(filePath) === FileTypeEnum.COMPONENT;
  }

  static isDirectiveFile(filePath: string): boolean {
    return this.detectFile(filePath) === FileTypeEnum.DIRECTIVE;
  }

  static isServiceFile(filePath: string): boolean {
    return this.detectFile(filePath) === FileTypeEnum.SERVICE;
  }

  static isModuleFile(filePath: string): boolean {
    return this.detectFile(filePath) === FileTypeEnum.MODULE;
  }
}
