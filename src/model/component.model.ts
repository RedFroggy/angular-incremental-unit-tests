import { Directive } from './directive.model';
import { FileTypeEnum } from '../file-type.enum';

export class Component extends Directive {
  htmlFile: string;

  constructor() {
    super();
    this.type = FileTypeEnum.COMPONENT;
  }
}
