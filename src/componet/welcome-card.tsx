import React from "react";
import { HomeBooks } from "../assets/images";

const WelcomeCard = () => {
  return (
    <div className="mt-10 w-full h-16 bg-[#67df7f] rounded-3xl text-center  md:text-left flex items-center justify-around">
      <h1 className="w-86 text-title text-2xl font-montserrat_semi_bold">
        Bienvenu à FOK NJE7EK
      </h1>
      {
        window.innerWidth > 1024 && (
          <img
          alt={"home Book"}
          src={HomeBooks}
          className="h-16 w-40 object-cover"
        />
        )
      }
     
    </div>
  );
};

export default WelcomeCard;
