import React, { useContext, useEffect, useState } from "react";
import { RootState } from "../../../redux/store/store";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CustomButton from "../../../shared/custom-button/custom-button";
import Carousel from "react-material-ui-carousel";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
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
    getAllStudentOfferService()
      .then((res) => {
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


  const filteredTeachers = teachers.filter((teacher) =>
    teacher.fullName.toLowerCase().includes(filterText.toLowerCase()),
  );

  return (
    <div
      className={`flex flex-col lg:flex-row items-center w-full ${
        data.length === 0 ? "justify-center h-[60vh]" : ""
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
            
            <div className="grid grid-cols-2 gap-4">
              {availableSubjects.length > 0 ? (
                availableSubjects.map((subject) => (
                  <div 
                    key={subject.id} 
                    className={`p-4 rounded-lg border-2 cursor-pointer flex items-center justify-between ${
                      selectedSubjects.includes(subject.id)
                        ? "border-primary bg-blue-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => handleSubjectToggle(subject.id)}
                  >
                    <div className="flex flex-col">
                      <span className="font-montserrat_medium">{subject.speciality}</span>
                      <span className="text-sm text-gray-500">Niveau {subject.level}</span>
                      <span className="text-xs text-gray-400">Par {subject.superTeacherFullName}</span>
                      <span className="text-sm font-semibold text-primary">
                        {selectedOffer?.price || 0} DT par matière
                      </span>
                    </div>
                    {selectedSubjects.includes(subject.id) && (
                      <CheckCircleOutlineIcon className="text-primary" />
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
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Typography className="font-montserrat_medium">
                  Matières sélectionnées:{" "}
                  <span className="font-bold">
                    {selectedSubjects.length} matière(s)
                  </span>
                </Typography>
                <Typography className="font-montserrat_medium">
                  Prix détaillé:
                </Typography>
                <div className="ml-4 text-sm">
                  {selectedSubjects.map(subjectId => {
                    const subject = availableSubjects.find(s => s.id === subjectId);
                    return (
                      <div key={subjectId} className="flex justify-between">
                        <span>{subject?.speciality || 'Matière'}</span>
                        <span>{selectedOffer?.price || 0} DT</span>
                      </div>
                    );
                  })}
                </div>
                <Typography className="mt-2 text-lg font-montserrat_semi_bold">
                  Total:{" "}
                  <span className="text-primary">
                    {calculateTotalPrice()} DT
                  </span>
                </Typography>
              </div>
              
              <div>
                {/* Online payment method disabled - only upload available */}
                <label className="block mb-2 font-montserrat_medium">
                  Téléverser le reçu de paiement
                </label>
                    <div 
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      onClick={() => document.getElementById('payment-file-input')?.click()}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <CloudUploadIcon className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Cliquez pour téléverser</span>
                        </p>
                        <p className="text-xs text-gray-500">
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
                      <p className="mt-2 text-sm text-gray-600">
                        Fichier sélectionné: {paymentFile.name}
                      </p>
                    )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outlined"
              onClick={handleCloseSubjectModal}
              className="px-6 py-2 text-gray-700 border-gray-300 rounded-lg font-montserrat_medium"
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={handleSubjectConfirm}
              disabled={selectedSubjects.length === 0 || (paymentMethod === 'upload' && !paymentFile)}
              className={`font-montserrat_semi_bold bg-primary text-white py-2 px-6 rounded-lg ${
                (selectedSubjects.length === 0 || (paymentMethod === 'upload' && !paymentFile)) ? "opacity-50 cursor-not-allowed" : "hover:bg-primary-dark"
              }`}
            >
              {paymentMethod === 'online' ? 'Payer en ligne' : 'Confirmer et Envoyer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Interface principale */}
      {isConfirmModal && selectedOffer && selectedOffer.price === 0 ? (
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
          {role === "ROLE_STUDENT" && (
            <div
              className={
                "flex flex-col item center p-5 w-80 h-[65vh] bg-white rounded-3xl overflow-y-auto shadow-lg"
              }
            >
              <h1
                className={"text-title font-montserrat_semi_bold text-2xl mb-7"}
              >
                Autres Profs
              </h1>
              <input
                type="text"
                placeholder="Rechercher un professeur..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="p-2 mb-4 border rounded"
              />
              {filteredTeachers.map((item, index) => (
                <div
                  key={index.toString()}
                  className="flex items-center justify-between w-full mb-5"
                >
                  <p className="text-lg text-title font-montserrat_semi_bold">
                    {item.fullName}
                  </p>
                  <div className={"flex"}>
                    <div
                      className="mx-3 cursor-pointer"
                      onClick={() => handleOpenProfileDialog(item)}
                    >
                      <VisibilityIcon className="text-primary" />
                    </div>
                  </div>
                </div>
              ))}
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
  );
};

export default OfferStudent;
