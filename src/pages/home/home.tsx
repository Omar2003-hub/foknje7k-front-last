import React, { createContext, useContext, useEffect, useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import CustomButton from "../../shared/custom-button/custom-button";
import AddIcon from "@mui/icons-material/Add";
import WelcomeCard from "../../componet/welcome-card";
import ClassesModal from "../../componet/classModal";
import { ClassesFakeData } from "../../mocks/classes-data";
import { useSelector } from "react-redux";
import {
  createGroupService,
  deleteGroupService,
  getUserGroupService,
  updateGroupService,
} from "../../services/group-service";
import {
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
import { RootState } from "../../redux/store/store";
import { SnackbarContext } from "../../config/hooks/use-toast";
import { classesLevel } from "../../mocks/education-level";
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
import { Drawer } from "@mui/material";

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

const Home: React.FC = () => {
  const role = useSelector(
    (state: RootState) => state?.user?.userData?.role.name,
  );
  const snackbarContext = useContext(SnackbarContext);
  const navigation = useNavigate();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentItem, setCurrentItem] = useState<any | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useEffect(() => {
    getUserGroupService()
      .then((res) => {
        setProfileData(res.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  const handleOpenModal = (profile: any | null) => {
    setSelectedProfile(profile);
    setIsEdit(profile !== null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProfile(null);
    setIsEdit(false);
    setCurrentItem(null);
    setModalOpen(false);
  };

  const handleSave = (formData: any) => {
    if (isEdit && selectedProfile) {
      updateGroupService(selectedProfile.id, formData)
        .then(() => {
          if (snackbarContext) {
            snackbarContext.showMessage(
              "Success",
              "Class modified successfully",
              "success",
            );
          }
          window.location.reload();
        })
        .catch((error) => {
          console.error("Error updating group:", error);
        });
    } else {
      createGroupService(formData)
        .then(() => {
          if (snackbarContext) {
            snackbarContext.showMessage(
              "Success",
              "Class added successfully",
              "success",
            );
          }
          window.location.reload();
        })
        .catch((error) => {
          console.error("Error creating group:", error);
        });
    }
  };

  const handleClickMenu = (event: React.MouseEvent<HTMLElement>, item: any) => {
    setAnchorEl(event.currentTarget);
    setCurrentItem(item);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setCurrentItem(null);
  };

  const handleClickAlert = (profile: any) => {
    setSelectedProfile(profile);
    setOpenAlert(true);
    handleCloseMenu();
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
    setSelectedProfile(null);
  };

  const handleSubmitAlert = () => {
    deleteGroupService(selectedProfile.id)
      .then(() => {
        setOpenAlert(false);
        setSelectedProfile(null);
        if (snackbarContext) {
          snackbarContext.showMessage(
            "Success",
            "Class deleted successfully",
            "success",
          );
        }
        window.location.reload();
      })
      .catch((e) => {
        console.log(e);
      });
  };
  
  const getEducationLevelLabel = (value: string) => {
    const level = classesLevel.find((level) => level.value === value);
    return level ? level.label : value;
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
             
              <div className="flex flex-wrap justify-center w-full pt-10 mb-10">
                {profileData.filter(item => item.active === true).map((item) => (
                  <div
                    key={item.id}
                    className="relative w-full m-5 overflow-hidden bg-white shadow-lg sm:w-1/2 lg:w-1/3 rounded-3xl h-72"
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
                          open={Boolean(anchorEl) && currentItem === item}
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
                          <MenuItem
                            onClick={() => {
                              handleOpenModal(item);
                              handleCloseMenu();
                            }}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem onClick={() => handleClickAlert(item)}>
                            Delete
                          </MenuItem>
                        </Menu>
                      </div>
                    )}
                    <div className="flex items-end justify-start md:-mt-12 ms-5">
                      <img
                        className="hidden object-cover w-32 h-32 border-4 border-white rounded-full md:block"
                        src={item.mainImageUrl}
                        alt="Profile"
                      />
                      <div className="px-6 py-4">
                        <div className="mb-2 text-xs font-montserrat_semi_bold md:text-xl">
                          {item.title}
                        </div>
                        <p className="text-xs lowercase text-title font-montserrat_regular md:text-base">
                          {getEducationLevelLabel(item.educationLevel)}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-center w-full">
                      <CustomButton
                        onClick={() => navigation(`/subject/${item.id}`)}
                        text={"Rejoindre"}
                        width={"w-22"}
                        className={"text-xs"}
                      />
                    </div>
                    <div className="flex justify-end w-full px-3">
                      <p className="text-lg font-montserrat_semi_bold text-title">
                        {item.superTeacherFullName}
                      </p>
                    </div>
                  </div>
                ))}
                {(role === "ROLE_ADMIN" || role === "ROLE_SUPER_TEACHER") && (
                  <div className="flex items-center justify-center w-full m-5 sm:w-1/2 lg:w-1/3">
                    <div
                      onClick={() => handleOpenModal(null)}
                      className="flex items-center justify-center w-20 h-20 p-4 rounded-full cursor-pointer bg-primary"
                    >
                      <AddIcon className="text-white" style={{ fontSize: 50 }} />
                    </div>
                  </div>
                )}
              </div>
              
              <ClassesModal
                open={modalOpen}
                onClose={handleCloseModal}
                modalTitle={isEdit ? "Modifier Class" : "Ajouter Nouveau class"}
                buttonText={isEdit ? "Modifier" : "Ajouter"}
                handleActionClick={handleSave}
                initialData={selectedProfile}
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
                      Vous êtes sûr de supprimer ce class?
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
                    onClick={handleSubmitAlert}
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

export default Home;