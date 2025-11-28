import React, { useState, useEffect } from "react";
import { getMyPromoCode } from "../services/promo-code-service";
import { FaCopy, FaCheck, FaCoins, FaGift } from "react-icons/fa";

interface MyPromoCodeCardProps {
  userId: string;
  userCoins?: number;
  maxCoinsCap?: number;
}

const MyPromoCodeCard: React.FC<MyPromoCodeCardProps> = ({ 
  userId, 
  userCoins = 0, 
  maxCoinsCap = 50 
}) => {
  const [promoCode, setPromoCode] = useState<string>("");
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [usageCount, setUsageCount] = useState<number>(0);
  const [ownerRole, setOwnerRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPromoCode = async () => {
      try {
        const data = await getMyPromoCode(userId);
        setPromoCode(data.code);
        setDiscountPercentage(data.discountPercentage);
        setUsageCount(data.usageCount);
        setOwnerRole(data.ownerRole || "");
      } catch (error) {
        console.error("Failed to fetch promo code:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPromoCode();
    }
  }, [userId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isStudent = ownerRole === "ROLE_STUDENT";
  const isTeacher = ownerRole === "ROLE_TEACHER" || ownerRole === "ROLE_SUPER_TEACHER";

  if (loading) {
    return (
      <div className="p-6 border rounded-lg shadow-md promo-code-card bg-gradient-to-br from-blue-50 to-purple-50">
        <p className="text-gray-600">Loading your promo code...</p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg shadow-md promo-code-card bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">كود الإحالة الخاص بك</h3>
        {isStudent && (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 rounded-full">
            <FaCoins className="text-yellow-600" />
            <span className="text-sm font-bold text-yellow-700">
              {userCoins}/{maxCoinsCap} عملة
            </span>
          </div>
        )}
      </div>

      <div className="p-4 mb-4 bg-white rounded-lg shadow-sm">
        <p className="mb-2 text-sm text-right text-gray-600">شارك هذا الكود مع الأصدقاء:</p>
        <div className="flex items-center justify-between p-3 border-2 border-blue-300 border-dashed rounded-md bg-gray-50">
          <span className="text-2xl font-bold tracking-wider text-blue-600" dir="ltr">
            {promoCode}
          </span>
          <button
            onClick={handleCopy}
            className="p-2 ml-4 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
            title="نسخ إلى الحافظة"
          >
            {copied ? <FaCheck /> : <FaCopy />}
          </button>
        </div>
        {copied && (
          <p className="mt-2 text-xs text-center text-green-600">تم النسخ بنجاح!</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <p className="mb-1 text-sm text-right text-gray-600">الخصم</p>
          <p className="text-2xl font-bold text-right text-green-600">{discountPercentage}%</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <p className="mb-1 text-sm text-right text-gray-600">عدد الاستخدامات</p>
          <p className="text-2xl font-bold text-right text-purple-600">{usageCount}</p>
        </div>
      </div>

      {isStudent && (
        <div className="p-4 border-2 border-yellow-200 rounded-lg bg-yellow-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaCoins className="text-xl text-yellow-500" />
              <span className="text-sm text-gray-700">عملاتك NJE7EKCOINS</span>
            </div>
            <span className="text-2xl font-bold text-yellow-600">{userCoins}/{maxCoinsCap}</span>
          </div>
          {userCoins >= maxCoinsCap && (
            <p className="mt-2 text-xs text-center text-yellow-700">
              🎉 لقد وصلت إلى الحد الأقصى! يمكنك استخدام عملاتك للحصول على خصم.
            </p>
          )}
        </div>
      )}

      {isTeacher && (
        <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaGift className="text-xl text-green-500" />
              <span className="text-sm text-gray-700">مكافأة الإحالة</span>
            </div>
            <span className="text-lg font-bold text-green-600">1 نقطة = 5 د.ت</span>
          </div>
        </div>
      )}

      <div className="p-3 mt-4 rounded-lg bg-blue-50">
        <p className="text-xs text-center text-gray-600" dir="rtl">
          {isStudent && (
            <>
              • احصل على <strong>عملة واحدة</strong> عند استخدام شخص لكودك (حد أقصى 50 عملة)<br/>
              • كل مستخدم يمكنه استخدام كودك <strong>مرة واحدة فقط</strong><br/>
              • استخدم عملاتك للحصول على خصم على العروض <strong>مرة واحدة في السنة</strong>
            </>
          )}
          {isTeacher && (
            <>
              • احصل على <strong>نقطة واحدة (5 د.ت)</strong> عند استخدام طالب لكودك<br/>
              • يتم تتبع النقاط شهرياً<br/>
              • كل مستخدم يمكنه استخدام كودك <strong>مرة واحدة فقط</strong>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default MyPromoCodeCard;
