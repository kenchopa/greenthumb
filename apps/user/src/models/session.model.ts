import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import User from './user.model';

export const SESSION_UNIQUE_REFRESH_TOKEN = 'session_unique_refresh_token';

@Entity()
@Unique(SESSION_UNIQUE_REFRESH_TOKEN, ['refreshToken'])
export default class Session {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { cascade: true, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  user!: User;

  @Column({ length: 1024, nullable: false, type: 'varchar', unique: true })
  accessToken!: string;

  @Column({ nullable: false, type: 'timestamptz' })
  accessTokenExpiredAt!: Date;

  @Column({ length: 1024, nullable: false, type: 'varchar', unique: true })
  refreshToken!: string;

  @Column({ nullable: false, type: 'timestamptz' })
  refreshTokenExpiredAt!: Date;

  @CreateDateColumn({ nullable: false, type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ nullable: false, type: 'timestamptz' })
  updatedAt!: Date;

  public human() {
    return {
      accessToken: this.accessToken,
      accessTokenExpiredAt: this.refreshTokenExpiredAt,
      id: this.id,
      refreshToken: this.refreshToken,
      refreshTokenExpiredAt: this.refreshTokenExpiredAt,
      roles: [this.user.role],
      user: this.user.human(),
    };
  }
}
