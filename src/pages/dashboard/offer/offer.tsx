import React, { useContext, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Card,

} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
// import CreditCardIcon from "@mui/icons-material/CreditCard"; // Not used - online payment disabled

import OfferCard from "../../../componet/offer-card";
import FormModal from "../../../componet/offerModal";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import CustomButton from "../../../shared/custom-button/custom-button";
import { RootState } from "../../../redux/store/store";
import { useSelector } from "react-redux";
import {
  createTeacherOfferService,
  getAllTeacherOfferService,
  sendOfferTeacherService,
} from "../../../services/teacher-offer";
import { SnackbarContext } from "../../../config/hooks/use-toast";

const Offer = () => {
  const role = useSelector(
    (state: RootState) => state?.user?.userData?.role.name,
  );

  const snackbarContext = useContext(SnackbarContext);

  const [data, setData] = useState<any>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'upload'>('upload'); // Default to upload only
  const fetchData = () => {
    getAllTeacherOfferService()
      .then((res) => {
        console.log(res.data);
        setData(res.data);
      })
      .catch((e) => {
        console.log(e);
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
  }, []);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleAction = (formData: any) => {
    createTeacherOfferService(formData)
      .then((res) => {
        fetchData();
        handleCloseModal();
        if (snackbarContext) {
          snackbarContext.showMessage(
            "Succes",
            "Offre Ajouter avec succée",
            "success",
          );
        }
      })
      .catch((e) => {
        console.log(e);
      });
    console.log("Form Data:", formData);
  };

  const handleCloseProfileDialog = () => {
    setSelectedProfile(null);
  };

  const handleOfferClick = (offer: any) => {
    setSelectedOffer(offer);
    
    // For free offers, skip payment modal
    if (offer.price === 0) {
      setIsConfirmModal(true);
    } else {
      // For paid offers, show payment modal
      setIsConfirmModal(true);
      setSelectedFile(null);
      setPaymentMethod('upload'); // Reset to upload method only
    }
  };

  const handleBackToMainView = () => {
    setIsConfirmModal(false);
    setSelectedOffer(null);
    setSelectedFile(null);
    setPaymentMethod('upload');
  };

  // COMMENTED OUT: Online payment method disabled
  /* const handleOnlinePayment = async () => {
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
        teacher_id: teacherId,
        teacher_offer_id: selectedOffer.id,
        payment_type: 'paymee',
      };
      
      // @ts-ignore
      const { initiateTeacherPaymeePaymentService } = await import("../../../services/payment-service");
      const result = await initiateTeacherPaymeePaymentService(payload);
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



  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setSelectedFile(file);
  };

  const handleCardClick = () => {
    const inputElement = document.getElementById("file-input");
    if (inputElement) {
      inputElement.click();
    }
  };
  const handleConfirmPayment = () => {
    // For free offers, send directly without payment
    if (selectedOffer.price === 0) {
      const formData = new FormData();
      sendOfferTeacherService(selectedOffer.id, formData)
        .then((res) => {
          console.log(res);
          handleBackToMainView();
          if (snackbarContext) {
            snackbarContext.showMessage(
              "Succès",
              "Vous avez rejoint l'offre gratuite avec succès",
              "success",
            );
          }
        })
        .catch((e) => {
          console.log(e);
          if (snackbarContext) {
            snackbarContext.showMessage(
              "Erreur",
              "Erreur lors de la souscription à l'offre gratuite",
              "error"
            );
          }
        });
      return;
    }

    // For paid offers, only upload payment method is available
    // Online payment method has been disabled
    // if (paymentMethod === 'online') {
    //   handleOnlinePayment();
    // } else {
      // Handle upload payment
      if (!selectedFile) {
        if (snackbarContext) {
          snackbarContext.showMessage(
            "Erreur",
            "Veuillez téléverser un reçu de paiement",
            "error"
          );
        }
        return;
      }

      const confirmedData = new FormData();
      confirmedData.append("paymentImage", selectedFile);
      confirmedData.append("paymentMethod", paymentMethod);
      
      sendOfferTeacherService(selectedOffer.id, confirmedData)
        .then((res) => {
          console.log(res);
          handleBackToMainView();
          if (snackbarContext) {
            snackbarContext.showMessage(
              "Succès",
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
    // }  // Closing the commented online payment condition
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div
        className={`flex flex-col lg:flex-row items-start gap-8 w-full px-4 py-6 ${
          data.length === 0 ? "justify-center items-center h-[60vh]" : ""
        }`}
      >
      {isConfirmModal ? (
        selectedOffer && selectedOffer.price === 0 ? (
          // Free offer modal
          <div className="w-full min-h-[40vh] flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-2xl mb-6 sm:mb-10">
              <h1 className="text-xl text-center sm:text-2xl lg:text-3xl text-title font-montserrat_semi_bold">
                Offre gratuite
              </h1>
            </div>
            <div className="flex flex-col items-center w-full max-w-lg p-4 bg-white shadow-lg sm:p-6 rounded-2xl sm:rounded-3xl">
              <h1 className="mb-4 text-base leading-relaxed text-center sm:mb-6 sm:text-lg lg:text-xl font-montserrat_semi_bold text-title">
                Vous allez rejoindre cette offre gratuitement !
              </h1>
              <div className="flex flex-col w-full gap-3 sm:flex-row sm:justify-between">
                <CustomButton
                  className="order-2 w-full px-6 py-3 font-medium bg-white border rounded-lg sm:w-auto border-primary text-primary sm:order-1"
                  text={"Précédent"}
                  onClick={handleBackToMainView}
                />
                <CustomButton
                  className="order-1 w-full px-6 py-3 font-medium text-white rounded-lg sm:w-auto bg-primary sm:order-2"
                  text={"Confirmer"}
                  onClick={handleConfirmPayment}
                />
              </div>
            </div>
          </div>
        ) : (
          // Paid offer modal
          <div className="w-full min-h-[70vh] flex flex-col items-center px-4">
            <div className="w-full max-w-2xl mb-6 sm:mb-10">
              <h1 className="text-xl text-center sm:text-2xl lg:text-3xl text-title font-montserrat_semi_bold">
                Confirmer offre
              </h1>
            </div>
            <div className="flex flex-col items-center w-full max-w-lg p-4 bg-white shadow-lg sm:p-6 rounded-2xl sm:rounded-3xl">
              <h1 className="mb-4 text-base text-center sm:mb-6 sm:text-lg lg:text-xl font-montserrat_semi_bold text-title">
                Confirmer le Paiement
              </h1>
              
              {/* Payment Method Selection - COMMENTED OUT: Only upload method available now 
              <div className="w-full mb-6">
                <Typography className="mb-3 text-center font-montserrat_medium">
                  Choisissez votre méthode de paiement:
                </Typography>
                <ToggleButtonGroup
                  value={paymentMethod}
                  exclusive
                  onChange={(event, newMethod) => {
                    if (newMethod !== null) {
                      setPaymentMethod(newMethod);
                    }
                  }}
                  className="w-full"
                >
                  <ToggleButton 
                    value="upload" 
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
                    <CloudUploadIcon className="mr-2" />
                    Téléverser un reçu
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
              */}

              {/* Online payment method disabled - only upload available */}
              <p className="px-2 mb-4 text-xs text-center text-gray-600 sm:mb-6 sm:text-sm font-montserrat_regular">
                Veuillez fournir une image claire du reçu de paiement
              </p>
                  <Card
                    className="flex flex-col items-center justify-center w-full p-4 mb-4 transition-colors border-2 border-dashed cursor-pointer sm:p-6 sm:mb-6 border-primary hover:border-primary/70"
                    onClick={handleCardClick}
                  >
                    <input
                      type="file"
                      id="file-input"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <AddIcon className="mb-2 text-4xl sm:text-6xl text-primary" />
                    <Typography className="text-sm text-center text-primary font-montserrat_semi_bold sm:text-base">
                      {selectedFile ? (
                        <span className="break-all">{selectedFile.name}</span>
                      ) : (
                        "Ajouter le reçu"
                      )}
                    </Typography>
                    {selectedFile && (
                      <Typography className="mt-1 text-xs text-gray-500">
                        ✓ Fichier sélectionné
                      </Typography>
                    )}
                  </Card>
              
              <div className="flex flex-col w-full gap-3 sm:flex-row sm:justify-between">
                <CustomButton
                  className="order-2 w-full px-6 py-3 font-medium bg-white border rounded-lg sm:w-auto border-primary text-primary sm:order-1"
                  text={"Précédent"}
                  onClick={handleBackToMainView}
                />
                <CustomButton
                  className="order-1 w-full px-6 py-3 font-medium text-white rounded-lg sm:w-auto bg-primary sm:order-2"
                  text={'Envoyer'}
                  onClick={handleConfirmPayment}
                />
              </div>
            </div>
          </div>
        )
      ) : (
        <>
          {data && data.length > 0 ? (
            <div className="w-full">
              <div className="mb-8">
                <h2 className="mb-2 text-3xl font-bold text-gray-800">Offres Professeurs</h2>
                <p className="text-gray-600">Rejoignez notre plateforme et partagez votre expertise</p>
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
            ))}                {/* Add Offer Card for Admin - Always at the end */}
                  {role === "ROLE_ADMIN" && (
                    <div className="w-full">
                        <div
                          onClick={handleOpenModal}
                          className="flex flex-col items-center justify-center w-full transition-all duration-300 bg-white border-2 border-gray-300 border-dashed cursor-pointer group h-80 rounded-2xl hover:shadow-xl hover:-translate-y-1 hover:border-blue-400"
                        >
                        <div className="flex flex-col items-center text-gray-500 transition-colors duration-300 group-hover:text-blue-500">
                          <div className="p-4 mb-4 transition-colors duration-300 bg-gray-100 rounded-full sm:p-6 group-hover:bg-blue-100 sm:mb-6">
                            <AddIcon style={{ fontSize: window.innerWidth < 640 ? 36 : 48 }} />
                          </div>
                          <h3 className="mb-2 text-lg font-semibold text-center sm:text-xl sm:mb-3">Ajouter une Offre</h3>
                          <p className="px-4 text-xs text-center text-gray-400 transition-colors duration-300 sm:text-sm sm:px-6 group-hover:text-blue-400">
                            Cliquez ici pour créer une nouvelle offre professeur
                          </p>
                        </div>
                        </div>
                    </div>
                  )}
              </div>
              
              {data.length > 4 && (
                <div className="flex justify-center mt-8">
                  <button className="px-6 py-3 font-semibold text-white transition-colors rounded-full bg-primary hover:bg-primary-dark">
                    Voir plus d'offres
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <div className="mb-4 text-6xl">🎓</div>
              <h3 className="mb-2 text-xl font-semibold">Aucune offre disponible</h3>
              <p>Les nouvelles offres pour enseignants apparaîtront ici bientôt.</p>
              {/* Add Offer Card for Admin when no offers exist */}
              {role === "ROLE_ADMIN" && (
                <div className="mt-6 sm:mt-8">
                  <div
                    onClick={handleOpenModal}
                    className="flex flex-col items-center justify-center w-full h-40 max-w-sm mx-auto transition-all duration-300 bg-white border-2 border-gray-300 border-dashed cursor-pointer group sm:h-48 rounded-2xl hover:shadow-xl hover:-translate-y-1 hover:border-blue-400"
                  >
                    <div className="flex flex-col items-center px-4 text-gray-500 transition-colors duration-300 group-hover:text-blue-500">
                      <div className="p-3 mb-3 transition-colors duration-300 bg-gray-100 rounded-full sm:p-4 group-hover:bg-blue-100 sm:mb-4">
                        <AddIcon style={{ fontSize: window.innerWidth < 640 ? 28 : 36 }} />
                      </div>
                      <h3 className="mb-1 text-base font-semibold text-center sm:text-lg sm:mb-2">Ajouter une Offre</h3>
                      <p className="text-xs text-center text-gray-400 transition-colors duration-300 sm:text-sm group-hover:text-blue-400">
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

      <FormModal
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
          Profile Details
        </DialogTitle>
        <DialogContent className="flex flex-col items-center">
          {selectedProfile && (
            <>
              <img
                alt="img"
                src={selectedProfile.photo}
                className="w-32 h-32 mb-5 rounded-full shadow-lg"
              />
              <div className="flex items-center mb-4">
                <PersonIcon className="mr-2 text-primary" />
                <Typography variant="h6" className="text-xl font-medium">
                  {selectedProfile.name}
                </Typography>
              </div>
              <div className="flex items-center mb-4">
                <PhoneIcon className="mr-2 text-primary" />
                <Typography variant="body1" className="text-lg">
                  {selectedProfile.phone}
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
            Close
          </Button>
        </DialogActions>
      </Dialog>
      </div>
    </div>
  );
};

export default Offer;
