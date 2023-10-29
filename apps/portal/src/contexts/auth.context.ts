import { Session } from '../client/auth.client';

export function setSession(session: Session) {
  localStorage.setItem('session', JSON.stringify(session));
}

export function getSession(): Session {
  const session = localStorage.getItem('session');
  if (!session) {
    throw new Error('No logged in session found.');
  }

  return JSON.parse(session) as Session;
}

export function destroySession() {
  localStorage.removeItem('session');
}
