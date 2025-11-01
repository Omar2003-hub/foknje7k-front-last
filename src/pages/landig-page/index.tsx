import React from "react";
import Welcome from "./home-content/welcome";
import Service from "./home-content/service";
import Classes from "./home-content/classes";
import Inscription from "./home-content/inscription";
import InscriptionPro from "./home-content/inscription-pro";
import Newsletter from "./home-content/newsletter";

const Landing = () => {
  return (
    <div className="bg-blue-200 w-full overflow-x-hidden">
      <Welcome />
      <Service />
      <Classes />
      <Inscription />
      <Newsletter />
    </div>
  );
};

export default Landing;
