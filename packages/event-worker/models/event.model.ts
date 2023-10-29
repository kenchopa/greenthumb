import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export default class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ nullable: false, type: 'timestamptz' })
  createdAt!: Date;

  @Column({ nullable: false, type: 'timestamptz' })
  occurredOn!: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  processedAt?: Date;

  @Column({ length: 255, nullable: false, type: 'varchar' })
  aggregateId!: string;

  @Column({ length: 255, nullable: false, type: 'varchar' })
  aggregateType!: string;

  @Column({ length: 255, nullable: false, type: 'varchar' })
  routingKey!: string;

  @Column({ length: 4096, nullable: false, type: 'varchar' })
  payload!: string;

  @Column({ length: 4096, nullable: false, type: 'varchar' })
  properties!: string;
}
