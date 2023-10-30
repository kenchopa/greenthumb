import { MessageInterface } from './message.interface';

export interface CommandInterface extends MessageInterface {
  id: string;
}
