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

  const CACHE_MAX_AGE = 10 * 60 * 1000; // 10 minutes
  const [loading, setLoading] = useState(false);

  const fetchStats = React.useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      const cached = await getStatsFromIDB('stats');
      if (!forceRefresh && cached && cached.stats) {
        setData(cached.stats);
      }
      const now = Date.now();
      if (forceRefresh || !cached || !cached.timestamp || now - cached.timestamp > CACHE_MAX_AGE) {
        try {
          const res = await getStatService();
          setData(res.data);
          setStatsToIDB('stats', res.data, now);
        } catch (e) {
          // fallback: keep cached data if API fails
        }
      }
    } finally {
      setLoading(false);
    }
  }, [CACHE_MAX_AGE]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
          <button
            className="px-4 py-2 text-green-700 transition border border-green-700 rounded-lg hover:bg-green-50"
            onClick={() => fetchStats(true)}
            disabled={loading}
            title="Rafraîchir les statistiques"
          >
            {loading ? 'Chargement...' : 'Rafraîchir'}
          </button>
        </div>

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
