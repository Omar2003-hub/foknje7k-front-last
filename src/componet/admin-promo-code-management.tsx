import React, { useState, useEffect } from "react";
import {
  getAllPromoCodes,
  getPromoCodeSettings,
  updatePromoCodeSettings,
  updatePromoCodeDiscount,
  PromoCodeDTO,
  PromoCodeSettings,
} from "../services/promo-code-service";
import CustomInput from "../shared/custom-input/custom-input";
import { FaEdit, FaSave, FaTimes, FaCoins } from "react-icons/fa";

const AdminPromoCodeManagement: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCodeDTO[]>([]);
  const [settings, setSettings] = useState<PromoCodeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSettings, setEditingSettings] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [newDefaultDiscount, setNewDefaultDiscount] = useState("");
  const [newDefaultCoins, setNewDefaultCoins] = useState("");
  const [editDiscount, setEditDiscount] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [codesData, settingsData] = await Promise.all([
        getAllPromoCodes(),
        getPromoCodeSettings(),
      ]);
      setPromoCodes(codesData);
      setSettings(settingsData);
      setNewDefaultDiscount(settingsData.defaultDiscountPercentage.toString());
      setNewDefaultCoins(settingsData.defaultCoinsReward.toString());
    } catch (error) {
      console.error("Failed to fetch promo code data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!settings) return;

    try {
      const updated = await updatePromoCodeSettings(
        parseFloat(newDefaultDiscount),
        parseInt(newDefaultCoins)
      );
      setSettings(updated);
      setEditingSettings(false);
      alert("Settings updated successfully!");
    } catch (error) {
      console.error("Failed to update settings:", error);
      alert("Failed to update settings");
    }
  };

  const handleUpdatePromoDiscount = async (promoCodeId: string) => {
    try {
      const updated = await updatePromoCodeDiscount(
        promoCodeId,
        parseFloat(editDiscount)
      );
      setPromoCodes(
        promoCodes.map((pc) => (pc.id === promoCodeId ? updated : pc))
      );
      setEditingPromoId(null);
      setEditDiscount("");
      alert("Promo code updated successfully!");
    } catch (error) {
      console.error("Failed to update promo code:", error);
      alert("Failed to update promo code");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading promo code data...</p>
      </div>
    );
  }

  return (
    <div className="admin-promo-management p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Promo Code Management
      </h1>

      {/* Settings Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Default Settings
          </h2>
          {!editingSettings && (
            <button
              onClick={() => setEditingSettings(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {(FaEdit as any)({ className: "inline-block" })} Edit
            </button>
          )}
        </div>

        {settings && (
          <div className="space-y-4">
            {editingSettings ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Discount Percentage
                  </label>
                  <CustomInput
                    inputType="number"
                    value={newDefaultDiscount}
                    onChange={(e) => setNewDefaultDiscount(e.target.value)}
                    placeholder="e.g., 10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Coins Reward
                  </label>
                  <CustomInput
                    inputType="number"
                    value={newDefaultCoins}
                    onChange={(e) => setNewDefaultCoins(e.target.value)}
                    placeholder="e.g., 100"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateSettings}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {(FaSave as any)({ className: "inline-block" })} Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingSettings(false);
                      setNewDefaultDiscount(
                        settings.defaultDiscountPercentage.toString()
                      );
                      setNewDefaultCoins(settings.defaultCoinsReward.toString());
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    {(FaTimes as any)({ className: "inline-block" })} Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Default Discount</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {settings.defaultDiscountPercentage}%
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Default Coins Reward</p>
                  <p className="text-2xl font-bold text-yellow-600 flex items-center gap-2">
                    {(FaCoins as any)({ className: "inline-block" })} {settings.defaultCoinsReward}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Promo Codes List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          All Promo Codes ({promoCodes.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Owner
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Discount
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Usage
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {promoCodes.map((promo) => (
                <tr key={promo.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">
                    {promo.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {promo.ownerName}
                  </td>
                  <td className="px-4 py-3">
                    {editingPromoId === promo.id ? (
                      <div className="flex items-center gap-2">
                        <CustomInput
                          inputType="number"
                          value={editDiscount}
                          onChange={(e) => setEditDiscount(e.target.value)}
                          CustomStyle="w-20"
                        />
                        <span className="text-sm">%</span>
                      </div>
                    ) : (
                      <span className="font-semibold text-green-600">
                        {promo.discountPercentage}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {promo.usageCount} times
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        promo.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {promo.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {editingPromoId === promo.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdatePromoDiscount(promo.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Save"
                        >
                          {(FaSave as any)({})}
                        </button>
                        <button
                          onClick={() => {
                            setEditingPromoId(null);
                            setEditDiscount("");
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="Cancel"
                        >
                          {(FaTimes as any)({})}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingPromoId(promo.id);
                          setEditDiscount(promo.discountPercentage.toString());
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit discount"
                      >
                        {(FaEdit as any)({})}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPromoCodeManagement;
