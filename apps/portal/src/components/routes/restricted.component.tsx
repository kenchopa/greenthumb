import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { getCurrentSession } from '../../services/auth.service';

const RestrictedRoutes = () => {
  const currentSession = getCurrentSession();
  return currentSession ? <Outlet /> : <Navigate to="/" />;
};

export default RestrictedRoutes;
