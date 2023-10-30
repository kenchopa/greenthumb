import { IMessage } from './message.interface';

export interface ICommand extends IMessage {
  guid: string;
}
