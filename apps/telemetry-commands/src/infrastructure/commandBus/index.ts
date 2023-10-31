import {
  CommandBusInterface,
  CommandHandlerInterface,
  CommandInterface,
} from '@greenthumb/core';
import { injectable } from 'inversify';

@injectable()
export default class CommandBus<
  BaseCommand extends CommandInterface = CommandInterface,
> implements CommandBusInterface<BaseCommand>
{
  public handlers: Map<string, CommandHandlerInterface<BaseCommand>> =
    new Map();

  public registerHandler(handler: CommandHandlerInterface<BaseCommand>) {
    const targetCommand: string = handler.commandToHandle;
    if (this.handlers.has(targetCommand)) {
      return;
    }
    this.handlers.set(targetCommand, handler);
  }

  public async send<T extends BaseCommand>(command: T) {
    if (this.handlers.has(command.constructor.name)) {
      return (
        this.handlers.get(
          command.constructor.name,
        ) as CommandHandlerInterface<BaseCommand>
      ).handle(command);
    }

    throw new Error(
      `No handler registered with this command: ${command.constructor.name}`,
    );
  }
}
