import { Role } from '@greenthumb/auth';
import bcrypt from 'bcrypt';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import UserLoginError from '../errors/user/userLogin.error';

export const USER_UNIQUE_EMAIL = 'user_unique_email';

export const USER_UNIQUE_USERNAME = 'user_unique_username';

export const UserRoles = [Role.ADMIN, Role.OPERATOR, Role.USER];

export interface UserToUpdate {
  id: string;
  firstName: string;
  lastName: string;
  role: Role;
  email: string;
  username: string;
}

export type UserToCreate = Omit<UserToUpdate, 'id'>;

@Entity()
@Unique(USER_UNIQUE_EMAIL, ['email'])
@Unique(USER_UNIQUE_USERNAME, ['username'])
export default class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: false, type: 'varchar' })
  email: string;

  @Column({ length: 64, nullable: false, type: 'varchar' })
  username: string;

  @Column({ length: 512, nullable: false, type: 'varchar' })
  password: string;

  @Column({
    default: Role.USER,
    enum: Role,
    nullable: false,
    type: 'enum',
  })
  role: Role;

  @Column({ length: 128, nullable: true, type: 'varchar' })
  firstName?: string;

  @Column({ length: 128, nullable: true, type: 'varchar' })
  lastName?: string;

  @CreateDateColumn({ nullable: false, type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ nullable: false, type: 'timestamptz' })
  updatedAt: Date;

  @BeforeInsert()
  async encryptPassword() {
    const salt = await bcrypt.genSalt(9);
    const hashed = await bcrypt.hash(this.password, salt);
    this.password = hashed;
  }

  public async login(password: string): Promise<void> {
    const loggedIn = await bcrypt.compare(password, this.password);
    if (!loggedIn) {
      throw UserLoginError.invalidLogin();
    }
  }

  public human() {
    return {
      email: this.email,
      firstName: this.firstName,
      id: this.id,
      lastName: this.lastName,
      role: this.role,
      username: this.username,
    };
  }

  public gdpr() {
    return {
      id: this.id,
      role: this.role,
    };
  }
}
