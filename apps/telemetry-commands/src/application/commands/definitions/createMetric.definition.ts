import { Command } from '@greenthumb/core';

export default class CreateMetricCommand extends Command {
  public title: string;

  public description: string;

  constructor(title: string, description: string, id?: string) {
    super(id);
    this.title = title;
    this.description = description;
  }
}
