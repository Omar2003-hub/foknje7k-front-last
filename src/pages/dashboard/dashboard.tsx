import React, { createContext, useContext, useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { Drawer, IconButton } from "@mui/material";
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

// Composant Breadcrumb
function Breadcrumb() {
  const location = useLocation();
  
  // Fonction de traduction des segments de chemin
  const translateSegment = (segment: string) => {
    const translations: Record<string, string> = {
      'offer-teacher': 'Offre Professeur',
      'offer-student': 'Offre Étudiant',
      'subscription': 'Abonnement',
      'management-prof': 'Gestion Professeurs',
      'management-student': 'Gestion Étudiants',
      'files': 'Fichiers',
      'calender': 'Calendrier Live',
      'chat': 'Chat Room',
      'requests-prof': 'Demandes des Professeurs',
      'requests-student': 'Demandes des Étudiants',
      'stats': 'Statistiques',
      'dashboard': 'Tableau de Bord'
    };

    const lowerSegment = segment.toLowerCase();
    return translations[lowerSegment] || segment;
  };

  const pathSegments = location.pathname
    .split('/')
    .filter(Boolean)
    .map(segment => 
      translateSegment(segment)
        .replace(/\b\w/g, (l) => l.toUpperCase())
    );

  return (
    <div className="flex items-center w-full space-x-2 text-sm font-montserrat_medium text-title">
      {/* Lien Accueil */}
      <NavLink to="/" className="flex items-center gap-1 hover:text-[#09745f] transition-colors">
        <FontAwesomeIcon
          icon={faHome}
          className="w-4 h-4 text-gray-600"
        />
        <span>Accueil</span>
      </NavLink>
      
      {pathSegments.length > 0 && (
        <span className="mx-1 text-gray-400">{">"}</span>
      )}

      {pathSegments.map((crumb, index) => (
        <div key={index} className="flex items-center">
          {crumb === "Tableau De Bord" ? (
            <NavLink 
              to="/home" 
              className="flex items-center gap-1 hover:text-[#09745f] transition-colors"
            >
              <FontAwesomeIcon
                icon={getIconByText(crumb)}
                className="w-4 h-4 text-gray-600"
              />
              <span>{crumb}</span>
            </NavLink>
          ) : (
            <div className="flex items-center gap-1">
              <FontAwesomeIcon
                icon={getIconByText(crumb)}
                className="w-4 h-4 text-gray-600"
              />
              <span>{crumb}</span>
            </div>
          )}
          
          {index < pathSegments.length - 1 && (
            <span className="mx-1 text-gray-400">{">"}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// Composant principal
const Dashboard = () => {
  const [expanded, setExpanded] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const userRole = useSelector((state: RootState) => state?.user?.userData?.role?.name);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-full pt-24">
      {/* Sidebar - grand écran */}
      <aside className="hidden h-screen md:block">
        <nav className="flex flex-col bg-[#f2f9f7] border-t border-b border-r border-[#09745f]"> 
          <div className="flex items-center justify-between p-4">
      {/* Début de la modification - Rendre le titre cliquable */}
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

            <style>
              {`
                @keyframes fadeInLeft {
                  0% {
                    opacity: 0;
                    transform: translateX(-20px);
                  }
                  100% {
                    opacity: 1;
                    transform: translateX(0);
                  }
                }
              `}
            </style>
          </div>

          <SidebarContext.Provider value={{ expanded }}>
            <ul className="flex-1 px-2">
              {sidebarLinks.map(
                (link) =>
                  userRole && link.roles.includes(userRole) && (
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
          <h2 className="mb-4 text-lg font-bold">Tableau de Bord</h2>
          <nav>
            <ul>
              {sidebarLinks.map(
                (link) =>
                  userRole &&
                  link.roles.includes(userRole) && (
                    <li key={link.path} className="mb-2">
                      <NavLink
                        to={"/dashboard" + link.path}
                        className={({ isActive }) =>
                          `block p-2 rounded ps-12 font-montserrat_medium ${
                            isActive
                              ? "bg-[#09745f] text-white"
                              : "hover:bg-[#60eb98] text-gray-600"
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
      <main className="flex-1 ">
        <div className="h-[65px] justify-between items-center px-5 hidden lg:flex shadow-md bg-[#e8f5f1] border-b border-l ml-1 border-[#09745f]">
          <Breadcrumb />
        </div>

        <div className="h-full px-5 pt-4 lg:px-10">
          <div className="h-full p-4 rounded-lg shadow-sm ">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;