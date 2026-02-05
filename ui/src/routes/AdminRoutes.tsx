import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

import Loadable from '@/components/Loadable';
import AdminLayout from '@/layouts/AdminLayout';
import AuthorizedRoute from '@/components/AuthorizedRoute';

const DashboardDefault = Loadable(lazy(() => import('@/pages/dash_board')));
const AccountPage = Loadable(lazy(() => import('@/pages/system/accounts')));
const Map = Loadable(lazy(() => import('@/pages/map')));
const ChargingStation = Loadable(lazy(() => import('@/pages/ev_charger')));
// ==============================|| MAIN ROUTING ||============================== //

const AdminRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      {
        path: '/',
        element: (
          <AuthorizedRoute>
            <DashboardDefault />
          </AuthorizedRoute>),
      },
      {
        path: 'system/accounts',
        element: <AccountPage />,
      },
      {
        path: 'dashboard',
        children: [
          {
            path: 'default',
            element: <DashboardDefault />,
          },
        ],
      },
      {
        path: 'map',
        element: <Map />,
      },
      {
        path: 'ev_charger',
        element: <ChargingStation />,
      },

    ],
  },
];

export default AdminRoutes;
