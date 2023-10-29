import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import React, { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';

import PrivateRoutes from './components/routes/private.component';
import RestrictedRoutes from './components/routes/restricted.component';
import HomePage from './pages/home.page';
import LoginPage from './pages/security/login.page';
import ProfilePage from './pages/security/profile.page';
import RegisterPage from './pages/security/register.page';
import BoardAdminPage from './pages/users/board-admin.page';
import BoardModeratorPage from './pages/users/board-moderator.page';
import BoardUserPage from './pages/users/board-user.page';
import * as AuthService from './services/auth.service';
import { User } from './types/user.type';
import EventBus from './utils/event-bus.util';

const App: React.FC = () => {
  const [showModeratorBoard, setShowModeratorBoard] = useState<boolean>(false);
  const [showAdminBoard, setShowAdminBoard] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);

  const logOut = () => {
    AuthService.logout();
    setShowModeratorBoard(false);
    setShowAdminBoard(false);
    setCurrentUser(undefined);
  };

  useEffect(() => {
    const currentSession = AuthService.getCurrentSession();
    console.log(currentSession);

    if (currentSession) {
      const { loggedInUser } = currentSession;
      setCurrentUser(loggedInUser);
      setShowModeratorBoard(loggedInUser.role === 'operator');
      setShowAdminBoard(loggedInUser.role === 'admin');
    }

    EventBus.on('logout', logOut);

    return () => {
      EventBus.remove('logout', logOut);
    };
  }, []);

  return (
    <div>
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        <Link to={'/'} className="navbar-brand">
          Greenthumb
        </Link>
        <div className="navbar-nav mr-auto">
          <li className="nav-item">
            <Link to={'/home'} className="nav-link">
              Home
            </Link>
          </li>

          {showModeratorBoard && (
            <li className="nav-item">
              <Link to={'/mod'} className="nav-link">
                Moderator Board
              </Link>
            </li>
          )}

          {showAdminBoard && (
            <li className="nav-item">
              <Link to={'/admin'} className="nav-link">
                Admin Board
              </Link>
            </li>
          )}

          {currentUser && (
            <li className="nav-item">
              <Link to={'/user'} className="nav-link">
                User
              </Link>
            </li>
          )}
        </div>

        {currentUser ? (
          <div className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link to={'/profile'} className="nav-link">
                {currentUser.username}
              </Link>
            </li>
            <li className="nav-item">
              <a href="/login" className="nav-link" onClick={logOut}>
                LogOut
              </a>
            </li>
          </div>
        ) : (
          <div className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link to={'/login'} className="nav-link">
                Login
              </Link>
            </li>

            <li className="nav-item">
              <Link to={'/register'} className="nav-link">
                Sign Up
              </Link>
            </li>
          </div>
        )}
      </nav>

      <div className="container mt-3">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<PrivateRoutes />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/user" element={<BoardUserPage />} />
          </Route>

          <Route element={<RestrictedRoutes />}>
            <Route path="/mod" element={<BoardModeratorPage />} />
            <Route path="/admin" element={<BoardAdminPage />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
};

export default App;
