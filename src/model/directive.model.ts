import { FileTypeEnum } from '../file-type.enum';

export class Directive {
  selector: string;
  filePath: string;
  specFile: string;
  type: FileTypeEnum;

  constructor() {
    this.type = FileTypeEnum.DIRECTIVE;
  }
}
