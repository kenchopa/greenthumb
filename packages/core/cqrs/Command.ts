import { nanoid } from 'nanoid';

import { ICommand } from './interfaces/ICommand';

export default abstract class Command implements ICommand {
  public guid: string;

  constructor(guid?: string) {
    this.guid = guid || nanoid();
  }
}
