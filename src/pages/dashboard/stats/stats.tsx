import React, { useEffect, useState } from "react";
import { BoxStat, MontantStat, TotalStat, UserStat } from "../../../assets/svg";
import { getStatService } from "../../../services/playList-service";


interface StatBoxProps {
  title: string;
  value: any;
  icon?: string;
}

function StatBox(props: StatBoxProps) {
  const { title, value, icon } = props;

  return (
    <div
      className="relative flex flex-col items-center justify-center p-6 text-gray-800 transition-transform duration-300 transform bg-white rounded-lg shadow-md hover:scale-105 hover:shadow-lg"
    >
      {icon && (
        <div className="absolute p-2 bg-gray-100 rounded-full top-4 right-4">
          <img src={icon} alt="icon" className="w-8 h-8" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-center">{title}</h3>
      <p className="text-3xl font-extrabold text-center">{value}</p>
    </div>
  );
}

const Stats = () => {
  const [data, setData] = useState<any>();


  useEffect(() => {
    getStatService().then((res) => {
      console.log(res);
      setData(res.data);
    });
  }, []);

  return (
    <div className="flex flex-col justify-center w-full mb-10">
      <h1 className="mb-10 text-3xl text-title font-montserrat_bold">
        Statistiques
      </h1>
      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <StatBox
          title="Total Utilisateurs"
          value={data?.totalUsers}
          icon={UserStat}
        />
        <StatBox
          title="Ordres actifs"
          value={data?.totalOrders}
          icon={BoxStat}
        />
        <StatBox
          title="Montant total"
          value={`${data?.totalPrice} Dt`}
          icon={MontantStat}
        />
        <StatBox
          title="Total en attente"
          value={data?.totalPendingOrders}
          icon={TotalStat}
        />
        <StatBox
          title="Total Élèves"
          value={data?.totalStudents}
          icon={UserStat}
        />
        <StatBox
          title="Total Enseignants"
          value={data?.totalTeachers}
          icon={UserStat}
        />
        <StatBox
          title="Total Super Enseignants"
          value={data?.totalSuperTeachers}
          icon={UserStat}
        />
        <StatBox
          title="Élèves actifs"
          value={data?.totalActiveStudents}
          icon={UserStat}
        />
        <StatBox
          title="Enseignants actifs"
          value={data?.totalActiveTeachers}
          icon={UserStat}
        />
        <StatBox
          title="Élèves avec offre inscrite"
          value={data?.totalStudentsWithEnrolledOffer}
          icon={UserStat}
        />
      </div>
    </div>
  );
};

export default Stats;

export {};
