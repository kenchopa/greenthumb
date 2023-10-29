import React from 'react';

import { getCurrentSession } from '../../services/auth.service';

const Profile: React.FC = () => {
  const currentSession = getCurrentSession();
  if (!currentSession) {
    return (
      <div className="container">
        <header className="jumbotron">
          <h3>
            <strong>No access</strong>
          </h3>
        </header>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="jumbotron">
        <h3>
          <strong>{currentSession.loggedInUser.username}</strong> Profile
        </h3>
      </header>

      <p>
        <strong>AccessToken:</strong>{' '}
        {currentSession.accessToken.substring(0, 20)} ...{' '}
        {currentSession.accessToken.substr(
          currentSession.accessToken.length - 20,
        )}
      </p>
      <p>
        <strong>AccessTokenExpiredAt:</strong>
        {currentSession.accessTokenExpiredAt}
      </p>

      <p>
        <strong>RefreshToken:</strong>{' '}
        {currentSession.refreshToken.substring(0, 20)} ...{' '}
        {currentSession.refreshToken.substr(
          currentSession.refreshToken.length - 20,
        )}
      </p>
      <p>
        <strong>RefreshTokenExpiredAt:</strong>
        {currentSession.refreshTokenExpiredAt}
      </p>

      <p>
        <strong>Id:</strong> {currentSession.loggedInUser.id}
      </p>
      <p>
        <strong>Email:</strong> {currentSession.loggedInUser.email}
      </p>
      <p>
        <strong>Authorities:</strong> {currentSession.loggedInUser.role}
      </p>
    </div>
  );
};

export default Profile;
