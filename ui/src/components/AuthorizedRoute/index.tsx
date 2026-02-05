import {ReactNode} from 'react';
import {Navigate} from 'react-router-dom';
import { selectAuthToken } from '@/store/auth/slice';
import { useAppSelector } from '@/store/hooks';

interface AuthorizedRouteProps {
    children: ReactNode;
}

const AuthorizedRoute = ({children}: AuthorizedRouteProps) => {
    const authUser = useAppSelector(selectAuthToken);
    if (!authUser) {
        return <Navigate to="/login" replace/>;
    }
    return <>{children}</>;
};

export default AuthorizedRoute;
