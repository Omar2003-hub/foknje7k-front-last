import React, { useState, useContext, useEffect, useCallback } from "react";
import AuthLayout from "../../../shared/auth-layout/auth-layout";
import CustomInput from "../../../shared/custom-input/custom-input";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CustomButton from "../../../shared/custom-button/custom-button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmEmail } from "../../../services/auth-service";
import { SnackbarContext } from "../../../config/hooks/use-toast";

const ConfirmEmail = () => {
  const navigate = useNavigate();
  const snackbarContext = useContext(SnackbarContext);
  const [searchParams] = useSearchParams();
  
  const email = searchParams.get("email") || "";
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [error, setError] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value);
    setError("");
  };

  const handleCodeBlur = () => {
    validateCode(code);
  };

  const validateCode = (value: string) => {
    let errorMsg = "";
    if (!value) {
      errorMsg = "Code de confirmation est requis.";
    } else if (value.length < 4) {
      errorMsg = "Code de confirmation invalide.";
    }
    setError(errorMsg);
    return errorMsg;
  };

  const handleConfirmation = useCallback(async (codeValue: string) => {
    if (isSubmitting) return;
    if (!email) {
      setError("Email manquant dans l'URL.");
      return;
    }
    setIsSubmitting(true);
    try {
      await confirmEmail(email, codeValue);
      if (snackbarContext) {
        snackbarContext.showMessage(
          "Succès",
          "Votre email a été confirmé avec succès!",
          "success"
        );
      }
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error: any) {
      console.error("Confirmation error:", error);
      const errorMessage =
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        "Une erreur s'est produite lors de la confirmation. Veuillez réessayer.";
      setError(errorMessage);
      if (snackbarContext) {
        snackbarContext.showMessage("Erreur", errorMessage, "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [navigate, snackbarContext, isSubmitting, email]);

  // Auto-submit if both email and code are in URL
  useEffect(() => {
    if (!email) {
      setError("Email manquant dans l'URL. Veuillez utiliser le lien de confirmation envoyé par email.");
      return;
    }
    const codeParam = searchParams.get("code");
    if (email && codeParam) {
      handleConfirmation(codeParam);
    }
    // If only email is present, do nothing (wait for user input)
  }, [searchParams, handleConfirmation, email]);

  const handleSubmit = () => {
    if (validateCode(code)) {
      return;
    }
    handleConfirmation(code);
  };

  if (!email) {
    return (
      <AuthLayout
        title1={"Erreur"}
        title2={"Fok Nje7ek"}
        title3={"Email manquant"}
      >
        <div className="w-full text-center text-red-600 font-bold p-8">
          L'email est manquant dans l'URL. Veuillez utiliser le lien de confirmation envoyé par email ou contactez le support.
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title1={"Bienvenue à"}
      title2={"Fok Nje7ek"}
      title3={"Confirmation de votre email"}
    >
      <form className="w-full">
        <div className="mb-6 text-center">
          <p className="text-sm text-title font-montserrat_regular">
            Veuillez entrer le code de confirmation que vous avez reçu.
          </p>
        </div>
        <CustomInput
          label="Code de confirmation"
          inputType={"text"}
          placeholder={"Entrez le code reçu"}
          CustomStyle={"mb-5"}
          iconPrefix={<LockOutlinedIcon className="text-title" />}
          value={code}
          name="code"
          onChange={handleCodeChange}
          onBlur={handleCodeBlur}
          error={!!error}
          errorMessage={error}
        />
        <CustomButton
          text={isSubmitting ? "Confirmation en cours..." : "Confirmer"}
          className={"w-full h-14 mt-6"}
          onClick={() => handleSubmit()}
        />
        <div className="mt-4 text-center">
          <span className="text-sm text-title font-montserrat_regular">
            Déjà confirmé ?{" "}
          </span>
          <span
            onClick={() => navigate("/login")}
            className="text-sm cursor-pointer text-primary font-montserrat_medium hover:underline"
          >
            Se connecter
          </span>
        </div>
        <div className="mt-2 text-center">
          <span className="text-sm text-title font-montserrat_regular">
            Vous n'avez pas reçu le code ?{" "}
          </span>
          <span
            onClick={() => navigate("/register")}
            className="text-sm cursor-pointer text-primary font-montserrat_medium hover:underline"
          >
            S'inscrire à nouveau
          </span>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ConfirmEmail;
