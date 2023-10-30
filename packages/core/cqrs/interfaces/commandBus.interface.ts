import { ICommand } from './command.interface';
import { ICommandHandler } from './commandHandler.interface';

export interface ICommandBus<BaseCommand extends ICommand = ICommand> {
  registerHandler(handler: ICommandHandler<BaseCommand>): any;
  send<T extends BaseCommand>(command: T): any;
}
