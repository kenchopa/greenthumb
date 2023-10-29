import { createServiceSpan } from '@greenthumb/tracer';
import { Span } from 'opentracing';

import { dataSource } from '../database';
import UserDuplicateEmailError from '../errors/user/userDuplicateEmail.error';
import UserDuplicateUsernameError from '../errors/user/userDuplicateUserName.error';
import UserNotFoundError from '../errors/user/userNotFound.error';
import User, {
  USER_UNIQUE_EMAIL,
  USER_UNIQUE_USERNAME,
  UserToCreate,
  UserToUpdate,
} from '../models/user.model';

const SERVICE = 'UserService';

export class UserService {
  private readonly userRepository;

  public constructor() {
    this.userRepository = dataSource.manager.getRepository(User);
  }

  public async getById(id: string, span: Span): Promise<User> {
    const serviceSpan = createServiceSpan(SERVICE, 'getById', span);
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw UserNotFoundError.forId(id);
    }

    serviceSpan.finish();
    return user;
  }

  public async getByUsernameOrEmail(login: string, span: Span): Promise<User> {
    const serviceSpan = createServiceSpan(
      SERVICE,
      'getByUsernameOrEmail',
      span,
    );

    const user = await this.userRepository
      .createQueryBuilder()
      .where('username = :username OR email = :email', {
        email: login,
        username: login,
      })
      .getOne();

    if (!user) {
      throw UserNotFoundError.forLogin(login);
    }

    serviceSpan.finish();

    return user;
  }

  public async getAll(span: Span): Promise<User[]> {
    const serviceSpan = createServiceSpan(SERVICE, 'findAll', span);
    const users = await this.userRepository.find();
    serviceSpan.finish();
    return users;
  }

  public async create(data: UserToCreate, span: Span): Promise<User> {
    const serviceSpan = createServiceSpan(SERVICE, 'create', span);

    const newUser = new User();
    Object.assign(newUser, data);

    try {
      const user = await this.userRepository.save(newUser);
      serviceSpan.finish();
      return user;
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      const { message } = error;
      const { email, username } = newUser;
      switch (true) {
        case message.includes(USER_UNIQUE_EMAIL):
          throw UserDuplicateEmailError.forEmail(email).wrap(error);
        case message.includes(USER_UNIQUE_USERNAME):
          throw UserDuplicateUsernameError.forUsername(username).wrap(error);
        default:
          throw error;
      }
    }
  }

  public async update(data: UserToUpdate, span: Span): Promise<User> {
    const { id } = data;
    const serviceSpan = createServiceSpan(SERVICE, 'update', span);

    const userToUpdate = await this.getById(id, serviceSpan);

    Object.assign(userToUpdate, data);
    await this.userRepository.update(userToUpdate.id, userToUpdate);

    const user = this.getById(id, span);

    serviceSpan.finish();
    return user;
  }

  public async deleteById(id: string, span: Span): Promise<void> {
    const serviceSpan = createServiceSpan(SERVICE, 'deleteById', span);

    const userToDelete = await this.getById(id, serviceSpan);

    await this.userRepository.remove(userToDelete);
    serviceSpan.finish();
  }
}

const userService = new UserService();

export default userService;
