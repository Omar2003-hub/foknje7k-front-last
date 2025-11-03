import React from "react";
import { AuthImage, Logo ,Elearning} from "../../assets/images";

import "./auth.css";
interface AuthLayoutComponentProps {
  title1?: string;
  title2?: string;
  title3?: string;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutComponentProps> = ({
  title1,
  title2,
  title3,
  children,
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full px-4 auth-container lg:flex-row lg:h-screen lg:px-28">
      {/* Left Section */}
      <div className="flex flex-col w-full min-h-screen px-8 py-12 text-white bg-green-800 leftttt lg:w-1/2">
        <img src={Logo} alt="Mascotte" className="w-40 mb-4 h-60" />

        <h1 className="first-tag left-heading-title">
          {title1} <br />
          {title2}
        </h1>
        <p className="left-heading-title ">{title3}</p>

        <img
          src={Elearning}
          alt="Illustration"
          className="self-center object-cover mt-8 border-4 border-white rounded-full w-60 h-60"
        />
      </div>

      {/* Right Section */}
      <div className="flex flex-col items-center justify-start w-full px-4 mt-8 right-auth lg:w-1/2 lg:px-28 lg:mt-0">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
