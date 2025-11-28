import React from "react";
import { useSelector } from "react-redux";
import MyPromoCodeCard from "../../componet/my-promo-code-card";

const ReferralCodePage: React.FC = () => {
  // Adjust selector path if your user state is different
  const userId = useSelector((state: any) => state.user.userData.id);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Referral Code</h1>
      <MyPromoCodeCard userId={userId} />
    </div>
  );
};

export default ReferralCodePage;
