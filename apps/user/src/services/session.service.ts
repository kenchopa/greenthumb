import { createServiceSpan } from '@greenthumb/tracer';
import { Span } from 'opentracing';
import { Like, MoreThanOrEqual } from 'typeorm';

import { dataSource } from '../database';
import SessionNotFoundError from '../errors/session/sessionNotFound.error';
import Session from '../models/session.model';
import User from '../models/user.model';

const SERVICE = 'SessionService';

export interface SessionToUpdate {
  id: string;
  accessToken: string;
  accessTokenExpiredAt: Date;
  refreshToken: string;
  refreshTokenExpiredAt: Date;
  user: User;
}

export type SessionToCreate = Omit<SessionToUpdate, 'id'>;

export class SessionService {
  private readonly sessionRepository;

  public constructor() {
    this.sessionRepository = dataSource.manager.getRepository(Session);
  }

  public async getById(id: string, span: Span): Promise<Session> {
    const serviceSpan = createServiceSpan(SERVICE, 'getById', span);
    const session = await this.sessionRepository.findOne({
      where: { id },
    });

    if (!session) {
      throw SessionNotFoundError.forId(id);
    }

    serviceSpan.finish();
    return session;
  }

  public async getByUser(user: User, span: Span): Promise<Session> {
    const serviceSpan = createServiceSpan(SERVICE, 'getByUser', span);

    const session = await this.sessionRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (!session) {
      throw SessionNotFoundError.forUserId(user.id);
    }

    serviceSpan.finish();
    return session;
  }

  public async getNoneExpiredSessionForUser(
    user: User,
    span: Span,
  ): Promise<Session> {
    const serviceSpan = createServiceSpan(
      SERVICE,
      'getNoneExpiredSessionForUser',
      span,
    );
    const session = await this.sessionRepository.findOne({
      where: {
        accessTokenExpiredAt: MoreThanOrEqual(new Date()),
        user: { id: user.id },
      },
    });

    if (!session) {
      throw SessionNotFoundError.forUserId(user.id);
    }

    serviceSpan.finish();
    return session;
  }

  public async getByRefreshToken(
    refreshToken: string,
    span: Span,
  ): Promise<Session> {
    const serviceSpan = createServiceSpan(SERVICE, 'getByRefreshToken', span);
    const session = await this.sessionRepository.findOne({
      relations: ['user'],
      where: { refreshToken: Like(`%${refreshToken}%`) },
    });

    if (!session) {
      throw SessionNotFoundError.forRefreshToken(refreshToken);
    }

    serviceSpan.finish();
    return session;
  }

  public async getAll(span: Span): Promise<Session[]> {
    const serviceSpan = createServiceSpan(SERVICE, 'getAll', span);
    const sessions = await this.sessionRepository.find();
    serviceSpan.finish();
    return sessions;
  }

  public async create(data: SessionToCreate, span: Span): Promise<Session> {
    const serviceSpan = createServiceSpan(SERVICE, 'create', span);

    const newSession = new Session();
    Object.assign(newSession, data);

    const session = await this.sessionRepository.save(newSession);
    serviceSpan.finish();
    return session;
  }

  public async update(data: SessionToUpdate, span: Span): Promise<Session> {
    const { id, user } = data;
    const serviceSpan = createServiceSpan(SERVICE, 'update', span);

    const sessionToUpdate = await this.getByUser(user, serviceSpan);
    if (!sessionToUpdate) {
      throw SessionNotFoundError.forUserId(user.id);
    }

    Object.assign(sessionToUpdate, data);
    await this.sessionRepository.update(sessionToUpdate.id, sessionToUpdate);

    const session = this.getById(id, span);

    serviceSpan.finish();

    return session;
  }

  public async deleteById(id: string, span: Span): Promise<void> {
    const serviceSpan = createServiceSpan('UserService', 'deleteById', span);

    const sessionToDelete = await this.getById(id, serviceSpan);
    if (!sessionToDelete) {
      throw SessionNotFoundError.forId(id);
    }

    await this.sessionRepository.remove(sessionToDelete);
    serviceSpan.finish();
  }

  public async deleteByUser(user: User, span: Span): Promise<void> {
    const serviceSpan = createServiceSpan(SERVICE, 'deleteByUser', span);

    const sessionToDelete = await this.getByUser(user, serviceSpan);
    if (!sessionToDelete) {
      throw SessionNotFoundError.forUserId(user.id);
    }

    await this.sessionRepository.remove(sessionToDelete);
    serviceSpan.finish();
  }
}

const sessionService = new SessionService();

export default sessionService;
