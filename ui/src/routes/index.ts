import { createBrowserRouter } from 'react-router-dom';

import AdminRoutes from "@/routes/AdminRoutes";
import PublicRoutes from "@/routes/PublicRoutes";

const router = createBrowserRouter([...AdminRoutes, ...PublicRoutes], {
    basename: import.meta.env.VITE_APP_BASE_NAME
});

export default router;