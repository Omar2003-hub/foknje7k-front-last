import React from "react";
import { FaCoins } from "react-icons/fa";

interface CoinBalanceProps {
  coins: number;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

const CoinBalance: React.FC<CoinBalanceProps> = ({
  coins,
  size = "medium",
  showLabel = true,
}) => {
  const sizeClasses = {
    small: "text-sm",
    medium: "text-lg",
    large: "text-2xl",
  };

  const iconSizes = {
    small: "text-base",
    medium: "text-xl",
    large: "text-3xl",
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-2 border-yellow-300 rounded-full shadow-sm coin-balance bg-gradient-to-r from-yellow-100 to-yellow-50">
      {(FaCoins as any)({ className: `text-yellow-500 ${iconSizes[size]}` })}
      <div className="flex flex-col">
        {showLabel && (
          <span className="text-xs font-medium text-gray-600">Nje7ek Coins</span>
        )}
        <span className={`font-bold text-yellow-700 ${sizeClasses[size]}`}>
          {coins.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default CoinBalance;
