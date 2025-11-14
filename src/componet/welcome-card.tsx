import React from "react";
import { HomeBooks } from "../assets/images";

const WelcomeCard = () => {
  return (
    <div className="mt-10 w-full h-16 bg-gradient-to-r from-[#09745f] to-[#07b98e] text-white rounded-3xl text-center md:text-left flex items-center justify-around">
      <h1 className="text-2xl w-86 text-title font-montserrat_semi_bold">
        Bienvenu à FOK NJE7EK
      </h1>
      {
        window.innerWidth > 1024 && (
          <img
          alt={"home Book"}
          src={HomeBooks}
          className="object-cover w-40 h-16"
        />
        )
      }
     
    </div>
  );
};

export default WelcomeCard;
