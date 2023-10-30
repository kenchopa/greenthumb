import { CommandInterface } from './command.interface';

export interface CommandHandlerInterface<
  TCommand extends CommandInterface = any,
> {
  commandToHandle: string;
  handle(command: TCommand): any;
}
