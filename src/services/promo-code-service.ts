import NetworkService from "../config/interceptor/interceptor";

export interface PromoCodeDTO {
  id: string;
  code: string;
  discountPercentage: number;
  coinsReward: number;
  usageCount: number;
  isActive: boolean;
  ownerId: string;
  ownerName: string;
  ownerRole: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCodeValidationResponse {
  isValid: boolean;
  message: string;
  discountPercentage?: number;
  promoCode?: string;
}

export interface PromoCodeSettings {
  id: number;
  defaultDiscountPercentage: number;
  defaultCoinsReward: number;
}

export interface TeacherMonthlyPointsDTO {
  id: string;
  teacherId: string;
  teacherName: string;
  year: number;
  month: number;
  points: number;
  amountTnd: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Generate or get user's personal promo code
 */
export const generatePromoCode = async (userId: string): Promise<PromoCodeDTO> => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: "promo-codes/generate",
    method: "POST",
    params: { userId },
    withLoader: true,
    withFailureLogs: true,
  });
  return response.data;
};

/**
 * Get user's personal promo code (auto-generates if doesn't exist)
 */
export const getMyPromoCode = async (userId: string): Promise<PromoCodeDTO> => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: "promo-codes/my-code",
    method: "GET",
    params: { userId },
    withLoader: false,
    withFailureLogs: true,
  });
  return response.data.data;
};

/**
 * Validate a promo code
 */
export const validatePromoCode = async (
  code: string,
  userId: string,
  offerId?: string
): Promise<PromoCodeValidationResponse> => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: "promo-codes/validate",
    method: "POST",
    params: { code, userId, offerId },
    withLoader: false,
    withFailureLogs: false,
  });
  return response.data;
};

/**
 * Apply a promo code
 */
export const applyPromoCode = async (
  code: string,
  userId: string
): Promise<string> => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: "promo-codes/apply",
    method: "POST",
    params: { code, userId },
    withLoader: true,
    withFailureLogs: true,
  });
  return response.data;
};

/**
 * Get all promo codes (admin only)
 */
export const getAllPromoCodes = async (): Promise<PromoCodeDTO[]> => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: "promo-codes/all",
    method: "GET",
    withLoader: true,
    withFailureLogs: true,
  });
  return response.data;
};

/**
 * Update promo code discount (admin only)
 */
export const updatePromoCodeDiscount = async (
  promoCodeId: string,
  discount: number
): Promise<PromoCodeDTO> => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: `promo-codes/${promoCodeId}/discount`,
    method: "PUT",
    params: { discount },
    withLoader: true,
    withFailureLogs: true,
  });
  return response.data;
};

/**
 * Get promo code settings (admin only)
 */
export const getPromoCodeSettings = async (): Promise<PromoCodeSettings> => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: "promo-codes/settings",
    method: "GET",
    withLoader: false,
    withFailureLogs: true,
  });
  return response.data;
};

/**
 * Update promo code settings (admin only)
 */
export const updatePromoCodeSettings = async (
  defaultDiscount: number,
  defaultCoins: number
): Promise<PromoCodeSettings> => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: "promo-codes/settings",
    method: "PUT",
    params: { defaultDiscount, defaultCoins },
    withLoader: true,
    withFailureLogs: true,
  });
  return response.data;
};

/**
 * Redeem NJE7EKCOINS for an offer (once per year)
 */
export const redeemCoins = async (
  userId: string,
  coinsToRedeem: number
): Promise<string> => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: "promo-codes/redeem-coins",
    method: "POST",
    params: { userId, coinsToRedeem },
    withLoader: true,
    withFailureLogs: true,
  });
  return response.data;
};

/**
 * Check if user can redeem coins this year
 */
export const canRedeemCoins = async (userId: string): Promise<boolean> => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: "promo-codes/can-redeem",
    method: "GET",
    params: { userId },
    withLoader: false,
    withFailureLogs: true,
  });
  return response.data;
};

/**
 * Get teacher's monthly points history
 */
export const getTeacherMonthlyPoints = async (
  teacherId: string
): Promise<TeacherMonthlyPointsDTO[]> => {
  const response = await NetworkService.getInstance().sendHttpRequest({
    url: "promo-codes/teacher-monthly-points",
    method: "GET",
    params: { teacherId },
    withLoader: true,
    withFailureLogs: true,
  });
  return response.data;
};
