import React, { useState, useContext } from "react";
import AuthLayout from "../../../shared/auth-layout/auth-layout";
import CustomInput from "../../../shared/custom-input/custom-input";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import CustomButton from "../../../shared/custom-button/custom-button";
import { useNavigate } from "react-router-dom";
import { forgetPassword } from "../../../services/auth-service";
import { SnackbarContext } from "../../../config/hooks/use-toast";
const ForgetPassword = () => {
  const navigation = useNavigate();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleEmailBlur = () => {
    validateEmail(email);
  };
  const snackbarContext = useContext(SnackbarContext);
  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("L'adresse e-mail est requise.");
      snackbarContext?.showMessage("Erreur", "L'adresse e-mail est requise.", "error");
      return  false;
    } else if (!/\S+@\S+\.\S+/.test(value)) {
      setEmailError("Adresse e-mail invalide.");
      snackbarContext?.showMessage("Erreur", "Adresse e-mail invalide.", "error");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = () => {

    if (validateEmail(email)) {
      forgetPassword(email)
        .then((res) => {
          navigation(`/verification-code/${email}`);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  return (
    <AuthLayout
      title1={"Bienvenue à"}
      title2={"Fok Nje7ek"}
      title3={"Plateforme d'apprentissage"}
    >
      <h1 className="text-3xl font-montserrat_bold text-title mb-3">
        Réinitialiser le mot de passe
      </h1>
      <p className="text-text text-base text-center mb-10">
        Veuillez fournir l'adresse e-mail que vous avez utilisée lors de la
        création de votre compte
      </p>
      <form className="w-full" >
        <CustomInput
          placeholder={"Votre E-mail"}
          iconPrefix={<MailOutlineOutlinedIcon className="text-title" />}
          inputType={"email"}
          CustomStyle={"mb-5"}
          value={email}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur} // Handle blur
          error={!!emailError}
          errorMessage={emailError}
        />
        <div className="w-full text-right">
          <CustomButton
            text={"Envoyer"}
            className={"h-10 text-sm"}
            width={"w-48"}
            onClick={() => handleSubmit()}
          />
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgetPassword;
