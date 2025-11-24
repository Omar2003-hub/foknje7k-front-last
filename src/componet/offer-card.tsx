import React, { useState, useContext } from "react";
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
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
  sendOfferService,
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
  
  const isFreeOffer =
    (offer.price === 0) ||
    ([offer.monthlyPrice, offer.trimesterPrice, offer.semesterPrice, offer.yearlyPrice].every(p => p === 0));

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
          handleCloseEditModal();
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
          handleCloseEditModal();
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenEditModal = () => setIsEditModalOpen(true);
  const handleCloseEditModal = () => setIsEditModalOpen(false);
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

  // Find the first available period with a price > 0
  const availablePeriods = [
    { key: 'MONTHLY', label: 'شهري', price: offer.monthlyPrice },
    { key: 'TRIMESTER', label: 'ثلاثي', price: offer.trimesterPrice },
    { key: 'SEMESTER', label: 'سداسي', price: offer.semesterPrice },
    { key: 'YEARLY', label: 'سنوي', price: offer.yearlyPrice }
  ].filter(({ price }) => price > 0);

  const defaultPeriod = availablePeriods.length > 0 ? availablePeriods[0].key : 'MONTHLY';
  const [selectedPeriod, setSelectedPeriod] = useState<'MONTHLY' | 'TRIMESTER' | 'SEMESTER' | 'YEARLY'>(defaultPeriod as any);
  const [subjectCount, setSubjectCount] = useState(1);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);

  const getPriceForPeriod = () => {
    switch (selectedPeriod) {
      case 'MONTHLY':
        return offer.monthlyPrice;
      case 'TRIMESTER':
        return offer.trimesterPrice;
      case 'SEMESTER':
        return offer.semesterPrice;
      case 'YEARLY':
        return offer.yearlyPrice;
      default:
        return offer.monthlyPrice;
    }
  };

  // Helper to check if price is valid (not null/undefined and not NaN)
  const isValidPrice = (price: any) => price !== undefined && price !== null && !isNaN(price) && price !== '';

  const getSubjectMultiplier = () => {
    // Special multipliers for YEARLY period
    if (selectedPeriod === 'YEARLY') {
      switch (subjectCount) {
        case 1: return 1;
        case 2: return 1.5;
        case 3: return 2.25;
        case 4: return 3;
        default: return subjectCount;
      }
    }
    // For other periods, 4 subjects = 3.5x
    if (subjectCount === 4) return 3.5;
    return subjectCount;
  };

  const getTotalPrice = () => {
    return Math.floor(getPriceForPeriod() * getSubjectMultiplier());
  };

  const getOriginalPrice = () => {
    const monthCount = selectedPeriod === 'MONTHLY' ? 1 : 
                       selectedPeriod === 'TRIMESTER' ? 3 : 
                       selectedPeriod === 'SEMESTER' ? 6 : 12;
    return Math.floor(offer.monthlyPrice * monthCount * getSubjectMultiplier());
  };

  const hasPromo = () => {
    if (isFreeOffer || !offer.monthlyPrice) return false;
    const totalPrice = getTotalPrice();
    const originalPrice = getOriginalPrice();
    return totalPrice < originalPrice;
  };

  return (
    <div 
      className="relative flex flex-col w-full h-full overflow-hidden transition-all duration-500 bg-white border border-gray-100 shadow-lg group rounded-3xl hover:shadow-2xl hover:-translate-y-2"
      style={{ 
        background: `linear-gradient(145deg, ${colors.priceBg}15, #ffffff)`,
        borderTop: `6px solid ${colors.border}`
      }}
    >
      {/* Image Container with Overlay */}
      <div className="relative w-full h-40 overflow-hidden sm:h-48 lg:h-52">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/30 to-transparent"></div>
        <img
          src={offer?.imageUrl || "https://via.placeholder.com/300x208?text=Offre+Moderne"}
          alt={offer.title}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
        />
        


        {/* Subscription Badge */}
        {offer.subscribed && (
          <div 
            className="absolute z-20 px-2 py-1 text-xs font-bold rounded-full shadow-lg bottom-2 sm:bottom-4 right-2 sm:right-4 sm:px-3 backdrop-blur-md"
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
          <div
            className="absolute z-20 px-3 py-1 text-xs font-extrabold rounded-full shadow-lg bottom-2 sm:bottom-4 left-2 sm:left-4 sm:px-4 animate-pulse"
            style={{
              color: '#fff',
              letterSpacing: '1px',
              fontSize: '1rem',
              background: 'linear-gradient(90deg, #3B82F6 0%, #1D4ED8 100%)',
              boxShadow: '0 2px 12px 0 rgba(59,130,246,0.25)'
            }}
          >
            🎉 مجاني
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="relative flex flex-col h-full p-4 sm:p-6">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center mb-3 sm:mb-5">
          <div className="flex justify-end w-full">
            {role === "ROLE_ADMIN" && (
              <IconButton 
                onClick={handleClick} 
                className="p-2 transition-colors rounded-full hover:bg-gray-100"
                style={{ color: colors.icon }}
              >
                <MoreVertIcon />
              </IconButton>
            )}
          </div>
          <h2 
            className="w-full text-lg font-bold leading-tight text-center sm:text-xl"
            style={{ color: colors.title }}
          >
            {offer.title}
          </h2>
          {/* Price below title */}
          <div className="flex flex-col items-center w-full mt-2">
            <span className="text-2xl font-bold" style={{ color: colors.price }}>
              {isValidPrice(getTotalPrice()) && getTotalPrice() > 0
                ? `${getTotalPrice()} DT`
                : (isValidPrice(getTotalPrice()) && getTotalPrice() === 0 && isValidPrice(offer.monthlyPrice))
                  ? '0 DT'
                  : '--'}
            </span>
            {/* Discounted price below price, if promo */}
            {hasPromo() && (
              <span className="flex items-center gap-2 mt-1 text-base font-medium" style={{ color: '#EF4444' }}>
                <span className="ml-1">au lieu de</span>
                <span className="line-through">{getOriginalPrice()} DT</span>
              </span>
            )}
          </div>
          <p 
            className="w-full mt-2 text-sm font-medium leading-relaxed text-center"
            style={{ color: colors.subTitle }}
          >
            {offer.subTitle}
          </p>
        </div>

        {/* Description */}
        <div className="mb-3 sm:mb-5">
          <p className="text-xs leading-relaxed text-gray-600 sm:text-sm line-clamp-2 sm:line-clamp-3">
            {offer.description}
          </p>
        </div>

        {/* Duration Info */}
        <div className="flex flex-col items-center mb-3 sm:mb-5">
          {/* Period Selection */}
          <div className="flex justify-center w-full mb-3">
            {availablePeriods.map(({ key, label }) => (
              <button
                key={key}
                className={`flex-1 mx-1 px-3 py-2 text-sm font-bold rounded-lg border transition-all duration-300 ${
                  selectedPeriod === key
                    ? `bg-[${themeColors.paid.border}] text-white border-[${themeColors.paid.border}] shadow`
                    : `bg-white text-[${themeColors.paid.border}] border-[${themeColors.paid.border}] hover:bg-green-50`
                }`}
                style={{ minWidth: '70px', borderColor: themeColors.paid.border, backgroundColor: selectedPeriod === key ? themeColors.paid.border : 'white', color: selectedPeriod === key ? 'white' : themeColors.paid.border }}
                onClick={() => setSelectedPeriod(key as any)}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Subject Count Selection: only for paid offers */}
          {!isFreeOffer && (
            <div className="flex justify-center w-full mb-2">
              {offer.allSubjects ? (
                <button
                  className={`flex-1 mx-1 px-3 py-2 text-sm font-bold rounded-lg border transition-all duration-300 bg-[${themeColors.paid.border}] text-white border-[${themeColors.paid.border}] shadow`}
                  style={{ minWidth: '60px', borderColor: themeColors.paid.border, backgroundColor: themeColors.paid.border, color: 'white' }}
                >
                  <span dir="rtl" style={{ unicodeBidi: 'plaintext', fontFamily: 'inherit' }}>كل المواد</span>
                </button>
              ) : (
                Array.from({ length: offer.subjectCount || 4 }, (_, i) => i + 1).map(count => (
                  <button
                    key={count}
                    className={`flex-1 mx-1 px-3 py-2 text-sm font-bold rounded-lg border transition-all duration-300 ${
                      subjectCount === count
                        ? `bg-[${themeColors.paid.border}] text-white border-[${themeColors.paid.border}] shadow`
                        : `bg-white text-[${themeColors.paid.border}] border-[${themeColors.paid.border}] hover:bg-green-50`
                    }`}
                    style={{ minWidth: '60px', borderColor: themeColors.paid.border, backgroundColor: subjectCount === count ? themeColors.paid.border : 'white', color: subjectCount === count ? 'white' : themeColors.paid.border }}
                    onClick={() => setSubjectCount(count)}
                  >
                    <span dir="rtl" style={{ unicodeBidi: 'plaintext', fontFamily: 'inherit' }}><b>{count}</b>&nbsp;{count === 1 ? 'مادة' : 'مواد'}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Benefits Section */}
        <div className="flex-grow mb-4 sm:mb-6">
          {/* <h3 className="flex items-center mb-3 text-base font-bold text-gray-800 sm:mb-4 sm:text-lg">
            <div 
              className="w-1 h-4 mr-2 rounded-full sm:h-6 sm:mr-3"
              style={{ backgroundColor: colors.check }}
            ></div>
            Avantages inclus
          </h3> */}
          
          <div className="pr-1 space-y-2 overflow-y-auto sm:space-y-3 max-h-32 sm:max-h-40 sm:pr-2 custom-scrollbar">
            {benefitsArray.map((benefit: any, index: React.Key) => (
                <div 
                  className="flex flex-row-reverse items-start p-2 transition-colors rounded-lg sm:p-3 sm:rounded-xl bg-gray-50 hover:bg-gray-100"
                  key={index}
                >
                  <div 
                    className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center mt-0.5 ml-2 sm:ml-3"
                    style={{ backgroundColor: `${colors.check}20` }}
                  >
                    <CheckCircleIcon 
                      style={{ color: colors.check, fontSize: window.innerWidth < 640 ? '12px' : '16px' }} 
                    />
                  </div>
                  <p className="text-xs leading-relaxed text-gray-700 sm:text-sm" dir="rtl">{benefit}</p>
                </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          {(!offer.subscribed && role !== "ROLE_ADMIN") && (
            <div
              className="relative w-full py-3 overflow-hidden font-bold text-center text-white transition-all duration-300 transform cursor-pointer sm:py-4 rounded-xl sm:rounded-2xl hover:shadow-xl hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${colors.buttonStart}, ${colors.buttonEnd})`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${colors.buttonHoverStart}, ${colors.buttonHoverEnd})`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${colors.buttonStart}, ${colors.buttonEnd})`;
              }}
              onClick={() => {
                // For free offers, call onclick directly without opening modal
                if (isFreeOffer) {
                  onclick();
                } else {
                  handleOpenModal();
                }
              }}
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 transition-transform duration-1000 transform -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full"></div>
              <span className="relative z-10 flex items-center justify-center text-sm sm:text-base">
                {isFreeOffer ? (
                  <>
                    <span className="hidden sm:inline">إشترك مجاناً</span>
                    <span className="sm:hidden">إشترك</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">إشترك الآن</span>
                    <span className="sm:hidden">إشترك</span>
                  </>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Decorative elements */}
      <div 
        className="absolute w-40 h-40 rounded-full -top-20 -right-20 opacity-5"
        style={{ backgroundColor: colors.border }}
      ></div>
      <div 
        className="absolute w-32 h-32 rounded-full -bottom-10 -left-10 opacity-5"
        style={{ backgroundColor: colors.check }}
      ></div>

      {/* Modals */}
      {/* Student Offer Request Modal */}
      {isOfferStudent && (
        <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
          <DialogTitle className="flex items-center justify-between text-white bg-primary">
            <span className="text-xl font-montserrat_semi_bold">طلب الإشتراك</span>
            <IconButton onClick={handleCloseModal} className="text-white">
              <MoreVertIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent className="px-6 py-6">
            {/* Offer Summary */}
            <div className="p-4 mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-green-50">
              <h3 className="mb-2 text-lg font-bold text-gray-800">{offer.title}</h3>
              <p className="text-sm text-gray-600">{offer.subTitle}</p>
            </div>

            {/* Period Selection */}
            <div className="mb-6">
              <Typography variant="h6" className="mb-3 text-right font-montserrat_medium">اختر الفترة</Typography>
              <div className="flex justify-center gap-2 mb-4">
                {[
                  { key: 'MONTHLY', label: 'شهري', price: offer.monthlyPrice },
                  { key: 'TRIMESTER', label: 'ثلاثي', price: offer.trimesterPrice },
                  { key: 'SEMESTER', label: 'سداسي', price: offer.semesterPrice },
                  { key: 'YEARLY', label: 'سنوي', price: offer.yearlyPrice }
                ].filter(({ price }) => price > 0).map(({ key, label }) => (
                  <button
                    key={key}
                    className={`flex-1 px-3 py-2 text-sm font-bold rounded-lg border transition-all duration-300 ${
                      selectedPeriod === key
                        ? 'bg-primary text-white border-primary shadow'
                        : 'bg-white text-primary border-primary hover:bg-blue-50'
                    }`}
                    onClick={() => setSelectedPeriod(key as any)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Count Selection: only for paid offers */}
            {!isFreeOffer && (
              <div className="mb-6">
                <Typography variant="h6" className="mb-3 text-right font-montserrat_medium">عدد المواد</Typography>
                <div className="flex justify-center gap-2 mb-4">
                  {offer.allSubjects ? (
                    <button
                      className="flex-1 px-3 py-2 text-sm font-bold text-white border rounded-lg shadow bg-primary border-primary"
                    >
                      <span dir="rtl" style={{ unicodeBidi: 'plaintext', fontFamily: 'inherit' }}>كل المواد</span>
                    </button>
                  ) : (
                    Array.from({ length: offer.subjectCount || 4 }, (_, i) => i + 1).map(count => (
                      <button
                        key={count}
                        className={`flex-1 px-3 py-2 text-sm font-bold rounded-lg border transition-all duration-300 ${
                          subjectCount === count
                            ? 'bg-primary text-white border-primary shadow'
                            : 'bg-white text-primary border-primary hover:bg-blue-50'
                        }`}
                        onClick={() => setSubjectCount(count)}
                      >
                        <span dir="rtl" style={{ unicodeBidi: 'plaintext', fontFamily: 'inherit' }}><b>{count}</b>&nbsp;{count === 1 ? 'مادة' : 'مواد'}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Price Summary */}
            <div className="p-4 mb-6 rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">{offer.allSubjects ? 'السعر:' : 'سعر المادة الواحدة:'}</span>
                <span className="font-bold text-primary">{getPriceForPeriod()} د.ت</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">عدد المواد:</span>
                <span className="font-bold text-primary">{offer.allSubjects ? 'كل المواد' : subjectCount}</span>
              </div>
              <hr className="my-2" />
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-800">المجموع:</span>
                <div className="flex flex-col items-end">
                  <div className="flex items-baseline gap-2">
                    {hasPromo() && (
                      <span className="text-base font-medium line-through" style={{ color: '#EF4444' }}>{getOriginalPrice()} د.ت</span>
                    )}
                    <span className="text-xl font-bold text-green-600">{getTotalPrice()} د.ت</span>
                  </div>
                  {hasPromo() && (
                    <span className="text-xs font-medium text-green-600">وفّر {getOriginalPrice() - getTotalPrice()} د.ت</span>
                  )}
                </div>
              </div>
            </div>
            {/* Payment Upload */}
            <div className="p-4 mb-6 rounded-lg bg-gray-50">
              <Typography variant="h6" className="mb-4 text-right font-montserrat_semi_bold">صورة الدفع</Typography>
              <div className="flex flex-col items-center justify-center w-full h-32 transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                onClick={() => document.getElementById('payment-file-input')?.click()}
              >
                <div className="flex flex-col items-center justify-center px-4">
                  <MoreVertIcon className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-1 text-sm text-center text-gray-500">
                    <span className="font-semibold">اضغط لرفع صورة الدفع</span>
                  </p>
                  <p className="text-xs text-center text-gray-500">JPG, PNG أو PDF (حد أقصى 5MB)</p>
                </div>
                <input
                  type="file"
                  id="payment-file-input"
                  className="hidden"
                  onChange={e => setPaymentFile(e.target.files?.[0] || null)}
                  accept="image/*,.pdf"
                />
              </div>
              {paymentFile && (
                <div className="p-3 mt-3 border border-green-200 rounded-lg bg-green-50">
                  <p className="text-sm font-medium text-green-700">✓ تم اختيار الملف: {paymentFile.name}</p>
                </div>
              )}
            </div>
          </DialogContent>
          <DialogActions className="px-6 pb-6">
            <Button 
              variant="outlined" 
              onClick={handleCloseModal} 
              className="px-6 py-2 text-gray-700 border-gray-300 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                // Submit student subscription request
                const formData = new FormData();
                formData.append("selectedPeriod", selectedPeriod);
                formData.append("requestedSubjectsCount", String(subjectCount));
                if (paymentFile) formData.append("paymentImage", paymentFile);
                
                // Call backend API to submit the subscription request
                sendOfferService(offer.id, formData)
                  .then((response) => {
                    if (snackbarContext) {
                      snackbarContext.showMessage(
                        "نجح",
                        "تم إرسال طلب الاشتراك بنجاح",
                        "success"
                      );
                    }
                    handleCloseModal();
                    // Reset form
                    setSelectedPeriod('MONTHLY');
                    setSubjectCount(1);
                    setPaymentFile(null);
                  })
                  .catch((error) => {
                    console.error(error);
                    if (snackbarContext) {
                      snackbarContext.showMessage(
                        "خطأ",
                        "فشل إرسال طلب الاشتراك",
                        "error"
                      );
                    }
                  });
              }}
              disabled={!paymentFile || subjectCount < 1}
              className="px-6 py-2 ml-3 font-bold text-white rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-50"
            >
              تأكيد و إرسال ({getTotalPrice()} د.ت)
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {/* Admin/Teacher Modals */}
      {isOfferStudent ? (
        <OfferStudentModal
          open={isEditModalOpen}
          onClose={handleCloseEditModal}
          initialData={{ image: offer.imageUrl, ...offer }}
          modalTitle="Modifier l'offre"
          buttonText="Mettre à jour"
          onButtonClick={handleAction}
        />
      ) : (
        <FormModal
          open={isEditModalOpen}
          onClose={handleCloseEditModal}
          initialData={{ image: offer.imageUrl, ...offer }}
          modalTitle="Modifier l'offre"
          buttonText="Mettre à jour"
          onButtonClick={handleAction}
        />
      )}
      
      {/* Admin Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => { handleClose(); handleOpenEditModal(); }}>
          Modifier
        </MenuItem>
        <MenuItem onClick={handleClickAlert}>
          Supprimer
        </MenuItem>
      </Menu>

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