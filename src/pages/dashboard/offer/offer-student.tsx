import React, { useContext, useEffect, useState } from "react";
import { Logo } from "../../../assets/images";
import { RootState } from "../../../redux/store/store";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  IconButton,

} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CustomButton from "../../../shared/custom-button/custom-button";
import OfferCard from "../../../componet/offer-card";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import { useSelector } from "react-redux";
import OfferStudentModal from "../../../componet/offer-student-modal";
import {
  createStudentOfferService,
  getAllStudentOfferService,
  getStudentOfferService,
  sendOfferService,
} from "../../../services/student-offer";
import { getAllUserByRole } from "../../../services/super-teacher";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import { SnackbarContext } from "../../../config/hooks/use-toast";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// import CreditCardIcon from "@mui/icons-material/CreditCard"; // Not used - online payment disabled
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const OfferStudent = () => {
  const role = useSelector(
    (state: RootState) => state?.user?.userData?.role.name,
  );
  const studentId = useSelector(
    (state: RootState) => state?.user?.userData?.id || ""
  );

  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [filterText, setFilterText] = useState("");
  
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'upload'>('upload'); // Default to upload only
  
  const snackbarContext = useContext(SnackbarContext);

  const fetchData = () => {
    setLoading(true);
    getAllStudentOfferService()
      .then((res) => {
        setData(res.data);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleUpdateOffer = (updatedOffer: any) => {
    setData((prevOffers: any[]) =>
      prevOffers.map((offer) =>
        offer.id === updatedOffer.id ? updatedOffer : offer,
      ),
    );
  };

  const handleUpdateAfterDelete = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
    if (role === "ROLE_STUDENT") {
      getAllUserByRole("ROLE_SUPER_TEACHER")
        .then((res) => {
          setTeachers(res.data);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [role]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleAction = (formData: any) => {
    createStudentOfferService(formData)
      .then((res) => {
        fetchData();
        handleCloseModal();
        if (snackbarContext) {
          snackbarContext.showMessage(
            "Succes",
            "Offre ajoutée avec succès",
            "success",
          );
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const handleOpenProfileDialog = (profile: any) => {
    setSelectedProfile(profile);
  };

  const handleCloseProfileDialog = () => {
    setSelectedProfile(null);
  };

  const handleOfferClick = (offer: any) => {
    setSelectedOffer(offer);
    
    // Fetch detailed offer information including subjects
    getStudentOfferService(offer.id)
      .then((res) => {
        const offerDetails = res.data;
        
        // Set available subjects from the API response
        if (offerDetails.subjects && offerDetails.subjects.length > 0) {
          setAvailableSubjects(offerDetails.subjects);
        }
        
        // For free offers, do not show subject selection
        if (offer.price === 0) {
          setIsConfirmModal(true);
        } else {
          setIsSubjectModalOpen(true);
          setSelectedSubjects([]); 
          setPaymentFile(null);
          setPaymentMethod('upload'); // Reset to upload method only
        }
      })
      .catch((e) => {
        console.log(e);
        // Fallback: still show modal even if API fails
        if (offer.price === 0) {
          setIsConfirmModal(true);
        } else {
          setIsSubjectModalOpen(true);
          setSelectedSubjects([]); 
          setPaymentFile(null);
          setPaymentMethod('upload'); // Reset to upload method only
        }
      });
  };

  const handleSubjectToggle = (subjectId: number) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(selectedSubjects.filter((id) => id !== subjectId));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    }
  };

  // Calculate total price based on offer price multiplied by number of selected subjects
  const calculateTotalPrice = () => {
    if (!selectedOffer || selectedSubjects.length === 0) return 0;
    return selectedOffer.price * selectedSubjects.length;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentFile(e.target.files[0]);
    }
  };

  const handleSubjectConfirm = () => {
    if (selectedSubjects.length === 0) {
      snackbarContext?.showMessage(
        "Erreur",
        "Veuillez sélectionner au moins une matière",
        "error"
      );
      return;
    }

    // Check if upload method is selected but no file is provided
    if (paymentMethod === 'upload' && !paymentFile) {
      snackbarContext?.showMessage(
        "Erreur",
        "Veuillez téléverser un reçu de paiement",
        "error"
      );
      return;
    }

    const formData = new FormData();
    
    // Calculer le prix total basé sur les prix individuels des matières
    const totalPrice = calculateTotalPrice();
    formData.append("totalPrice", totalPrice.toString());
    
    // Add payment method
    formData.append("paymentMethod", paymentMethod);
    
    // Ajouter le fichier de paiement si la méthode est upload
    if (paymentMethod === 'upload' && paymentFile) {
      formData.append("paymentImage", paymentFile);
    }

    // Send subject IDs as query parameter
    const subjectIdsParam = selectedSubjects.join(',');

    // Online payment method disabled - only upload available
    // if (paymentMethod === 'online') {
    //   // Handle online payment
    //   console.log('[PAYMENT] Using ONLINE payment endpoint.');
    //   handleOnlinePayment(subjectIdsParam, totalPrice);
    // } else {
      // Handle upload payment
      console.log('[PAYMENT] Using MANUAL payment endpoint.');
      sendOfferService(selectedOffer.id, formData, subjectIdsParam)
        .then((res) => {
          setIsSubjectModalOpen(false);
          // Reset states
          setSelectedSubjects([]);
          setAvailableSubjects([]);
          setPaymentFile(null);
          setSelectedOffer(null);
          setPaymentMethod('upload');
          
          if (snackbarContext) {
            snackbarContext.showMessage(
              "Succes",
              "Votre paiement a été envoyé avec succès",
              "success",
            );
          }
        })
        .catch((e) => {
          console.log(e);
          if (snackbarContext) {
            snackbarContext.showMessage(
              "Erreur",
              "Une erreur est survenue lors de l'envoi du paiement",
              "error"
            );
          }
        });
    // } // Closing the commented online payment condition
  };

  // COMMENTED OUT: Online payment method disabled
  /* const handleOnlinePayment = async (subjectIdsParam: string, totalPrice: number) => {
    if (snackbarContext) {
      snackbarContext.showMessage(
        "Info",
        "Redirection vers la plateforme de paiement...",
        "info",
      );
    }

    try {
      // Call backend to initiate payment and get payment URL
      if (!selectedOffer) throw new Error("Aucune offre sélectionnée");
      const payload = {
        student_id: studentId,
        student_offer_id: selectedOffer.id,
        subject_ids: selectedSubjects,
        payment_type: 'paymee',
      };
      
      // @ts-ignore
      const { initiatePaymeePaymentService } = await import("../../../services/payment-service");
      const result = await initiatePaymeePaymentService(payload);
      if (result && result.payment_url) {
        window.location.href = result.payment_url;
      } else {
        throw new Error("URL de paiement non reçue");
      }
    } catch (e) {
      console.log(e);
      if (snackbarContext) {
        snackbarContext.showMessage(
          "Erreur",
          "Erreur lors de l'initialisation du paiement en ligne",
          "error"
        );
      }
    }
  }; */

  const handleCloseSubjectModal = () => {
    setIsSubjectModalOpen(false);
    // Reset states when closing modal
    setSelectedSubjects([]);
    setAvailableSubjects([]);
    setPaymentFile(null);
    setSelectedOffer(null);
    setPaymentMethod('online');
  };




  const filteredTeachers = teachers.filter((teacher) =>
    teacher.fullName.toLowerCase().includes(filterText.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div
        className={`flex flex-col lg:flex-row items-start gap-8 w-full px-4 py-6 ${
          loading ? "justify-center items-center h-[60vh]" : data.length === 0 ? "justify-center items-center h-[60vh]" : ""
        }`}
      >
      {/* Popup de sélection des matières */}
      <Dialog
        open={isSubjectModalOpen}
        onClose={handleCloseSubjectModal}
        fullWidth
        maxWidth="md"
        PaperProps={{
          style: { borderRadius: 16, overflow: "hidden" },
        }}
      >
        <DialogTitle className="flex items-center justify-between text-white bg-primary">
          <span className="text-xl font-montserrat_semi_bold">
            Sélectionnez vos matières
          </span>
          <IconButton onClick={handleCloseSubjectModal} className="text-white">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent className="px-4 py-6">
          <div className="mb-6">
            <Typography variant="h6" className="mb-3 font-montserrat_medium">
              Choisissez les matières que vous souhaitez étudier
            </Typography>
            
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {availableSubjects.length > 0 ? (
                availableSubjects.map((subject) => (
                  <div 
                    key={subject.id} 
                    className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between transition-all duration-200 ${
                      selectedSubjects.includes(subject.id)
                        ? "border-primary bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleSubjectToggle(subject.id)}
                  >
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between sm:justify-start">
                        <span className="text-sm font-montserrat_medium sm:text-base">{subject.speciality}</span>
                        {selectedSubjects.includes(subject.id) && (
                          <CheckCircleOutlineIcon className="text-primary sm:hidden" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500 sm:text-sm">Niveau {subject.level}</span>
                      <span className="text-xs text-gray-400 truncate">Par {subject.superTeacherFullName}</span>
                      <span className="mt-1 text-sm font-semibold sm:text-base text-primary">
                        {selectedOffer?.price || 0} DT par matière
                      </span>
                    </div>
                    {selectedSubjects.includes(subject.id) && (
                      <CheckCircleOutlineIcon className="hidden ml-2 text-primary sm:block" />
                    )}
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center col-span-2 p-8">
                  <Typography className="text-gray-500 font-montserrat_medium">
                    Chargement des matières disponibles...
                  </Typography>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 mb-6 rounded-lg bg-gray-50">
            <Typography variant="h6" className="mb-4 font-montserrat_semi_bold">
              Détails du paiement
            </Typography>
            
            {/* Payment Method Selection */}
            <div className="mb-6">
              {/* Payment method selection disabled - only upload available */}
              <Typography className="mb-3 font-montserrat_medium">
                Méthode de paiement: Téléverser un reçu
              </Typography>
              {/* <ToggleButtonGroup commented out - online payment disabled
              <ToggleButton 
                value="online" 
                className="flex-1 py-3"
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: '#1976d2',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                  },
                }}
              >
                <CreditCardIcon className="mr-2" />
                Paiement en ligne
              </ToggleButton> */}
              {/* <div className="w-full p-3 mb-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-center">
                  <CloudUploadIcon className="mr-2 text-blue-600" />
                  <Typography className="text-blue-800 font-montserrat_medium">
                    Téléverser un reçu de paiement
                  </Typography>
                </div>
              </div> */}
            </div>
            
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <Typography className="text-sm font-montserrat_medium sm:text-base">
                  Matières sélectionnées:{" "}
                  <span className="font-bold">
                    {selectedSubjects.length} matière(s)
                  </span>
                </Typography>
                <Typography className="mt-2 text-sm font-montserrat_medium sm:text-base">
                  Prix détaillé:
                </Typography>
                <div className="mt-1 ml-2 text-xs sm:ml-4 sm:text-sm">
                  {selectedSubjects.map(subjectId => {
                    const subject = availableSubjects.find(s => s.id === subjectId);
                    return (
                      <div key={subjectId} className="flex justify-between py-1 border-b border-gray-100 last:border-b-0">
                        <span className="mr-2 truncate">{subject?.speciality || 'Matière'}</span>
                        <span className="font-medium">{selectedOffer?.price || 0} DT</span>
                      </div>
                    );
                  })}
                </div>
                <div className="p-3 mt-3 border rounded-lg bg-gradient-to-r from-blue-50 to-primary/5 border-primary/20">
                  <Typography className="text-base sm:text-lg font-montserrat_semi_bold">
                    Total:{" "}
                    <span className="text-lg text-primary sm:text-xl">
                      {calculateTotalPrice()} DT
                    </span>
                  </Typography>
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                {/* Online payment method disabled - only upload available */}
                <label className="block mb-3 text-sm font-montserrat_medium sm:text-base">
                  Téléverser le reçu de paiement
                </label>
                    <div 
                      className="flex flex-col items-center justify-center w-full transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer h-28 sm:h-32 bg-gray-50 hover:bg-gray-100"
                      onClick={() => document.getElementById('payment-file-input')?.click()}
                    >
                      <div className="flex flex-col items-center justify-center px-4">
                        <CloudUploadIcon className="w-6 h-6 mb-2 text-gray-500 sm:w-8 sm:h-8" />
                        <p className="mb-1 text-xs text-center text-gray-500 sm:mb-2 sm:text-sm">
                          <span className="font-semibold">Cliquez pour téléverser</span>
                        </p>
                        <p className="text-xs text-center text-gray-500">
                          JPG, PNG ou PDF (MAX. 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        id="payment-file-input"
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                      />
                    </div>
                    {paymentFile && (
                      <div className="p-2 mt-3 border border-green-200 rounded-lg bg-green-50">
                        <p className="text-xs font-medium text-green-700 truncate sm:text-sm">
                          ✓ Fichier sélectionné: {paymentFile.name}
                        </p>
                      </div>
                    )}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-end space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <Button
              variant="outlined"
              onClick={handleCloseSubjectModal}
              className="order-2 w-full px-4 py-2 text-sm text-gray-700 border-gray-300 rounded-lg sm:w-auto sm:px-6 sm:py-2 sm:text-base font-montserrat_medium sm:order-1"
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={handleSubjectConfirm}
              disabled={selectedSubjects.length === 0 || (paymentMethod === 'upload' && !paymentFile)}
              className={`w-full sm:w-auto font-montserrat_semi_bold bg-primary text-white py-3 sm:py-2 px-4 sm:px-6 rounded-lg text-sm sm:text-base order-1 sm:order-2 ${
                (selectedSubjects.length === 0 || (paymentMethod === 'upload' && !paymentFile)) ? "opacity-50 cursor-not-allowed" : "hover:bg-primary-dark"
              }`}
            >
              {paymentMethod === 'online' ? 'Payer en ligne' : 'Confirmer et Envoyer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Interface principale */}
      {loading ? (
        <div className="flex flex-col items-center justify-center w-full h-[40vh]">
          <div className="mb-6">
            <img
              src={Logo}
              alt="Logo"
              className="w-20 h-20 animate-spin"
              style={{ animationDuration: '1.2s' }}
            />
          </div>
          <h2 className="text-lg font-semibold text-primary">Chargement des offres...</h2>
        </div>
      ) : isConfirmModal && selectedOffer && selectedOffer.price === 0 ? (
        <div className="w-full h-[40vh] flex flex-col items-center justify-center">
          <div className="w-9/12 mb-10">
            <h1 className="text-lg text-title lg:text-3xl font-montserrat_semi_bold">
              Offre gratuite
            </h1>
          </div>
          <div className="flex flex-col items-center w-3/4 p-5 bg-white sm:w-1/2 rounded-3xl">
            <h1 className="mb-5 text-lg font-montserrat_semi_bold lg:text-3xl text-title">
              Vous allez rejoindre cette offre gratuitement !
            </h1>
            <CustomButton
              className="w-full h-10 text-white rounded-md bg-primary sm:w-1/3"
              text={"Confirmer"}
              onClick={() => {
                // For free offers, send subjectIds as empty string in query params
                sendOfferService(selectedOffer.id, {}, "")
                  .then(() => {
                    fetchData();
                    setIsConfirmModal(false);
                    if (snackbarContext) {
                      snackbarContext.showMessage(
                        "Succes",
                        "Vous avez rejoint l'offre gratuite avec succès",
                        "success"
                      );
                    }
                    if (selectedOffer.groupId) {
                      window.location.href = `/dashboard/group/${selectedOffer.groupId}`;
                    }
                  })
                  .catch((e: any) => {
                    console.log(e);
                    if (snackbarContext) {
                      snackbarContext.showMessage(
                        "Erreur",
                        "Erreur lors de la souscription à l'offre gratuite",
                        "error"
                      );
                    }
                  });
              }}
            />
          </div>
        </div>
      ) : (
        <>
          {data && data.length > 0 ? (
            <div className="w-full">
              <div className="mb-8">
                <h2 className="mb-2 text-3xl font-bold text-gray-800">Offres Disponibles</h2>
                <p className="text-gray-600">Découvrez nos offres d'apprentissage adaptées à vos besoins</p>
              </div>
              
              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                {/* Existing Offer Cards */}
                {data.map((offer: any, index: number) => (
                  <div key={index} className="w-full">
                    <OfferCard
                      offer={offer}
                      onclick={() => handleOfferClick(offer)}
                      onUpdateOffer={handleUpdateOffer}
                      onDeleteOffer={handleUpdateAfterDelete}
                    />
                  </div>
                ))}
                
                {/* Add Offer Card for Admin - Always at the end */}
                {role === "ROLE_ADMIN" && (
                  <div className="w-full">
                    <div
                      onClick={handleOpenModal}
                      className="flex flex-col items-center justify-center w-full transition-all duration-300 bg-white border-2 border-gray-300 border-dashed cursor-pointer group h-80 rounded-2xl hover:shadow-xl hover:-translate-y-1 hover:border-purple-400"
                    >
                      <div className="flex flex-col items-center text-gray-500 transition-colors duration-300 group-hover:text-purple-500">
                        <div className="p-4 mb-4 transition-colors duration-300 bg-gray-100 rounded-full sm:p-6 sm:mb-6 group-hover:bg-purple-100">
                          <AddIcon style={{ fontSize: window.innerWidth < 640 ? 36 : 48 }} />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-center sm:mb-3 sm:text-xl">Ajouter une Offre</h3>
                        <p className="px-4 text-xs text-center text-gray-400 transition-colors duration-300 sm:px-6 sm:text-sm group-hover:text-purple-400">
                          Cliquez ici pour créer une nouvelle offre étudiant
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <div className="mb-4 text-6xl">📚</div>
              <h3 className="mb-2 text-xl font-semibold">Aucune offre disponible</h3>
              <p>Les nouvelles offres apparaîtront ici bientôt.</p>
              {/* Add Offer Card for Admin when no offers exist */}
              {role === "ROLE_ADMIN" && (
                <div className="mt-8">
                  <div
                    onClick={handleOpenModal}
                    className="flex flex-col items-center justify-center h-48 transition-all duration-300 bg-white border-2 border-gray-300 border-dashed cursor-pointer group w-72 rounded-2xl hover:shadow-xl hover:-translate-y-1 hover:border-purple-400"
                  >
                    <div className="flex flex-col items-center text-gray-500 transition-colors duration-300 group-hover:text-purple-500">
                      <div className="p-4 mb-4 transition-colors duration-300 bg-gray-100 rounded-full group-hover:bg-purple-100">
                        <AddIcon style={{ fontSize: 36 }} />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-center">Ajouter une Offre</h3>
                      <p className="px-4 text-sm text-center text-gray-400 transition-colors duration-300 group-hover:text-purple-400">
                        Créez votre première offre
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <OfferStudentModal
        open={isModalOpen}
        onClose={handleCloseModal}
        modalTitle="Ajouter Offre"
        buttonText="Ajouter"
        onButtonClick={handleAction}
      />

      <Dialog
        open={Boolean(selectedProfile)}
        onClose={handleCloseProfileDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "rounded-xl p-5",
          style: { maxWidth: "800px" },
        }}
      >
        <DialogTitle className="mb-3 text-2xl font-semibold text-center text-primary">
          Détails du profil
        </DialogTitle>
        <DialogContent className="flex flex-col items-center">
          {selectedProfile && (
            <>
              <div className="flex items-center mb-4">
                <PersonIcon className="mr-2 text-primary" />
                <Typography variant="h6" className="text-xl font-medium">
                  {selectedProfile.fullName}
                </Typography>
              </div>
              <div className="flex items-center mb-4">
                <MailOutlineOutlinedIcon className="mr-2 text-primary" />
                <Typography variant="body1" className="text-lg">
                  {selectedProfile.email}
                </Typography>
              </div>
              <div className="flex items-center mb-4">
                <PhoneIcon className="mr-2 text-primary" />
                <Typography variant="body1" className="text-lg">
                  {selectedProfile.phoneNumber}
                </Typography>
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions className="justify-center">
          <Button
            onClick={handleCloseProfileDialog}
            className="px-6 py-2 text-white rounded-full bg-primary"
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
      </div>
    </div>
  );
};

export default OfferStudent;
