import React, { useEffect, useState } from "react";
import { getStatsFromIDB, setStatsToIDB } from '../../../utils/idbStats';
import { BoxStat, MontantStat, TotalStat, UserStat } from "../../../assets/svg";
import { getStatService } from "../../../services/playList-service";
import "./stats.css";

const MiniStat: React.FC<{
  title: string;
  value: React.ReactNode;
  icon?: string;
  colorClass?: string;
}> = ({ title, value, icon, colorClass = "bg-gray-50" }) => {
  return (
    <div className={`mini-stat flex items-center justify-between p-3 rounded-lg bg-white border border-gray-100`}>
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${colorClass}`}>
          {icon && <img src={icon} alt="icon" className="w-6 h-6" />}
        </div>
        <div>
          <div className="text-sm text-gray-600">{title}</div>
          <div className="text-xl font-bold text-gray-900">{value}</div>
        </div>
      </div>

    </div>
  );
};

const Stats: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      // Try to get stats from IndexedDB first
      const cachedStats = await getStatsFromIDB('stats');
      if (cachedStats) {
        setData(cachedStats);
      }
      // Always fetch latest stats from API
      try {
        const res = await getStatService();
        setData(res.data);
        setStatsToIDB('stats', res.data);
      } catch (e) {
        // fallback: keep cached data if API fails
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Statistiques</h1>

        <div className="p-6 border border-gray-100 main-card bg-gray-50 rounded-2xl">
          <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
          {/* Left: Total Users large card */}
          <div className="p-6 bg-white border border-gray-100 card rounded-2xl shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total Utilisateurs</div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="text-5xl font-extrabold text-gray-900">{data?.totalUsers}</div>
                </div>
                <div className="mt-3 text-sm text-gray-500">Utilisateurs enregistrés sur la plateforme</div>
              </div>
              <div className="p-3 rounded-xl icon-users">
                <img src={UserStat} alt="users" className="w-10 h-10" />
              </div>
            </div>
          </div>

          {/* Right: Orders & Payments card with small grid */}
          <div className="p-6 bg-white border border-gray-100 card rounded-2xl shadow-card">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Commandes & Paiement</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <MiniStat title="Commandes actives" value={data?.totalOrders} icon={BoxStat} colorClass="bg-orange-50" />
              <MiniStat title="Commandes en attente" value={data?.totalPendingOrders} icon={TotalStat} colorClass="bg-yellow-50" />
              <div className="sm:col-span-2">
                <MiniStat title="Montant total" value={`${data?.totalPrice} DT`} icon={MontantStat} colorClass="bg-green-50" />
              </div>
            </div>
          </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="p-6 bg-white border border-gray-100 card rounded-2xl shadow-card">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Enseignants</h3>
            <div className="grid grid-cols-1 gap-4">
              <MiniStat title="Total Enseignants" value={data?.totalTeachers} icon={UserStat} colorClass="bg-blue-50" />
              <MiniStat title="Enseignants actifs" value={data?.totalActiveTeachers} icon={UserStat} colorClass="bg-blue-50" />
              <MiniStat title="Super Enseignants" value={data?.totalSuperTeachers} icon={UserStat} colorClass="bg-purple-50" />
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-100 card rounded-2xl shadow-card">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Élèves</h3>
            <div className="grid grid-cols-1 gap-4">
              <MiniStat title="Total élèves" value={data?.totalStudents} icon={UserStat} colorClass="bg-yellow-50" />
              <MiniStat title="Élèves actifs" value={data?.totalActiveStudents} icon={UserStat} colorClass="bg-yellow-50" />
              <MiniStat title="Élèves avec offre" value={data?.totalStudentsWithEnrolledOffer} icon={UserStat} colorClass="bg-yellow-50" />
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
