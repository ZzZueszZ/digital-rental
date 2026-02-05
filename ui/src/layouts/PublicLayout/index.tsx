import {Outlet} from "react-router-dom";

const PublicLayout = () => {
    return (
        <main>
          <Outlet/> {/* Renders admin routes */}
        </main>
    );
};

export default PublicLayout;
