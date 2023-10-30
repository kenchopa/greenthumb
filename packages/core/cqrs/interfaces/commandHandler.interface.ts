import { ICommand } from './command.interface';

export interface ICommandHandler<TCommand extends ICommand = any> {
  commandToHandle: string;
  handle(command: TCommand): any;
}
