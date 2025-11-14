import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "../header/header";
import Footer from "../footer/footer";
import Login from "../../pages/auth/login/login";
import { RootState } from "../../redux/store/store";

const Layout: React.FC = () => {
  const isLogged = useSelector((state: RootState) => state.auth.isLogged);

  return (
    <div className="flex flex-col ">
      <Header />
      <main className={"bg-blue-500  "}>
        <Outlet />
      </main>
      {!isLogged && <Footer />}
    </div>
  );
};

export default Layout;
