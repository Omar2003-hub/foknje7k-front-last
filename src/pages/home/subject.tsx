import React, { createContext, useContext, useEffect, useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Drawer,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CustomButton from "../../shared/custom-button/custom-button";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate, useParams } from "react-router-dom";
import {
  createSubjectService,
  deleteSubjectService,
  getAllSubjectsByGroupId,
  getAllUserSubjectService,
  updateSubjectService,
} from "../../services/subject-service";
import { useSelector } from "react-redux";
import WelcomeCard from "../../componet/welcome-card";
import SubjectModal from "../../componet/subject-modal";
import { RootState } from "../../redux/store/store";
import { SnackbarContext } from "../../config/hooks/use-toast";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faChartPie,
  faGraduationCap,
  faAnglesLeft,
  faAnglesRight,
  faTachometerAlt,
  faUserGear,
  faUserGraduate,
  faChalkboardTeacher,
  faBookOpen,
  faFolderOpen,
  faCalendarAlt,
  faComments,
  faEnvelopeOpenText,
  faCreditCard,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";

// CONTEXT
const SidebarContext = createContext<{ expanded: boolean }>({ expanded: true });

// Fonction pour déterminer l'icône à afficher selon le texte
function getIconByText(text: string) {
  const lower = text.toLowerCase();
  if (lower === "accueil") return faHome;
  if (lower.includes("tableau de bord")) return faChartPie;
  if (lower.includes("abonnement")) return faCreditCard;
  if (lower.includes("cours")) return faBookOpen;
  if (lower.includes("fichier")) return faFolderOpen;
  if (lower.includes("calendrier")) return faCalendarAlt;
  if (lower.includes("chat")) return faComments;
  if (lower.includes("statistique")) return faChartBar;
  if (lower.includes("demande")) return faEnvelopeOpenText;
  if (lower.includes("étudiant") || lower.includes("eleve")) return faUserGraduate;
  if (lower.includes("professeur") || lower.includes("prof")) return faChalkboardTeacher;
  if (lower.includes("gestion")) return faUserGear;
  if (lower.includes("offre")) return faGraduationCap;
  return faTachometerAlt;
}

// Composant pour les éléments de menu
function SidebarItem({
  text,
  to,
  alert,
}: {
  text: string;
  to: string;
  alert?: boolean;
}) {
  const { expanded } = useContext(SidebarContext);
  const icon = <FontAwesomeIcon icon={getIconByText(text)} className={`w-4 h-4 ${expanded ? "text-gray-600" : "text-gray-700"}`} />;

  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <li
          className={`
            relative flex items-center
            ${expanded ? "py-2 px-3 gap-2" : "py-1 px-2 gap-1"}
            my-1 font-medium rounded-md cursor-pointer
            transition-all duration-300 group
            ${
              isActive
                ? "bg-gradient-to-tr from-[#09745f] via-[#048c6b] to-[#07b98e] text-white"
                : "hover:bg-[#5ed5b9] text-gray-600"
            }`}
        >
          {isActive ? (
            <FontAwesomeIcon icon={getIconByText(text)} className="w-4 h-4 text-white" />
          ) : (
            icon
          )}

          <span
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
              expanded ? "w-52 ml-2" : "w-0 ml-0"
            }`}
          >
            {text}
          </span>

          {alert && (
            <div
              className={`absolute right-2 w-2 h-2 rounded bg-[#07b98e] ${
                expanded ? "" : "top-2"
              }`}
            ></div>
          )}

          {!expanded && (
            <div
              className={`
                absolute left-full rounded-md px-2 py-1 ml-3
                bg-[#07b98e] text-white text-sm
                invisible opacity-0 -translate-x-3 transition-all
                group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
              `}
            >
              {text}
            </div>
          )}
        </li>
      )}
    </NavLink>
  );
}

// Liste des liens avec rôles autorisés
const sidebarLinks = [
  { path: "/offer-teacher", name: "Offre Professeur", roles: ["ROLE_SUPER_TEACHER", "ROLE_ADMIN"] },
  { path: "/offer-student", name: "Offre Étudiant", roles: ["ROLE_STUDENT", "ROLE_ADMIN"] },
  { path: "/subscription", name: "Abonnement", roles: ["ROLE_SUPER_TEACHER", "ROLE_STUDENT"] },
  { path: "/management-prof", name: "Gestion Professeurs", roles: ["ROLE_ADMIN", "ROLE_SUPER_TEACHER"] },
  { path: "/management-student", name: "Gestion Étudiants", roles: ["ROLE_ADMIN", "ROLE_SUPER_TEACHER"] },
  { path: "/management-users", name: "Gestion des utilisateurs", roles: ["ROLE_ADMIN"] },
  { path: "/files", name: "Fichiers", roles: ["ROLE_ADMIN", "ROLE_SUPER_TEACHER", "ROLE_TEACHER"] },
  { path: "/calender", name: "Calendrier Live", roles: ["ROLE_ADMIN", "ROLE_TEACHER", "ROLE_SUPER_TEACHER", "ROLE_STUDENT"] },
  { path: "/chat", name: "Chat Room", roles: ["ROLE_ADMIN", "ROLE_TEACHER", "ROLE_SUPER_TEACHER", "ROLE_STUDENT"] },
  { path: "/requests-prof", name: "Demandes des Professeurs", roles: ["ROLE_ADMIN"] },
  { path: "/requests-student", name: "Demandes des Étudiants", roles: ["ROLE_ADMIN"] },
  { path: "/stats", name: "Statistiques", roles: ["ROLE_ADMIN"] },
];

interface Subject {
  id: number;
  backgroundImageUrl: string;
  mainImageUrl: string;
  level: string;
  teacherId: string;
  speciality: string;
  sections: {
    sectionColor: string;
    sectionName: string;
  }[];
}

const Subject: React.FC = () => {
  const snackbarContext = useContext(SnackbarContext);
  const role = useSelector(
    (state: RootState) => state?.user?.userData?.role.name,
  );
  const { id } = useParams();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [modalData, setModalData] = useState<any | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openAlert, setOpenAlert] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<any | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (id) {
      getAllSubjectsByGroupId(Number(id))
        .then((res) => {
          setSubjects(res.data);
        })
        .catch((error) => {
          console.error("Failed to fetch subjects:", error);
        });
    } else {
      getAllUserSubjectService()
        .then((res) => {
          setSubjects(res.data);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [id]);

  const handleOpenModal = (profile: Subject | null) => {
    if (profile) {
      setIsEdit(true);
      setModalData(profile);
    } else {
      setIsEdit(false);
      setModalData(null);
    }
    setCurrentItem(profile);
    setModalOpen(true);
    handleCloseMenu();
  };

  const handleCloseModal = () => {
    setCurrentItem(null);
    setIsEdit(false);
    setModalOpen(false);
    handleCloseMenu();
  };

  const handleSave = (formData: any) => {
    formData.append("groupId", id);
    if (isEdit && currentItem) {
      updateSubjectService(currentItem.id, formData)
        .then(() => {
          getAllSubjectsByGroupId(Number(id))
            .then((res) => {
              setSubjects(res.data);
              if (snackbarContext) {
                snackbarContext.showMessage(
                  "Succes",
                  "Matiére Modifier avec succée",
                  "success",
                );
              }
              window.location.reload();
              setModalOpen(false);
            })
            .catch((error) => {
              console.error("Failed to fetch subjects:", error);
            });
        })
        .catch((e) => {
          console.log(e);
        });
    } else {
      createSubjectService(formData)
        .then(() => {
          getAllSubjectsByGroupId(Number(id))
            .then((res) => {
              setSubjects(res.data);
              window.location.reload();
              if (snackbarContext) {
                snackbarContext.showMessage(
                  "Succes",
                  "Matiére Ajouter avec succée",
                  "success",
                );
              }
              setModalOpen(false);
            })
            .catch((error) => {
              console.error("Failed to fetch subjects:", error);
            });
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  const handleClickMenu = (
    event: React.MouseEvent<HTMLElement>,
    item: Subject,
  ) => {
    setAnchorEl(event.currentTarget);
    setCurrentItem(item);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleClickAlert = () => {
    setOpenAlert(true);
    handleCloseMenu();
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const handleDelete = () => {
    if (currentItem) {
      deleteSubjectService(currentItem.id)
        .then(() => {
          getAllSubjectsByGroupId(Number(id))
            .then((res) => {
              setSubjects(res.data);
              if (snackbarContext) {
                snackbarContext.showMessage(
                  "Succes",
                  "Matière Supprimer avec succée",
                  "success",
                );
              }
            })
            .catch((error) => {
              console.error("Failed to fetch subjects:", error);
            });
          setOpenAlert(false);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-full pt-24">
      {/* Sidebar - grand écran */}
       <aside className="hidden h-screen md:block">
        <nav className="flex flex-col bg-[#f2f9f7] border-t border-b border-r border-[#09745f]"> 
          <div className="flex items-center justify-between p-4">
            <NavLink 
              to="/home"
              className="flex items-center gap-2 overflow-hidden group"
            >
              <FontAwesomeIcon
                icon={faGraduationCap}
                className={`text-[#09745f] transition-all ${
                  expanded ? "w-7 h-7 animate-spin [animation-duration:4s]" : "w-0 h-0"
                } group-hover:animate-pulse`}
              />

              {expanded && (
                <span
                  className="text-lg font-semibold text-[#09745f] animate-[fadeInLeft_1s_ease-out_forwards] group-hover:text-[#048c6b] transition-colors"
                  style={{
                    animationName: 'fadeInLeft',
                    animationDuration: '1s',
                    animationTimingFunction: 'ease-out',
                    animationFillMode: 'forwards',
                  }}
                >
                  Tableau de Bord
                </span>
              )}
            </NavLink>

            <button
              onClick={() => setExpanded((curr) => !curr)}
              className="p-1.5 rounded-lg bg-gradient-to-r from-[#09745f] via-[#048c6b] to-[#07b98e] text-white hover:opacity-90"
            >
              <FontAwesomeIcon icon={expanded ? faAnglesLeft : faAnglesRight} className="w-4 h-4" />
            </button>
          </div>

          <SidebarContext.Provider value={{ expanded }}>
            <ul className="flex-1 px-2">
              {sidebarLinks.map(
                (link) =>
                  role && link.roles.includes(role) && (
                    <SidebarItem key={link.path} to={"/dashboard" + link.path} text={link.name} />
                  )
              )}
            </ul>
          </SidebarContext.Provider>
        </nav>
      </aside>

      {/* Toggle sidebar bouton mobile */}
      <div className="absolute md:hidden right-3 top-20">
        <IconButton onClick={toggleSidebar}>
          <MenuOpenIcon />
        </IconButton>
      </div>

      {/* Drawer mobile */}
      <Drawer
        anchor="right"
        open={isSidebarOpen}
        onClose={toggleSidebar}
        className="sm:hidden"
        transitionDuration={{ enter: 500, exit: 500 }}
      >
        <aside className="w-64 h-full p-4 bg-white shadow-md">
          <NavLink 
            to="/home"
            className="flex items-center gap-2 mb-4 group"
          >
            <FontAwesomeIcon
              icon={faGraduationCap}
              className="w-7 h-7 text-[#09745f] group-hover:animate-pulse"
            />
            <h2 className="text-lg font-bold group-hover:text-[#048c6b]">Tableau de Bord</h2>
          </NavLink>
          
          <nav>
            <ul>
              {sidebarLinks.map(
                (link) =>
                  role &&
                  link.roles.includes(role) && (
                    <li key={link.path} className="mb-2">
                      <NavLink
                                             to={"/dashboard" + link.path}
                                             className={({ isActive }) =>
                                               `block p-2 rounded ps-12 ${
                                                 isActive
                                                   ? "bg-[#09745f] to text-white"
                                                   : "hover:bg-[#07b98e] text-gray-600"
                                               }`
                                             }
                                           >
                                             {({ isActive }) => (
                                               <>
                                                 <FontAwesomeIcon 
                                                   icon={getIconByText(link.name)} 
                                                   className={`w-4 h-4 mr-2 ${isActive ? "text-white" : "text-gray-600"}`} 
                                                 />
                                                 {link.name}
                                               </>
                                             )}
                                           </NavLink>
                    </li>
                  )
              )}
            </ul>
          </nav>
        </aside>
      </Drawer>

      {/* Contenu principal */}
      <main className="flex-1">
        <div className="h-full px-5 lg:px-10">
          <div className="h-full p-4 rounded-lg shadow-sm">
            <div className="flex flex-col items-center px-4 md:px-12">
               <div className="-mt-[40px] w-full">
    <WelcomeCard />
  </div>
             
              <div className="flex flex-wrap justify-center w-full my-10">
                {subjects.map((item) => (
                  <div
                    key={item.id}
                    className="relative w-full m-4 overflow-hidden bg-white shadow-lg sm:w-1/2 md:w-1/3 lg:w-1/4 rounded-3xl h-96"
                  >
                    <div
                      className="h-32 bg-center bg-cover"
                      style={{ backgroundImage: `url("${item.backgroundImageUrl}")` }}
                    ></div>
                    {(role === "ROLE_ADMIN" || role === "ROLE_SUPER_TEACHER") && (
                      <div className="absolute bg-white rounded-full top-2 right-2">
                        <IconButton onClick={(event) => handleClickMenu(event, item)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleCloseMenu}
                          anchorOrigin={{
                            vertical: "top",
                            horizontal: "right",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                          }}
                        >
                          <MenuItem onClick={() => handleOpenModal(currentItem)}>
                            Edit
                          </MenuItem>
                          <MenuItem onClick={handleClickAlert}>Delete</MenuItem>
                        </Menu>
                      </div>
                    )}
                    <div className="flex items-end p-2 -mt-6 justify-left ">
                      <img
                        className="object-cover w-20 h-20 border-4 border-white rounded-full md:w-28 md:h-28"
                        src={item.mainImageUrl}
                        alt="Profile"
                      />
                      <div className="px-3 py-5">
                        <p className="text-base text-title md:text-lg font-montserrat_semi_bold">
                          {item.level}
                        </p>
                        <p className="text-sm text-title md:text-base font-montserrat_medium">
                          {item.speciality}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center w-full px-2 ps-5 justify-left">
                      <p className="text-sm md:text-base font-montserrat_regular pe-5 text-text ">
                        Section:
                      </p>
                      {item.sections.map(
                        (
                          section: {
                            sectionColor: string;
                            sectionName: string;
                          },
                          index: number,
                        ) => (
                          <div
                            key={index}
                            className="px-3 py-1 m-1 text-sm text-center text-white w-min rounded-xl text-nowrap md:text-base"
                            style={{ backgroundColor: section.sectionColor }}
                          >
                            {section.sectionName}
                          </div>
                        ),
                      )}
                    </div>
                    <div className="flex justify-center w-full px-3 pt-2 text-sm text-white">
                      <CustomButton
                        onClick={() => navigate(`/subject-details?id=${item.id}`)}
                        text={"Rejoindre"}
                        width={"w-22"}
                        className="text-white"
                      />
                    </div>
                    <div className="w-full flex justify-end px-3 position: absolute bottom-2.5 -left-3">
                      <p className="text-base font-montserrat_semi_bold text-title">
                        {item.superTeacherFullName}
                      </p>
                    </div>
                  </div>
                ))}
                {(role === "ROLE_ADMIN" || role === "ROLE_SUPER_TEACHER") && (
                  <div className="flex items-center justify-center w-full m-4 sm:w-1/2 md:w-1/3 lg:w-1/4">
                    <div
                      onClick={() => handleOpenModal(null)}
                      className="flex items-center justify-center w-20 h-20 p-4 rounded-full cursor-pointer bg-primary"
                    >
                      <AddIcon className="text-white" style={{ fontSize: 50 }} />
                    </div>
                  </div>
                )}
              </div>
              <div className="h-10"></div>
             
              <SubjectModal
                open={modalOpen}
                onClose={handleCloseModal}
                initialData={modalData ?? undefined}
                modalTitle={isEdit ? "Modifier Matiere" : "Ajouter Matiere"}
                buttonText={isEdit ? "Mettre à jour" : "Ajouter Matiere"}
                onButtonClick={handleSave}
              />
              <Dialog
                open={openAlert}
                keepMounted
                onClose={handleCloseAlert}
                aria-describedby="alert-dialog-slide-description"
              >
                <DialogTitle>
                  <p className="text-2xl font-montserrat_semi_bold text-title">
                    {"Confirmer?"}
                  </p>
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-slide-description">
                    <p className="font-montserrat_medium text-text">
                      Vous êtes sûr de supprimer cetter Offre?
                    </p>
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <CustomButton
                    text={"Annuler"}
                    className={"bg-text text-white"}
                    width={"w-32"}
                    onClick={handleCloseAlert}
                  />
                  <CustomButton
                    text={"Supprimer"}
                    className={"bg-red text-white"}
                    width={"w-32"}
                    onClick={handleDelete}
                  />
                </DialogActions>
              </Dialog>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Subject;