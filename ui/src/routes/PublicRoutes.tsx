import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

import Loadable from "@/components/Loadable";
import PublicLayout from "@/layouts/PublicLayout";

const AuthLogin = Loadable(lazy(() => import("@/pages/authentication/login")));
const AuthRegister = Loadable(lazy(() => import('@/pages/authentication/login')));

const PublicRoutes: RouteObject[] = [
    {
        path: '/',
        element: <PublicLayout/>,
        children: [
            {
                path: 'login',
                element: <AuthLogin />,
            },
            {
                path: 'register',
                element: <AuthRegister />,
            },
        ],
    },
];

export default PublicRoutes;