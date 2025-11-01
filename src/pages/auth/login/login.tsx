import React, { useState, useContext } from "react";
import AuthLayout from "../../../shared/auth-layout/auth-layout";
import CustomInput from "../../../shared/custom-input/custom-input";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CustomButton from "../../../shared/custom-button/custom-button";
import { useNavigate } from "react-router-dom";
import { loginService } from "../../../services/auth-service";
import { useDispatch } from "react-redux";
import { logIn } from "../../../redux/store/isLogged-slices";
import { setUserData } from "../../../redux/store/userData-slices";
import { AppDispatch } from "../../../redux/store/store";
import { SnackbarContext } from "../../../config/hooks/use-toast";
const Login = () => {
  const navigation = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const snackbarContext = useContext(SnackbarContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [isChecked, setIsChecked] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    validateField(name, value);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  };

  const validateField = (name: string, value: string) => {
    let error = "";
  
    switch (name) {
      case "email":
        if (!value) {
          error = "Email est requis.";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = "Email invalide.";
        }
        break;
  
      case "password":
        if (!value) {
          error = "Mot de passe est requis.";
        } else if (
          !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>\/+\\[\]\-])[A-Za-z\d!@#$%^&*(),.?":{}|<>\/+\\[\]\-]{8,}$/.test(value)
        ) {
          error =
            "Les mots de passe doivent comporter au moins 8 caractères et inclure au moins une lettre majuscule, " +
            "une lettre minuscule, un chiffre et un caractère spécial.";
        }
        break;
  
      default:
        break;
    }
  
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    return error;
  };
  
  

  const validateForm = () => {
    let isValid = true;

    for (const [name, value] of Object.entries(formData)) {
      const error = validateField(name, value as string);
      if (error) {
        isValid = false;
        snackbarContext?.showMessage("Erreur", error, "error");
        break;
      }
    }

    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }


    loginService(formData)
      .then((res) => {
        dispatch(logIn());
        if (res.data.userEntityDTO.role.name === "ROLE_TEACHER") {
          navigation("/subject");
        } else {
          navigation("/home");
        }
        if(snackbarContext) {
          snackbarContext.showMessage("Succès", "Vous êtes connecté", "success");
        }
        dispatch(setUserData(res.data.userEntityDTO));
        localStorage.setItem("token", res.data.accessToken);
      })
      .catch((e) => {
        if(e.response.data.errors[0] === "Le compte utilisateur est désactivé") {
          if(snackbarContext) {
            snackbarContext.showMessage("Erreur", "Verifier votre email pour activer votre compte", "error");
            navigation("/login");
          }
        }
        if(e.response.data.errors[0] === "Bad credentials") {
          if(snackbarContext) {
            snackbarContext.showMessage("Erreur", "Email ou mot de passe incorrect", "error");
          }
        }
        
      });



  };

  return (
    <AuthLayout
      title1={"Bienvenue à"}
      title2={"Fok Nje7ek"}
      title3={"Plateforme d'apprentissage"}
    >
      <form className="w-full" >
        <CustomInput
          label={"Email"}
          inputType="email"
          iconPrefix={<MailOutlineOutlinedIcon className="text-title" />}
          placeholder={"Votre E-mail"}
          CustomStyle={"mb-5"}
          value={formData.email}
          name="email"
          onChange={handleInputChange}
          onBlur={handleInputBlur} // Handle blur
          error={!!errors.email}
          errorMessage={errors.email}
        />
        <CustomInput
          label="Mot de passe"
          inputType={"password"}
          placeholder={"Votre Mot de passe"}
          CustomStyle={"mb-5"}
          iconPrefix={<LockOutlinedIcon className="text-title" />}
          value={formData.password}
          name="password"
          onChange={handleInputChange}
          onBlur={handleInputBlur} // Handle blur
          error={!!errors.password}
          errorMessage={errors.password}
        />
        <div className="flex justify-between w-full mb-5">
          <label className={`flex items-center space-x-3`}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
              className="w-4 h-4 rounded form-checkbox me-1 accent-primary border-primary "
            />
            <span className="text-xs text-title font-montserrat_regular">
              Garde-moi connecté
            </span>
          </label>
          <p
            onClick={() => navigation("/forget-password")}
            className="text-xs cursor-pointer text-text font-montserrat_medium"
          >
            Mot de passe oublié ?
          </p>
        </div>
        <CustomButton
          text="Se connecter"
          className={"w-full h-14 mt-6"}
          onClick={() => handleSubmit()}
        />
        <div className="mt-4 text-center">
          <span className="text-sm text-title font-montserrat_regular">
            Vous n'avez pas de compte ?{" "}
          </span>
          <span
            onClick={() => navigation("/role")}
            className="text-sm cursor-pointer text-primary font-montserrat_medium hover:underline"
          >
            Créer un compte
          </span>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
