import React, { createContext, useContext, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconButton, Drawer } from "@mui/material";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { Logo } from "../../assets/images";
import {
  faHome,
  faChartPie,
  faGraduationCap,
  faAnglesLeft,
  faAnglesRight,
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
  faSignOutAlt,
  faSquareCaretDown
} from "@fortawesome/free-solid-svg-icons";
import {
  faWhatsapp,
  faFacebook,
  faInstagram,
  faYoutube
} from "@fortawesome/free-brands-svg-icons";

// CONTEXT
const SidebarContext = createContext<{ expanded: boolean }>({ expanded: true });

// Types
interface SidebarLink {
  path: string;
  name: string;
  roles: string[];
}

interface SidebarProps {
  className?: string;
}

// Sidebar configuration
const sidebarLinks: SidebarLink[] = [
  { path: "/home", name: "Mes Classes", roles: ["ROLE_ADMIN", "ROLE_SUPER_TEACHER", "ROLE_TEACHER", "ROLE_STUDENT"] },
  { path: "/offer-teacher", name: "Offre Professeur", roles: ["ROLE_SUPER_TEACHER", "ROLE_ADMIN"] },
  { path: "/offer-student", name: "Offres", roles: ["ROLE_STUDENT", "ROLE_ADMIN"] },
  { path: "/subscription", name: "Abonnement", roles: ["ROLE_SUPER_TEACHER", "ROLE_STUDENT"] },
  { path: "/management-prof", name: "Gestion Professeurs", roles: ["ROLE_ADMIN", "ROLE_SUPER_TEACHER"] },
  { path: "/management-student", name: "Gestion Élèves", roles: ["ROLE_ADMIN", "ROLE_SUPER_TEACHER"] },
  { path: "/management-users", name: "Gestion des utilisateurs", roles: ["ROLE_ADMIN"] },
  { path: "/files", name: "Fichiers", roles: ["ROLE_ADMIN", "ROLE_SUPER_TEACHER", "ROLE_TEACHER"] },
  { path: "/calender", name: "Calendrier Live", roles: ["ROLE_ADMIN", "ROLE_TEACHER", "ROLE_SUPER_TEACHER", "ROLE_STUDENT"] },
  { path: "/chat", name: "Chat Room", roles: ["ROLE_ADMIN", "ROLE_TEACHER", "ROLE_SUPER_TEACHER", "ROLE_STUDENT"] },
  { path: "/requests-prof", name: "Demandes des Professeurs", roles: ["ROLE_ADMIN"] },
  { path: "/requests-student", name: "Demandes des Élèves", roles: ["ROLE_ADMIN"] },
  { path: "/stats", name: "Statistiques", roles: ["ROLE_ADMIN"] },
  { path: "/referral-code", name: "Referral Code", roles: ["ROLE_ADMIN", "ROLE_SUPER_TEACHER", "ROLE_TEACHER", "ROLE_STUDENT"] },
];

// Function to get icon by text
function getIconByText(text: string) {
  const lower = text.toLowerCase();
  if (lower === "mes classes") return faGraduationCap;
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
  return faGraduationCap;
}

// Sidebar Item Component
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
  const icon = getIconByText(text);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (!expanded && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: rect.right + 24, // 24px offset from the right edge
        y: rect.top + rect.height / 2, // Center vertically
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <li className={`relative group`}>
          <div
            ref={itemRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`
              relative flex items-center w-full
              ${expanded ? "px-5 py-4 gap-4" : "px-4 py-4 justify-center"}
              rounded-2xl font-semibold cursor-pointer
              transition-all duration-300 hover:shadow-lg
              ${
                isActive
                  ? "bg-gradient-to-r from-[#09745f] to-[#07b98e] text-white shadow-xl transform scale-[1.02] border border-white/20"
                  : "text-gray-700 hover:bg-white/80 hover:shadow-md hover:text-[#09745f] hover:scale-[1.01] border border-transparent hover:border-white/30"
              }
            `}
          >
            {/* Icon */}
            <div className={`flex-shrink-0 transition-all duration-300 ${
              isActive ? "text-white" : "text-gray-500 group-hover:text-[#09745f] group-hover:scale-110"
            }`}>
              <FontAwesomeIcon icon={icon} className="w-6 h-6" />
            </div>

            {/* Text */}
            <span
              className={`font-semibold text-sm tracking-wide transition-all duration-300 ease-in-out ${
                expanded 
                  ? "opacity-100 translate-x-0" 
                  : "opacity-0 -translate-x-2 w-0 overflow-hidden"
              }`}
            >
              {text}
            </span>

            {/* Alert Badge */}
            {alert && expanded && (
              <div className="w-2 h-2 ml-auto bg-red-500 rounded-full"></div>
            )}
            {alert && !expanded && (
              <div className="absolute w-3 h-3 bg-red-500 border-2 border-white rounded-full -top-1 -right-1"></div>
            )}
          </div>
          
          {/* Tooltip Portal - renders outside sidebar */}
          {!expanded && showTooltip && createPortal(
            <div
              className="fixed px-4 py-2.5 text-white text-sm font-medium rounded-lg shadow-2xl transition-all duration-150 whitespace-nowrap pointer-events-none"
              style={{
                left: tooltipPosition.x,
                top: tooltipPosition.y,
                transform: 'translateY(-50%)',
                backgroundColor: '#1f2937',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                zIndex: 99999,
              }}
            >
              {text}
              {/* Arrow pointing left */}
              <div 
                className="absolute w-0 h-0 -translate-y-1/2 right-full top-1/2" 
                style={{
                  borderTop: '6px solid transparent',
                  borderBottom: '6px solid transparent',
                  borderRight: '6px solid #1f2937',
                }}
              />
            </div>,
            document.body
          )}
        </li>
      )}
    </NavLink>
  );
}

// Main Sidebar Component
const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const role = useSelector((state: RootState) => state?.user?.userData?.role.name);
  const userData = useSelector((state: RootState) => state.user.userData);
  const isLogged = !!role;
  const [dropdownMobileOpen, setDropdownMobileOpen] = useState(false);
  const navigation = require('react-router-dom').useNavigate();
  const userFullName = userData?.fullName || '';
  const userInitials = userFullName
    ? userFullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '';
  const handleLogout = () => {
    navigation("/");
    localStorage.clear();
    setDropdownMobileOpen(false);
    setIsMobileSidebarOpen(false);
    // Optionally dispatch Redux logout actions if needed
  };
  const goToDashboard = () => {
    const path = role === "ROLE_TEACHER" ? "/subject" : "/home";
    navigation(path);
    setDropdownMobileOpen(false);
    setIsMobileSidebarOpen(false);
  };
  const [expanded, setExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

  // Custom scrollbar styles
  React.useEffect(() => {
    const styleId = 'sidebar-scrollbar-styles';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement("style");
      styleElement.id = styleId;
      const customScrollbarStyle = `
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
        .custom-scrollbar-hidden {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .custom-scrollbar-hidden::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          background: transparent !important;
        }
        .custom-scrollbar-hidden::-webkit-scrollbar-thumb {
          display: none !important;
        }
        .custom-scrollbar-hidden::-webkit-scrollbar-track {
          display: none !important;
        }
        /* Hide scrollbar for all descendants in collapsed mode */
        .custom-scrollbar-hidden, .custom-scrollbar-hidden * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .custom-scrollbar-hidden::-webkit-scrollbar, .custom-scrollbar-hidden *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          background: transparent !important;
        }
        .custom-scrollbar-hidden::-webkit-scrollbar-thumb, .custom-scrollbar-hidden *::-webkit-scrollbar-thumb {
          display: none !important;
        }
        .custom-scrollbar-hidden::-webkit-scrollbar-track, .custom-scrollbar-hidden *::-webkit-scrollbar-track {
          display: none !important;
        }
      `;
      styleElement.textContent = customScrollbarStyle;
      document.head.appendChild(styleElement);
    }
  }, []);

  // Emit initial sidebar state
  React.useEffect(() => {
    const event = new CustomEvent('sidebarToggle', { 
      detail: { expanded } 
    });
    window.dispatchEvent(event);
  }, [expanded]);

  return (
    <>
      {/* Fixed Sidebar - Desktop */}
      <aside className={`hidden md:flex fixed left-0 top-0 h-full z-50 transition-all duration-500 ease-out ${expanded ? "w-72 overflow-x-hidden" : "w-32 overflow-visible"} ${className}`}>
        <nav className="flex flex-col w-full border-r border-gray-200 shadow-xl bg-text bg-opacity-5 backdrop-blur-xl">
          {/* Header */}
          <div className={`flex items-center border-b border-white/20 bg-text bg-opacity-5 h-[80px] ${
            expanded ? "justify-between p-6" : "justify-center p-4"
          }`}>
            {expanded ? (
              <>
                <img
                  src={Logo}
                  alt="Foknje7ek Logo"
                  className="w-auto h-20 transition-all duration-300 cursor-pointer"
                />
                <div className="flex flex-col transition-all duration-300">
                  <span className="text-2xl font-bold text-[#09745f] leading-tight">
                    Fok Nje7ek
                  </span>
                </div>
                <button
                  onClick={() => {
                    const newExpanded = !expanded;
                    setExpanded(newExpanded);
                    // Emit custom event for layout updates
                    const event = new CustomEvent('sidebarToggle', { detail: { expanded: newExpanded } });
                    window.dispatchEvent(event);
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-[#09745f] shadow transition-all duration-300 ml-2"
                  title="Réduire"
                >
                  <FontAwesomeIcon 
                    icon={faAnglesLeft} 
                    className="w-3 h-3" 
                  />
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center w-full gap-2">
                <img
                  src={Logo}
                  alt="Foknje7ek Logo"
                  className="w-auto h-16 transition-all duration-300 cursor-pointer"
                />
                <button
                  onClick={() => {
                    const newExpanded = true;
                    setExpanded(newExpanded);
                    // Emit custom event for layout updates
                    const event = new CustomEvent('sidebarToggle', { detail: { expanded: newExpanded } });
                    window.dispatchEvent(event);
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-[#09745f] shadow transition-all duration-300"
                  title="Étendre"
                >
                  <FontAwesomeIcon 
                    icon={faAnglesRight} 
                    className="w-3 h-3" 
                  />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <SidebarContext.Provider value={{ expanded }}>
            <div
              className={`flex-1 px-4 py-8 custom-scrollbar-hidden bg-text bg-opacity-5 overflow-x-hidden overflow-y-auto`}
              style={{ maxHeight: 'calc(100vh - 160px)', scrollbarWidth: 'none', msOverflowStyle: 'none', overscrollBehavior: 'contain' }}
            >
              <ul className="space-y-3">
                {sidebarLinks.map(
                  (link) =>
                    role && link.roles.includes(role) && (
                      <SidebarItem
                        key={link.path}
                        to={link.path === "/home" ? link.path : "/dashboard" + link.path}
                        text={link.name}
                      />
                    )
                )}
              </ul>
            </div>
          </SidebarContext.Provider>

          {/* Social Icons */}
          <div className="flex flex-col items-center gap-2 py-4 bg-transparent border-t border-gray-200">
            <a href="https://wa.me/21651347528" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <FontAwesomeIcon icon={faWhatsapp} className="w-7 h-7 text-[#09745f] hover:text-green-500 transition" />
              <span className="text-base font-medium text-gray-700">+216 51 347 528</span>
            </a>
            <p className="text-sm text-gray-600">Contactez-nous pour support.</p>
            <div className="flex justify-center gap-4 mt-2">
              <a href="https://www.facebook.com/people/%D9%81%D9%83-%D9%86%D8%AC%D8%A7%D8%AD%D9%83/100069589923551/" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faFacebook} className="w-6 h-6 text-[#09745f] hover:text-blue-600 transition" />
              </a>
              <a href="https://www.instagram.com/fok_nje7ik/" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faInstagram} className="w-6 h-6 text-[#09745f] hover:text-pink-500 transition" />
              </a>
              <a href="https://www.youtube.com/@foknje7ik" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faYoutube} className="w-6 h-6 text-[#09745f] hover:text-red-600 transition" />
              </a>
            </div>
          </div>
        </nav>
      </aside>

      {/* Mobile Toggle Button */}
      <div className="fixed z-50 md:hidden right-4 top-4">
        <IconButton 
          onClick={toggleMobileSidebar}
          className="bg-white shadow-lg"
          sx={{ 
            bgcolor: 'white',
            boxShadow: 3,
            '&:hover': { bgcolor: 'gray.100' }
          }}
        >
          <MenuOpenIcon />
        </IconButton>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={isMobileSidebarOpen}
        onClose={toggleMobileSidebar}
        className="md:hidden"
        PaperProps={{
          sx: { width: 288, backgroundColor: 'transparent' }
        }}
      >
        <div className="h-full border-r border-gray-200 shadow-xl bg-text bg-opacity-5 backdrop-blur-xl">
          {/* Mobile Header - Same as PC */}
          <div className="flex items-center justify-between p-6 border-b border-white/20 bg-text bg-opacity-5 h-[80px]">
            <img
              src={Logo}
              alt="Foknje7ek Logo"
              className="w-auto h-20 transition-all duration-300 cursor-pointer"
              onClick={toggleMobileSidebar}
            />
            <div className="flex flex-col transition-all duration-300">
              <span className="text-2xl font-bold text-[#09745f] leading-tight">
                Foknje7ek
              </span>
            </div>
            <button
              onClick={toggleMobileSidebar}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-[#09745f] shadow transition-all duration-300 ml-2"
              title="Fermer"
            >
              <FontAwesomeIcon 
                icon={faAnglesLeft} 
                className="w-3 h-3" 
              />
            </button>
          </div>
          
          {/* User Profile Dropdown for Mobile only */}
          {isLogged && (
            <div className="block md:hidden">
              <div className="px-4 pt-6 pb-2">
                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-[#09745f] to-[#07b98e] text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-medium">
                      {userInitials}
                    </div>
                    <span className="ml-3 text-base font-medium text-gray-700 truncate max-w-[140px]">
                      {userFullName}
                    </span>
                  </div>
                  <button onClick={() => setDropdownMobileOpen(!dropdownMobileOpen)}>
                    <FontAwesomeIcon 
                      icon={faSquareCaretDown} 
                      className="w-4 h-4 text-[#09745f] transition-transform duration-200"
                      style={{ transform: dropdownMobileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </button>
                </div>
                {dropdownMobileOpen && (
                  <div className="z-50 mt-3 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <button 
                      className="flex items-center w-full px-4 py-3 text-base text-gray-700 hover:bg-gradient-to-r from-[#09745f] to-[#07b98e] hover:text-white transition-colors duration-200"
                      onClick={goToDashboard}
                    >
                      <FontAwesomeIcon icon={faChartBar} className="w-5 h-5 mr-3 text-blue-500" />
                      Tableau de bord
                    </button>
                    <button 
                      className="flex items-center w-full px-4 py-3 text-base text-gray-700 hover:bg-gradient-to-r from-[#09745f] to-[#07b98e] hover:text-white transition-colors duration-200"
                      onClick={() => {
                        navigation('/dashboard/updateprofil');
                        setDropdownMobileOpen(false);
                        setIsMobileSidebarOpen(false);
                      }}
                    >
                      <FontAwesomeIcon icon={faUserGear} className="w-5 h-5 mr-3 text-blue-500" />
                      Mon espace
                    </button>
                    <button 
                      className="flex items-center w-full px-4 py-3 text-base text-gray-700 hover:bg-gradient-to-r from-[#09745f] to-[#07b98e] hover:text-white transition-colors duration-200"
                      onClick={handleLogout}
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 mr-3 text-red-500" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Mobile Navigation - Same styling as PC */}
          <div className="flex-1 px-4 py-8 overflow-x-hidden overflow-y-auto custom-scrollbar-hidden bg-text bg-opacity-5"
               style={{ maxHeight: 'calc(100vh - 160px)', scrollbarWidth: 'none', msOverflowStyle: 'none', overscrollBehavior: 'contain' }}>
            <ul className="space-y-3">
              {sidebarLinks.map(
                (link) =>
                  role &&
                  link.roles.includes(role) && (
                    <li key={link.path} className="relative group">
                      <NavLink
                        to={link.path === "/home" ? link.path : "/dashboard" + link.path}
                        onClick={toggleMobileSidebar}
                        className={({ isActive }) =>
                          `relative flex items-center w-full px-5 py-4 gap-4 rounded-2xl font-semibold cursor-pointer transition-all duration-300 hover:shadow-lg ${
                            isActive
                              ? "bg-gradient-to-r from-[#09745f] to-[#07b98e] text-white shadow-xl transform scale-[1.02] border border-white/20"
                              : "text-gray-700 hover:bg-white/80 hover:shadow-md hover:text-[#09745f] hover:scale-[1.01] border border-transparent hover:border-white/30"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className={`flex-shrink-0 transition-all duration-300 ${
                              isActive ? "text-white" : "text-gray-500 group-hover:text-[#09745f] group-hover:scale-110"
                            }`}>
                              <FontAwesomeIcon icon={getIconByText(link.name)} className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-semibold tracking-wide transition-all duration-300 ease-in-out translate-x-0 opacity-100">
                              {link.name}
                            </span>
                          </>
                        )}
                      </NavLink>
                    </li>
                  )
              )}
            </ul>
          </div>

          {/* Mobile Social Icons - Same as PC */}
          <div className="flex justify-center gap-6 py-4 bg-transparent border-t border-gray-200">
            <a href="https://wa.me/21651347528" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <FontAwesomeIcon icon={faWhatsapp} className="w-7 h-7 text-[#09745f] hover:text-green-500 transition" />
              <span className="text-base font-medium text-gray-700">+216 51 347 528</span>
            </a>
            <p className="text-sm text-gray-600">Contactez-nous pour support.</p>
            <div className="flex justify-center gap-4 mt-2">
              <a href="https://www.facebook.com/people/%D9%81%D9%83-%D9%86%D8%AC%D8%A7%D8%AD%D9%83/100069589923551/" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faFacebook} className="w-6 h-6 text-[#09745f] hover:text-blue-600 transition" />
              </a>
              <a href="https://www.instagram.com/fok_nje7ik/" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faInstagram} className="w-6 h-6 text-[#09745f] hover:text-pink-500 transition" />
              </a>
              <a href="https://www.youtube.com/@foknje7ik" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faYoutube} className="w-6 h-6 text-[#09745f] hover:text-red-600 transition" />
              </a>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default Sidebar;
export { SidebarContext, getIconByText, sidebarLinks };