import React, { useState,useContext } from "react";
import CustomInput from "../../../shared/custom-input/custom-input";
import CustomButton from "../../../shared/custom-button/custom-button";
import AuthLayout from "../../../shared/auth-layout/auth-layout";
import { useNavigate, useParams } from "react-router-dom";
import { ResetPassword } from "../../../services/auth-service";
import { SnackbarContext } from "../../../config/hooks/use-toast";
import { s } from "@fullcalendar/core/internal-common";
const VerificationCode = () => {
  const { email } = useParams();
  const navigation = useNavigate();

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isCodeVerified, setIsCodeVerified] = useState(false);

  const snackbarContext = useContext(SnackbarContext);
  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleNewPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setNewPassword(event.target.value);
  };

  const handleSubmit = () => {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>\/+[\]\\\-])[A-Za-z\d!@#$%^&*(),.?":{}|<>\/+[\]\\\-]{8,}$/;
    if (!isCodeVerified) {
      if (!code) {
        snackbarContext?.showMessage("Erreur", "Le code de vérification est requis.", "error");
        return;
      }
    }
    if (!isCodeVerified) {
      setIsCodeVerified(true);
    } else {
      if (!passwordPattern.test(password)) {
        snackbarContext?.showMessage("Erreur", "Le mot de passe doit comporter au moins 8 caractères, inclure au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial.", "error");
        return;
      }
      if (password !== newPassword) {
        snackbarContext?.showMessage("Erreur", "Les mots de passe ne correspondent pas.", "error");
        return;
      }
      if (email) {
        ResetPassword(code, email, password)
          .then((res) => {
            snackbarContext?.showMessage("Succès", "Mot de passe réinitialisé avec succès.", "success");
            navigation("/login");
          })
          .catch((e) => {
            snackbarContext?.showMessage("Erreur", "Une erreur s'est produite lors de la réinitialisation du mot de passe.", "error");
            console.log(e);
          });
      }
      console.log("Resetting password with:", password, newPassword);
    }
  };

  return (
    <AuthLayout
      title1={"Bienvenue à"}
      title2={"Fok Nje7ek"}
      title3={"Plateforme d'apprentissage"}
    >
      <h1 className="text-3xl font-montserrat_bold text-title mb-3">
        Code de vérification
      </h1>
      <p className="text-text text-base text-center mb-10">
        Veuillez fournir le code que vous avez utilisé lors de la création de
        votre compte
      </p>
      <form className="w-full">
        {!isCodeVerified ? (
          <>
            <CustomInput
              placeholder={"Votre code de vérification"}
              inputType={"text"}
              CustomStyle={"mb-5"}
              value={code}
              onChange={handleCodeChange}
            />
          </>
        ) : (
          <>
            <CustomInput
              placeholder={"Nouveau mot de passe"}
              inputType={"password"}
              CustomStyle={"mb-5"}
              value={password}
              onChange={handlePasswordChange}
            />
            <CustomInput
              placeholder={"Confirmer le mot de passe"}
              inputType={"password"}
              CustomStyle={"mb-5"}
              value={newPassword}
              onChange={handleNewPasswordChange}
            />
          </>
        )}
        <div className="w-full text-right">
          <CustomButton
            text={
              isCodeVerified
                ? "Réinitialiser le mot de passe"
                : "Vérifier le code"
            }
            className={"h-10 text-sm"}
            width={isCodeVerified ? "w-72" : "w-48"}
            onClick={() => handleSubmit()}
          />
        </div>
      </form>
    </AuthLayout>
  );
};

export default VerificationCode;
