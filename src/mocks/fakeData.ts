export const columnsAds = [
  { Header: "Titre", accessor: "title" },
  { Header: "education Niveau", accessor: "educationLevel" },
];

export const columnsProf = [
  { Header: "Nom", accessor: "fullName" },
  { Header: "email", accessor: "email" },
  { Header: "phoneNumber", accessor: "phoneNumber" },
];

export const columnsStudent = [
  { Header: "Nom", accessor: "fullName" },
  { Header: "email", accessor: "email" },
  { Header: "phoneNumber", accessor: "phoneNumber" },
  { Header: "Abonnement", accessor: "isSubscriptionActive" }, // Use correct field name
];

export const columnsRequests = [
  { Header: "id", accessor: "id" },
  { Header: "Nom", accessor: "superTeacherName" },
  { Header: "Status", accessor: "status" },
  { Header: "Expire le", accessor: "endDate" },
  { Header: "Offer", accessor: "teacherOffer.title" },
];
export const columnsRequestsStudent = [
  { Header: "id", accessor: "id" },
  { Header: "Nom", accessor: "studentName"},
  { Header: "Status", accessor: "status" },
  { Header: "Expire le", accessor: "endDate" },
  { Header: "Offer", accessor: "studentOffer.title" },
];
export const columnsRequestsCurrentStudent = [
  { Header: "Offer", accessor: "studentOffer.title" },
  { Header: "Sous Titre", accessor: "studentOffer.subTitle" },
  { Header: "Términer le ", accessor: "endDate" },
];
export const columnsRequestsCurrentTeacher = [
  { Header: "Offer", accessor: "teacherOffer.title" },
  { Header: "Sous Titre", accessor: "teacherOffer.subTitle" },
  { Header: "Términer le ", accessor: "endDate" },
];
export const columnsFielManagement = [
  { Header: "Nom du Fichier", accessor: "title" },
  { Header: "Playlist", accessor: "type" },
  { Header: "Telecharge", accessor: "telecharge" },
];
