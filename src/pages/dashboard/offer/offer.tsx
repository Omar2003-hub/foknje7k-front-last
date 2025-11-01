import React, { useContext, useEffect, useState } from "react";
import {
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Card,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import Carousel from "react-material-ui-carousel";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import AddIcon from "@mui/icons-material/Add";
// import CreditCardIcon from "@mui/icons-material/CreditCard"; // Not used - online payment disabled
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
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
  const teacherId = useSelector(
    (state: RootState) => state?.user?.userData?.id || ""
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

  const groupedSrcList: any[] = data.reduce(
    (result: any, src: any, index: number) => {
      const pairIndex = Math.floor(index / 2);
      if (!result[pairIndex]) {
        result[pairIndex] = [];
      }
      result[pairIndex].push(src);
      return result;
    },
    [],
  );

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
    <div
      className={`flex flex-col  lg:flex-row items-center w-full ${
        data.length === 0 ? "justify-center h-[60vh]" : ""
      }`}
    >
      {isConfirmModal ? (
        selectedOffer && selectedOffer.price === 0 ? (
          // Free offer modal
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
              <div className="flex flex-col justify-between w-full sm:flex-row">
                <CustomButton
                  className="w-full h-10 mb-4 bg-white border rounded-md border-primary text-primary sm:mb-0 sm:w-1/3"
                  text={"Précédent"}
                  onClick={handleBackToMainView}
                />
                <CustomButton
                  className="w-full h-10 text-white rounded-md bg-primary sm:w-1/3"
                  text={"Confirmer"}
                  onClick={handleConfirmPayment}
                />
              </div>
            </div>
          </div>
        ) : (
          // Paid offer modal
          <div className="w-full h-[70vh] flex flex-col items-center">
            <div className="w-9/12 mb-10">
              <h1 className="text-lg text-title lg:text-3xl font-montserrat_semi_bold">
                Confirmer offre
              </h1>
            </div>
            <div className="flex flex-col items-center w-3/4 p-5 bg-white sm:w-1/2 rounded-3xl">
              <h1 className="mb-5 text-lg font-montserrat_semi_bold lg:text-3xl text-title">
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
              <p className="mb-5 text-sm font-montserrat_regular text-text">
                Veuillez fournir une image claire du reçu de paiement
              </p>
                  <Card
                    className="flex flex-col items-center justify-center w-full p-6 mb-5 border-2 border-dashed cursor-pointer border-primary"
                    onClick={handleCardClick}
                  >
                    <input
                      type="file"
                      id="file-input"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <AddIcon className="mb-2 text-6xl text-primary" />
                    <Typography className="text-primary font-montserrat_semi_bold">
                      {selectedFile ? selectedFile.name : "Ajouter le reçu"}
                    </Typography>
                  </Card>
              
              <div className="flex flex-col justify-between w-full sm:flex-row">
                <CustomButton
                  className="w-full h-10 mb-4 bg-white border rounded-md border-primary text-primary sm:mb-0 sm:w-1/3"
                  text={"Précédent"}
                  onClick={handleBackToMainView}
                />
                <CustomButton
                  className="w-full h-10 text-white rounded-md bg-primary sm:w-1/3"
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
            <div className="w-full h-full md:w-8/12">
              <Carousel
                navButtonsAlwaysVisible={true}
                navButtonsProps={{
                  style: {
                    backgroundColor: "white",
                    color: "black",
                    margin: "0 0px",
                  },
                }}
                NextIcon={<ArrowForwardIosIcon />}
                PrevIcon={<ArrowBackIosIcon />}
                animation={"slide"}
                autoPlay={false}
                indicators={false}
              >
                {groupedSrcList.map((pair, index) => (
                  <Grid
                    container
                    spacing={2}
                    className="px-5 md:px-16"
                    key={index}
                  >
                    {pair.map(
                      (src: any, imgIndex: React.Key | null | undefined) => (
                        <Grid item xs={12} sm={6} key={imgIndex}>
                          <OfferCard
                            offer={src}
                            onclick={() => handleOfferClick(src)}
                            onUpdateOffer={handleUpdateOffer}
                            onDeleteOffer={handleUpdateAfterDelete}
                          />
                        </Grid>
                      ),
                    )}
                  </Grid>
                ))}
              </Carousel>
            </div>
          ) : (
            <div></div>
          )}

          {role === "ROLE_ADMIN" && (
            <div className="flex justify-center w-full mt-5 item-center md:w-1/3 md:mt-0">
              <div
                onClick={handleOpenModal}
                className="p-5 rounded-full cursor-pointer bg-primary"
              >
                <AddIcon className="text-white" style={{ fontSize: 50 }} />
              </div>
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
  );
};

export default Offer;
