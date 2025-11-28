import React, { useState } from "react";
import { validatePromoCode, applyPromoCode } from "../services/promo-code-service";
import CustomButton from "../shared/custom-button/custom-button";
import CustomInput from "../shared/custom-input/custom-input";

interface PromoCodeInputProps {
  userId: string;
  onPromoCodeApplied: (discountPercentage: number, code: string) => void;
  disabled?: boolean;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  userId,
  onPromoCodeApplied,
  disabled = false,
}) => {
  const [promoCode, setPromoCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  const handleValidate = async () => {
    if (!promoCode.trim()) {
      setValidationMessage("Please enter a promo code");
      setIsValid(false);
      return;
    }

    setIsValidating(true);
    setValidationMessage("");

    try {
      const response = await validatePromoCode(promoCode.trim().toUpperCase(), userId);
      
      setIsValid(response.isValid);
      setValidationMessage(response.message);
      
      if (response.isValid && response.discountPercentage) {
        setDiscountPercentage(response.discountPercentage);
      }
    } catch (error: any) {
      setValidationMessage(error.response?.data?.message || "Failed to validate promo code");
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleApply = async () => {
    if (!isValid || !promoCode.trim()) {
      return;
    }

    try {
      await applyPromoCode(promoCode.trim().toUpperCase(), userId);
      onPromoCodeApplied(discountPercentage, promoCode.trim().toUpperCase());
      setValidationMessage("Promo code applied successfully!");
    } catch (error: any) {
      setValidationMessage(error.response?.data?.message || "Failed to apply promo code");
      setIsValid(false);
    }
  };

  return (
    <div className="promo-code-input-container p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Have a promo code?</h3>
      
      <div className="flex gap-2 mb-3">
        <CustomInput
          inputType="text"
          placeholder="Enter promo code"
          value={promoCode}
          onChange={(e) => {
            setPromoCode(e.target.value.toUpperCase());
            setValidationMessage("");
            setIsValid(false);
          }}
          disabled={disabled || isValidating}
          CustomStyle="flex-1"
        />
        <CustomButton
          text={isValidating ? "Validating..." : "Validate"}
          onClick={handleValidate}
          className="px-6"
        />
      </div>

      {validationMessage && (
        <div
          className={`p-3 rounded-md mb-3 ${
            isValid
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <p className="text-sm">{validationMessage}</p>
          {isValid && discountPercentage > 0 && (
            <p className="text-sm font-semibold mt-1">
              Discount: {discountPercentage}% off
            </p>
          )}
        </div>
      )}

      {isValid && (
        <CustomButton
          text="Apply Promo Code"
          onClick={handleApply}
          className="w-full bg-green-600 hover:bg-green-700"
        />
      )}
    </div>
  );
};

export default PromoCodeInput;
