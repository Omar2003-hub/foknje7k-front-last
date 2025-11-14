import React, { useEffect, useState, useContext } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store/store';
import NetworkService from '../../../config/interceptor/interceptor';
import { SnackbarContext } from '../../../config/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { AppDispatch } from '../../../redux/store/store';
import { useDispatch } from 'react-redux';
import { setUserData } from '../../../redux/store/userData-slices';

type UpdateProfileData = {
  fullName: string;
  phoneNumber: string;
  email: string;
  governorate: string;
  birthday: string;
  educationLevel: string;
};

type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ProfilePage = () => {
  const userData = useSelector((state: RootState) => state.user.userData);
  const snackbarContext = useContext(SnackbarContext);
  const navigation = useNavigate();
  const dispatch: AppDispatch = useDispatch();
   const userInitials = userData
    ? userData.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : '';
  // État pour gérer l'onglet actif
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    governorate: '',
    birthday: '',
    educationLevel: '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [profileErrors, setProfileErrors] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    governorate: '',
    birthday: '',
    educationLevel: '',
  });
  
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [isLoading, setIsLoading] = useState({
    profile: false,
    password: false
  });

  useEffect(() => {
    if (userData) {
      setProfileForm({
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber,
        email: userData.email,
        governorate: userData.governorate,
        birthday: userData.birthday.split('T')[0],
        educationLevel: (userData as any).educationLevel || '' 
      });
    }
  }, [userData]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    validateProfileField(name, value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    validatePasswordField(name, value);
  };

  const validateProfileField = (name: string, value: string) => {
    let error = '';
  
    switch (name) {
      case "email":
        if (!value) {
          error = "Email est requis.";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = "Email invalide.";
        }
        break;
  
      case "fullName":
        if (!value) {
          error = "Le nom complet est requis.";
        }
        break;

      case "phoneNumber":
        if (!value) {
          error = "Le numéro de téléphone est requis.";
        } else if (!/^[0-9]{8}$/.test(value)) {
          error = "Le numéro de téléphone doit contenir exactement 8 chiffres.";
        }
        break;

      case "governorate":
        if (!value) {
          error = "Le gouvernorat est requis.";
        }
        break;

      case "birthday":
        if (!value) {
          error = "La date de naissance est requise.";
        }
        break;

      case "educationLevel":
        if (!value) {
          error = "Le niveau d'éducation est requis.";
        }
        break;
  
      default:
        break;
    }
  
    setProfileErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const validatePasswordField = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case "currentPassword":
        if (!value) {
          error = "L'ancien mot de passe est requis.";
        }
        break;
      
      case "newPassword":
        if (!value) {
          error = "Le nouveau mot de passe est requis.";
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>\/+\\[\]\-])[A-Za-z\d!@#$%^&*(),.?":{}|<>\/+\\[\]\-]{8,}$/.test(value)) {
          error = "Le mot de passe doit comporter au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.";
        }
        break;
        
      case "confirmPassword":
        if (!value) {
          error = "Veuillez confirmer le nouveau mot de passe.";
        } else if (value !== passwordForm.newPassword) {
          error = "Les mots de passe ne correspondent pas.";
        }
        break;
        
      default:
        break;
    }
    
    setPasswordErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const validateProfileForm = () => {
    let isValid = true;
    const newErrors = {...profileErrors};

    (Object.keys(profileForm) as (keyof typeof profileForm)[]).forEach(key => {
      const error = validateProfileField(key, profileForm[key]);
      if (error) {
        isValid = false;
        newErrors[key] = error;
      }
    });

    setProfileErrors(newErrors);
    return isValid;
  };

  const validatePasswordForm = () => {
    let isValid = true;
    const newErrors = {...passwordErrors};

    (Object.keys(passwordForm) as (keyof typeof passwordForm)[]).forEach(key => {
      const error = validatePasswordField(key, passwordForm[key]);
      if (error) {
        isValid = false;
        newErrors[key] = error;
      }
    });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
      isValid = false;
    }

    setPasswordErrors(newErrors);
    return isValid;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      snackbarContext?.showMessage("Erreur", "Veuillez corriger les erreurs dans le formulaire", "error");
      return;
    }

    setIsLoading(prev => ({ ...prev, profile: true }));
    
    try {
      const dataToSend: UpdateProfileData = {
        fullName: profileForm.fullName,
        phoneNumber: profileForm.phoneNumber,
        email: profileForm.email,
        governorate: profileForm.governorate,
        birthday: profileForm.birthday,
        educationLevel: profileForm.educationLevel,
      };

      const response = await updateProfileService(dataToSend);

      snackbarContext?.showMessage("Succès", "Profil mis à jour avec succès", "success");
      
      if (userData) {
        dispatch(setUserData({
          ...userData,
          ...dataToSend
        }));
      }

      setTimeout(() => {
        navigation('/home');
      }, 1500);
      
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      
      let errorMessage = "Échec de la mise à jour du profil. Veuillez réessayer.";
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      snackbarContext?.showMessage("Erreur", errorMessage, "error");
    } finally {
      setIsLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      snackbarContext?.showMessage("Erreur", "Veuillez corriger les erreurs dans le formulaire de mot de passe", "error");
      return;
    }

    setIsLoading(prev => ({ ...prev, password: true }));
    
    try {
      const dataToSend: ChangePasswordData = {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      };

      const response = await changePasswordService(dataToSend);

      snackbarContext?.showMessage("Succès", "Mot de passe mis à jour avec succès", "success");
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error: any) {
      console.error('Erreur lors du changement de mot de passe:', error);
      
      let errorMessage = "Échec de la mise à jour du mot de passe. Veuillez réessayer.";
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      snackbarContext?.showMessage("Erreur", errorMessage, "error");
    } finally {
      setIsLoading(prev => ({ ...prev, password: false }));
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement des données du profil...</p>
        </div>
      </div>
    );
  }

  const governorates = [
    'ARIANA', 'BEJA', 'BEN_AROUS', 'BIZERTE', 'GABES', 'GAFSA', 'JENDOUBA',
    'KAIRUAN', 'KASSERINE', 'KEBILI', 'KEF', 'MAHDIA', 'MANOUBA', 'MEDENINE',
    'MONASTIR', 'NABEUL', 'SFAX', 'SIDI_BOUZID', 'SILIANA', 'SOUSSE', 'TATAOUINE',
    'TOZEUR', 'TUNIS', 'ZAGHOUAN'
  ];

  const educationLevels = [
    { value: 'PERMIER_ANNEE_PRIMAIRE', label: 'Première année primaire' },
    { value: 'DEUXIEME_ANNEE_PRIMAIRE', label: 'Deuxième année primaire' },
    { value: 'TROISIEME_ANNEE_PRIMAIRE', label: 'Troisième année primaire' },
    { value: 'QUATRIEME_ANNEE_PRIMAIRE', label: 'Quatrième année primaire' },
    { value: 'CINQUIEME_ANNEE_PRIMAIRE', label: 'Cinquième année primaire' },
    { value: 'SIXIEME_ANNEE_PRIMAIRE', label: 'Sixième année primaire' },
    { value: 'SEPTIEME_ANNEE_DE_BASE', label: 'Septième année de base' },
    { value: 'HUITIEME_ANNEE_DE_BASE', label: 'Huitième année de base' },
    { value: 'NEUVIEME_ANNEE_DE_BASE', label: 'Neuvième année de base' },
    { value: 'PREMIERE_ANNEE_SECONDAIRE', label: 'Première année secondaire' },
    { value: 'DEUXIEME_ANNEE_SECONDAIRE_ECONOMIE_GESTION', label: 'Deuxième année secondaire - Économie & Gestion' },
    { value: 'DEUXIEME_ANNEE_SECONDAIRE_INFORMATIQUE', label: 'Deuxième année secondaire - Informatique' },
    { value: 'DEUXIEME_ANNEE_SECONDAIRE_LETTRES', label: 'Deuxième année secondaire - Lettres' },
    { value: 'DEUXIEME_ANNEE_SECONDAIRE_SCIENCES', label: 'Deuxième année secondaire - Sciences' },
    { value: 'TROISIEME_ANNEE_SECONDAIRE_ECONOMIE', label: 'Troisième année secondaire - Économie' },
    { value: 'TROISIEME_ANNEE_SECONDAIRE_INFORMATIQUE', label: 'Troisième année secondaire - Informatique' },
    { value: 'TROISIEME_ANNEE_SECONDAIRE_LETTRES', label: 'Troisième année secondaire - Lettres' },
    { value: 'TROISIEME_ANNEE_SECONDAIRE_SCIENCES', label: 'Troisième année secondaire - Sciences' },
    { value: 'TROISIEME_ANNEE_SECONDAIRE_MATH', label: 'Troisième année secondaire - Mathématiques' },
    { value: 'TROISIEME_ANNEE_SECONDAIRE_TECHNIQUE', label: 'Troisième année secondaire - Technique' },
    { value: 'BAC_LETTRES', label: 'Bac Lettres' },
    { value: 'BAC_SCIENCES', label: 'Bac Sciences' },
    { value: 'BAC_MATH', label: 'Bac Mathématiques' },
    { value: 'BAC_INFORMATIQUE', label: 'Bac Informatique' },
    { value: 'BAC_ECONOMIE_GESTION', label: 'Bac Économie & Gestion' },
    { value: 'BAC_TECHNIQUE', label: 'Bac Technique' },
    { value: 'FORMATION_PROFESSIONNELLE', label: 'Formation Professionnelle' },
  ];

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="max-w-6xl p-4 mx-auto md:p-6">
      <div className="overflow-hidden bg-white shadow-lg rounded-2xl">
           {/* Modification de l'en-tête avec avatar */}
       <div className="flex items-center px-6 py-6 bg-gradient-to-r from-blue-500 to-indigo-600 md:px-8">
      <div className="bg-[#09745f] border rounded-full w-12 h-12 flex items-center justify-center  text-lg font-bold shadow-md mr-4">
        {userInitials}
      </div>
  <div>
    <h1 className="text-2xl font-bold md:text-3xl">Mon Espace</h1>
    <p className="mt-1 opacity-90">Gérez vos informations personnelles et votre mot de passe</p>
  </div>
</div>
        
        <div className="flex flex-col md:flex-row">
          {/* Colonne gauche - Menu des onglets */}
          <div className="w-full border-r-2 border-gray-200 md:w-1/4 bg-gray-50">
            <div className="flex md:flex-col">
              <button
                className={`flex items-center px-6 py-4 w-full text-left transition-colors duration-200 ${
                  activeTab === 'profile' 
                    ? 'bg-gradient-to-r from-[#09745f] to-[#07b98e] text-white border-l-4 border-blue-600 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <div className="">
                  <PersonOutlineOutlinedIcon />
                </div>
                <span>Informations personnelles</span>
              </button>
              
              <button
                className={`flex items-center px-6 py-4 w-full text-left transition-colors duration-200 ${
                  activeTab === 'password' 
                    ? 'bg-gradient-to-r from-[#09745f] to-[#07b98e] text-white border-l-4 border-blue-600 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('password')}
              >
                <div className="mr-3">
                  <LockOutlinedIcon />
                </div>
                <span>Changer le mot de passe</span>
              </button>
            </div>
          </div>
          
          {/* Colonne droite - Contenu de l'onglet actif */}
          <div className="w-full p-6 md:w-3/4 md:p-8">
            {activeTab === 'profile' ? (
              // Formulaire d'informations personnelles
              <div className="mb-10">
                <div className="flex items-center mb-6">
                  <div className="p-2 mr-3 bg-blue-100 rounded-full">
                    <PersonOutlineOutlinedIcon className="text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Informations Personnelles</h2>
                </div>
                
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                 <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
  {/* Nom complet - MODIF: Alignement vertical icône */}
  <div className="relative">
    <label htmlFor="fullName" className="block mb-1 text-sm font-medium text-gray-700">
      Nom complet
    </label>
    <div className="absolute top-[38px] left-0 pl-3 flex items-center pointer-events-none"> {/* Changé: top ajusté */}
      <PersonOutlineOutlinedIcon className="h-5 w-5 text-[#156921]" />
    </div>
    <input
      type="text"
      name="fullName"
      value={profileForm.fullName}
      onChange={handleProfileChange}
      className={`w-full pl-10 pr-4 py-3 border-2 ${profileErrors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
      placeholder="Nom complet"
    />
    {profileErrors.fullName && <p className="mt-1 text-xs text-red-500">{profileErrors.fullName}</p>}
  </div>

  {/* Téléphone - MODIF: Alignement vertical icône */}
  <div className="relative">
    <label htmlFor="phoneNumber" className="block mb-1 text-sm font-medium text-gray-700">
      Numéro de téléphone
    </label>
    <div className="absolute top-[38px] left-0 pl-3 flex items-center pointer-events-none"> {/* Changé: top ajusté */}
      <PhoneIphoneOutlinedIcon className="h-5 w-5 text-[#156921]" />
    </div>
    <input
      type="tel"
      name="phoneNumber"
      value={profileForm.phoneNumber}
      onChange={handleProfileChange}
      className={`w-full pl-10 pr-4 py-3 border-2 ${profileErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
      placeholder="Numéro de téléphone"
      maxLength={8}
    />
    {profileErrors.phoneNumber && <p className="mt-1 text-xs text-red-500">{profileErrors.phoneNumber}</p>}
  </div>

  {/* Email - MODIF: Alignement vertical icône */}
  <div className="relative">
    <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
      Adresse email
    </label>
    <div className="absolute top-[38px] left-0 pl-3 flex items-center pointer-events-none"> {/* Changé: top ajusté */}
      <MailOutlineOutlinedIcon className="h-5 w-5 text-[#156921]" />
    </div>
    <input
      type="email"
      name="email"
      value={profileForm.email}
      onChange={handleProfileChange}
      className={`w-full pl-10 pr-4 py-3 border-2 ${profileErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
      placeholder="Adresse email"
    />
    {profileErrors.email && <p className="mt-1 text-xs text-red-500">{profileErrors.email}</p>}
  </div>

  {/* Gouvernorat - MODIF: Alignement vertical icône */}
  <div className="relative">
    <label htmlFor="governorate" className="block mb-1 text-sm font-medium text-gray-700">
      Gouvernorat
    </label>
    <div className="absolute top-[38px] left-0 pl-3 flex items-center pointer-events-none"> {/* Changé: top ajusté */}
      <LocationOnOutlinedIcon className="h-5 w-5 text-[#156921]" />
    </div>
    <select
      name="governorate"
      value={profileForm.governorate}
      onChange={handleProfileChange}
      className={`w-full pl-10 pr-4 py-3 border-2 ${profileErrors.governorate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white`}
    >
      <option value="">Sélectionnez un gouvernorat</option>
      {governorates.map(gov => (
        <option key={gov} value={gov}>{gov.replace(/_/g, ' ')}</option>
      ))}
    </select>
    {profileErrors.governorate && <p className="mt-1 text-xs text-red-500">{profileErrors.governorate}</p>}
  </div>

  {/* Date de naissance - MODIF: Alignement vertical icône */}
  <div className="relative">
    <label htmlFor="birthday" className="block mb-1 text-sm font-medium text-gray-700">
      Date de naissance
    </label>
    <div className="absolute top-[38px] left-0 pl-3 flex items-center pointer-events-none"> {/* Changé: top ajusté */}
      <CakeOutlinedIcon className="h-5 w-5 text-[#156921]" />
    </div>
    <input
      type="date"
      name="birthday"
      value={profileForm.birthday}
      onChange={handleProfileChange}
      className={`w-full pl-10 pr-4 py-3 border-2 ${profileErrors.birthday ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
    />
    {profileErrors.birthday && <p className="mt-1 text-xs text-red-500">{profileErrors.birthday}</p>}
  </div>

  {/* Niveau d'éducation - MODIF: Alignement vertical icône */}
  <div className="relative">
    <label htmlFor="educationLevel" className="block mb-1 text-sm font-medium text-gray-700">
      Niveau d'éducation
    </label>
    <div className="absolute top-[38px] left-0 pl-3 flex items-center pointer-events-none"> {/* Changé: top ajusté */}
      <SchoolOutlinedIcon className="h-5 w-5 text-[#156921]" />
    </div>
    <select
      name="educationLevel"
      value={profileForm.educationLevel}
      onChange={handleProfileChange}
      className={`w-full pl-10 pr-4 py-3 border-2 ${profileErrors.educationLevel ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white`}
    >
      <option value="">Sélectionnez votre niveau d'éducation</option>
      {educationLevels.map(level => (
        <option key={level.value} value={level.value}>
          {level.label}
        </option>
      ))}
    </select>
    {profileErrors.educationLevel && (
      <p className="mt-1 text-xs text-red-500">{profileErrors.educationLevel}</p>
    )}
  </div>
</div>

                  <div className="flex flex-col justify-between gap-4 pt-6 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => navigation('/home')}
                      className="flex items-center justify-center flex-1 px-6 py-3 text-white text-gray-700 transition duration-300 border border-gray-300 rounded-lg bg-red hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isLoading.profile}
                      className={`px-6 py-3  text-white bg-[#048c6b] rounded-lg hover:from-blue-600 hover:to-indigo-700 transition duration-300 flex-1 flex items-center justify-center ${
                        isLoading.profile ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading.profile ? (
                        <>
                          <svg className="w-5 h-5 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Mettre à jour le profil
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              // Formulaire de changement de mot de passe
              <div>
                <div className="flex items-center mb-6">
                  <div className="p-2 mr-3 bg-red-100 rounded-full">
                    <LockOutlinedIcon className="text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Changer votre mot de passe</h2>
                </div>
                
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
  {/* Ancien mot de passe */}
  <div className="relative">
    <label htmlFor="currentPassword" className="block mb-1 text-sm font-medium text-gray-700">
      Ancien mot de passe
    </label>
    <div className="absolute top-[38px] left-0 pl-3 flex items-center pointer-events-none">
      <LockOutlinedIcon className="h-5 w-5 text-[#156921]" />
    </div>
    <input
      type={showPasswords.current ? "text" : "password"}
      name="currentPassword"
      value={passwordForm.currentPassword}
      onChange={handlePasswordChange}
      className={`w-full pl-10 pr-10 py-3 border ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
      placeholder="Ancien mot de passe"
    />
    <button
      type="button"
      className="absolute top-[38px] right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
      onClick={() => togglePasswordVisibility('current')}
    >
      {showPasswords.current ? <VisibilityOff /> : <Visibility />}
    </button>
    {passwordErrors.currentPassword && (
      <p className="mt-1 text-xs text-red-500">{passwordErrors.currentPassword}</p>
    )}
  </div>

  {/* Nouveau mot de passe */}
  <div className="relative">
    <label htmlFor="newPassword" className="block mb-1 text-sm font-medium text-gray-700">
      Nouveau mot de passe
    </label>
    <div className="absolute top-[38px] left-0 pl-3 flex items-center pointer-events-none">
      <LockOutlinedIcon className="h-5 w-5 text-[#156921]" />
    </div>
    <input
      type={showPasswords.new ? "text" : "password"}
      name="newPassword"
      value={passwordForm.newPassword}
      onChange={handlePasswordChange}
      className={`w-full pl-10 pr-10 py-3 border ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
      placeholder="Nouveau mot de passe"
    />
    <button
      type="button"
      className="absolute top-[38px] right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
      onClick={() => togglePasswordVisibility('new')}
    >
      {showPasswords.new ? <VisibilityOff /> : <Visibility />}
    </button>
    {passwordErrors.newPassword && (
      <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword}</p>
    )}
    <p className="mt-1 text-xs text-gray-500">
      Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
    </p>
  </div>

  {/* Confirmation du mot de passe */}
  <div className="relative">
    <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium text-gray-700">
      Confirmer le nouveau mot de passe
    </label>
    <div className="absolute top-[38px] left-0 pl-3 flex items-center pointer-events-none">
      <LockOutlinedIcon className="h-5 w-5 text-[#156921]" />
    </div>
    <input
      type={showPasswords.confirm ? "text" : "password"}
      name="confirmPassword"
      value={passwordForm.confirmPassword}
      onChange={handlePasswordChange}
      className={`w-full pl-10 pr-10 py-3 border ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
      placeholder="Confirmer le nouveau mot de passe"
    />
    <button
      type="button"
      className="absolute top-[38px] right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
      onClick={() => togglePasswordVisibility('confirm')}
    >
      {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
    </button>
    {passwordErrors.confirmPassword && (
      <p className="mt-1 text-xs text-red-500">{passwordErrors.confirmPassword}</p>
    )}
  </div>
</div>

                  <div className="flex flex-col justify-between gap-4 pt-6 sm:flex-row">
                    <button
                    
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="px-6 py-3 bg-[#3492d6] text-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-300 flex-1 flex items-center justify-center"
                    >
                      Retour au profil
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isLoading.password}
                      className={`px-6 py-3  border bg-[#048c6b] text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition duration-300 flex-1 flex items-center justify-center ${
                        isLoading.password ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading.password ? (
                        <>
                          <svg className="w-5 h-5 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          Changer le mot de passe
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const updateProfileService = async (userData: UpdateProfileData) => {
  try {
    const response = await NetworkService.getInstance().sendHttpRequest({
      url: 'users/profile',
      method: 'PUT',
      data: userData,
      withLoader: true,
      withFailureLogs: true
    });
    return response.data;
  } catch (error) {
    console.error('Erreur dans updateProfileService:', error);
    throw error;
  }
};

export const changePasswordService = async (passwordData: ChangePasswordData) => {
  try {
    const response = await NetworkService.getInstance().sendHttpRequest({
      url: 'users/change-password',
      method: 'PUT',
      data: passwordData,
      withLoader: true,
      withFailureLogs: true
    });
    return response.data;
  } catch (error) {
    console.error('Erreur dans changePasswordService:', error);
    throw error;
  }
};

export default ProfilePage;