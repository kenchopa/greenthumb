import { v4 as uuidV4 } from 'uuid';

import { ICommand } from './interfaces/command.interface';

export default abstract class Command implements ICommand {
  public guid: string;

  constructor(guid?: string) {
    this.guid = guid || uuidV4();
  }
}
