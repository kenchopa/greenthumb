import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { getCurrentSession } from '../../services/auth.service';

const PrivateRoutes = () => {
  const currentSession = getCurrentSession();
  return currentSession ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
