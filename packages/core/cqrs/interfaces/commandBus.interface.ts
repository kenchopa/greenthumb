import { CommandInterface } from './command.interface';
import { CommandHandlerInterface } from './commandHandler.interface';

export interface CommandBusInterface<
  BaseCommand extends CommandInterface = CommandInterface,
> {
  registerHandler(handler: CommandHandlerInterface<BaseCommand>): any;
  send<T extends BaseCommand>(command: T): any;
}
