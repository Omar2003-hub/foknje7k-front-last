import React, { useContext, useState, MouseEvent } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CustomButton from "../shared/custom-button/custom-button";
import FormModal from "./offerModal";
import { RootState } from "../redux/store/store";
import { useSelector } from "react-redux";
import {
  deleteTeacherOfferService,
  updateTeacherOfferService,
} from "../services/teacher-offer";
import { useLocation } from "react-router-dom";
import OfferStudentModal from "./offer-student-modal";
import {
  deleteStudentOfferService,
  updateStudentOfferService,
} from "../services/student-offer";
import { SnackbarContext } from "../config/hooks/use-toast";
import "./cards.css";

// @ts-ignore
const OfferCard = ({ offer, onclick, onUpdateOffer, onDeleteOffer }) => {
  const location = useLocation();
  const isOfferStudent = location.pathname.includes("offer-student");
  const snackbarContext = useContext(SnackbarContext);

  const role = useSelector(
    (state: RootState) => state?.user?.userData?.role.name,
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const isFreeOffer = offer.price === 0;

  const themeColors = {
    free: {
      border: "#3B82F6",        
      title: "#1D4ED8",         
      subTitle: "#60A5FA",      
      price: "#2563EB",         
      priceBg: "#DBEAFE",       
      badgeBg: "#DBEAFE",       
      badgeText: "#1E40AF",   
      check: "#3B82F6",        
      icon: "#3B82F6",          
      buttonStart: "#3B82F6",   
      buttonEnd: "#2563EB",     
      buttonHoverStart: "#2563EB", 
      buttonHoverEnd: "#3B82F6",   
    },
    paid: {
      border: "#10B981",        
      title: "#047857",         
      subTitle: "#34D399",      
      price: "#059669",         
      priceBg: "#D1FAE5",       
      badgeBg: "#D1FAE5",       
      badgeText: "#065F46",     
      check: "#10B981",        
      icon: "#10B981",          
      buttonStart: "#10B981",  
      buttonEnd: "#059669",    
      buttonHoverStart: "#059669", 
      buttonHoverEnd: "#10B981",   
    }
  };

  const colors = isFreeOffer ? themeColors.free : themeColors.paid;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const benefitsArray = offer?.offerDetails?.split(" \n ");
  const handleAction = (formData: any) => {
    if (isOfferStudent) {
      updateStudentOfferService(offer.id, formData)
        .then((updatedOffer) => {
          onUpdateOffer(updatedOffer.data);
          handleClose();
          handleCloseModal();
          if (snackbarContext) {
            snackbarContext.showMessage(
              "Succes",
              "Offre Modifier avec succée",
              "success",
            );
          }
        })
        .catch((e) => {
          console.log(e);
        });
    } else {
      updateTeacherOfferService(offer.id, formData)
        .then((updatedOffer) => {
          onUpdateOffer(updatedOffer.data);
          handleClose();
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
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const [open, setOpen] = React.useState(false);

  const handleClickAlert = () => {
    handleClose();
    console.log(offer);
    setOpen(true);
  };

  const handleCloseAlert = () => {
    setOpen(false);
  };
  const handleDelete = () => {
    if (isOfferStudent) {
      deleteStudentOfferService(offer.id)
        .then((res) => {
          setOpen(false);
          if (snackbarContext) {
            snackbarContext.showMessage(
              "Succes",
              "Offre supprimer avec succée",
              "success",
            );
          }
          handleClose();
          onDeleteOffer();
        })
        .catch((e) => {
          console.log(e);
        });
    } else {
      deleteTeacherOfferService(offer.id)
        .then((res) => {
          setOpen(false);
          handleClose();
          onDeleteOffer();
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  return (
    <div 
      className="group relative flex flex-col bg-white shadow-lg rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 w-full h-full border border-gray-100"
      style={{ 
        background: `linear-gradient(145deg, ${colors.priceBg}15, #ffffff)`,
        borderTop: `6px solid ${colors.border}`
      }}
    >
      {/* Image Container with Overlay */}
      <div className="relative w-full h-40 sm:h-48 lg:h-52 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>
        <img
          src={offer?.imageUrl || "https://via.placeholder.com/300x208?text=Offre+Moderne"}
          alt={offer.title}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Price Badge - Floating */}
        <div 
          className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 px-2 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl backdrop-blur-md shadow-lg"
          style={{ 
            background: `linear-gradient(135deg, ${colors.buttonStart}E6, ${colors.buttonEnd}E6)`,
          }}
        >
          <div className="flex items-baseline text-white">
            <span className="text-lg sm:text-2xl font-bold">{offer.price}</span>
            <span className="ml-1 text-xs sm:text-sm font-medium">DT</span>
          </div>
        </div>

        {/* Subscription Badge */}
        {offer.subscribed && (
          <div 
            className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20 px-2 sm:px-3 py-1 text-xs font-bold rounded-full backdrop-blur-md shadow-lg"
            style={{ 
              backgroundColor: `${colors.check}E6`,
              color: 'white'
            }}
          >
            ✓ Abonné
          </div>
        )}

        {/* Free Offer Badge */}
        {isFreeOffer && (
          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-20 px-2 sm:px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
            🎉 GRATUIT
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-col h-full p-4 sm:p-6 relative">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-3 sm:mb-5">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h2 
                className="text-lg sm:text-xl font-bold leading-tight"
                style={{ color: colors.title }}
              >
                {offer.title}
              </h2>
              {role === "ROLE_ADMIN" && (
                <div className="ml-auto">
                  <IconButton 
                    onClick={handleClick} 
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    style={{ color: colors.icon }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    PaperProps={{
                      style: {
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <MenuItem onClick={handleOpenModal} className="rounded-lg mx-1 my-1">Modifier</MenuItem>
                    <MenuItem onClick={handleClickAlert} className="rounded-lg mx-1 my-1 text-red-600">Supprimer</MenuItem>
                  </Menu>
                </div>
              )}
            </div>
            <p 
              className="text-sm font-medium leading-relaxed"
              style={{ color: colors.subTitle }}
            >
              {offer.subTitle}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-3 sm:mb-5">
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2 sm:line-clamp-3">
            {offer.description}
          </p>
        </div>

        {/* Duration Info */}
        <div 
          className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 mb-3 sm:mb-5 rounded-xl sm:rounded-2xl border-2 transition-colors"
          style={{ 
            backgroundColor: `${colors.priceBg}80`,
            borderColor: `${colors.border}30`
          }}
        >
          <div className="flex items-center">
            <div 
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-2 sm:mr-3"
              style={{ backgroundColor: colors.check }}
            ></div>
            <span className="text-sm sm:text-base font-semibold text-gray-700">
              {isOfferStudent ? `Par matière` : `Durée`}
            </span>
          </div>
          <span 
            className="text-base sm:text-lg font-bold"
            style={{ color: colors.price }}
          >
            {offer.monthlyPeriod} mois
          </span>
        </div>

        {/* Benefits Section */}
        <div className="flex-grow mb-4 sm:mb-6">
          <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold text-gray-800 flex items-center">
            <div 
              className="w-1 h-4 sm:h-6 rounded-full mr-2 sm:mr-3"
              style={{ backgroundColor: colors.check }}
            ></div>
            Avantages inclus
          </h3>
          
          <div className="space-y-2 sm:space-y-3 max-h-32 sm:max-h-40 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
            {benefitsArray.map((benefit: any, index: React.Key) => (
              <div 
                className="flex items-start p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                key={index}
              >
                <div 
                  className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center mt-0.5 mr-2 sm:mr-3"
                  style={{ backgroundColor: `${colors.check}20` }}
                >
                  <CheckCircleIcon 
                    style={{ color: colors.check, fontSize: window.innerWidth < 640 ? '12px' : '16px' }} 
                  />
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          {(!offer.subscribed && role !== "ROLE_ADMIN") && (
            <div
              className="relative w-full py-3 sm:py-4 font-bold text-center text-white transition-all duration-300 cursor-pointer rounded-xl sm:rounded-2xl hover:shadow-xl transform hover:scale-105 active:scale-95 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${colors.buttonStart}, ${colors.buttonEnd})`,
              }}
              onMouseEnter={(e: MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${colors.buttonHoverStart}, ${colors.buttonHoverEnd})`;
              }}
              onMouseLeave={(e: MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${colors.buttonStart}, ${colors.buttonEnd})`;
              }}
              onClick={onclick}
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <span className="relative z-10 flex items-center justify-center text-sm sm:text-base">
                {isFreeOffer ? (
                  <>
                    <span className="hidden sm:inline">🎯 Rejoindre gratuitement</span>
                    <span className="sm:hidden">🎯 Rejoindre</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">💎 Souscrire maintenant</span>
                    <span className="sm:hidden">💎 Souscrire</span>
                  </>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Decorative elements */}
      <div 
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-5"
        style={{ backgroundColor: colors.border }}
      ></div>
      <div 
        className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-5"
        style={{ backgroundColor: colors.check }}
      ></div>

      {/* Modals */}
      {isOfferStudent ? (
        <OfferStudentModal
          open={isModalOpen}
          onClose={handleCloseModal}
          initialData={{ image: offer.imageUrl, ...offer }}
          modalTitle="Modifier l'offre"
          buttonText="Mettre à jour"
          onButtonClick={handleAction}
        />
      ) : (
        <FormModal
          open={isModalOpen}
          onClose={handleCloseModal}
          initialData={{ image: offer.imageUrl, ...offer }}
          modalTitle="Modifier l'offre"
          buttonText="Mettre à jour"
          onButtonClick={handleAction}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={open}
        keepMounted
        onClose={handleCloseAlert}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>
          <p className="text-2xl font-bold text-gray-800">
            Confirmer la suppression
          </p>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer cette offre? Cette action est irréversible.
            </p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={handleCloseAlert}
            className="text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleDelete}
            className="text-white bg-red-600 hover:bg-red-700"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OfferCard;