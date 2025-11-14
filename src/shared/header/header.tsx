import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Logo } from "../../assets/images";
import CustomButton from "../custom-button/custom-button";
import { RootState } from "../../redux/store/store";
import { useSelector, useDispatch } from "react-redux";
import { logOut } from "../../redux/store/isLogged-slices";
import { clearUserData } from "../../redux/store/userData-slices";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserCircle, 
  faSignOutAlt, 
  faChevronDown,
  faChartBar
} from '@fortawesome/free-solid-svg-icons';
import "./header.css";

const Header: React.FC = () => {
  const role = useSelector(
    (state: RootState) => state?.user?.userData?.role?.name
  );
  const userData = useSelector((state: RootState) => state.user.userData);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  
  // États séparés pour les dropdowns desktop et mobile
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownMobileOpen, setDropdownMobileOpen] = useState(false);
  
  const navigation = useNavigate();
  const location = useLocation();
  const isLogged = useSelector((state: RootState) => state.auth.isLogged);
  const dispatch = useDispatch();
  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  
  // Réfs distinctes pour les dropdowns
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownMobileRef = useRef<HTMLDivElement>(null);

  // Calcul des initiales et nom complet
  const userFullName = userData?.fullName || '';
  const userInitials = userFullName
    ? userFullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : '';

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      if (!isDashboardRoute) {
        if (currentScrollTop > lastScrollTop) {
          setShowHeader(false);
        } else {
          setShowHeader(true);
        }
      } else {
        setShowHeader(true);
      }

      setLastScrollTop(currentScrollTop <= 0 ? 0 : currentScrollTop);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollTop, location.pathname]);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarExpanded(event.detail.expanded);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    };
  }, []);

  // Gestion des clics en dehors des menus dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Vérifier pour le dropdown desktop
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
      
      // Vérifier pour le dropdown mobile
      if (dropdownMobileRef.current && !dropdownMobileRef.current.contains(target)) {
        setDropdownMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    navigation("/");
    localStorage.clear();
    dispatch(logOut());
    dispatch(clearUserData());
    setDropdownOpen(false);
    setDropdownMobileOpen(false);
    setIsMobileMenuOpen(false);
  };



  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Fermer le dropdown mobile quand on ferme le menu complet
    if (isMobileMenuOpen) setDropdownMobileOpen(false);
  };

  // Fonction pour naviguer vers le tableau de bord selon le rôle
  const goToDashboard = () => {
    const path = role === "ROLE_TEACHER" ? "/subject" : "/home";
    navigation(path);
    setDropdownOpen(false);
    setDropdownMobileOpen(false);
    if (isMobileMenuOpen) toggleMobileMenu();
  };

  return (
    <header
     className={`z-20 h-[80px] bg-text bg-opacity-5 backdrop-blur-sm p-4 flex justify-between items-center fixed top-0 transition-all duration-500 ease-out ${
        showHeader ? "translate-y-0" : "-translate-y-full"
      } shadow-md ${isDashboardRoute ? (sidebarExpanded ? "left-72 right-0" : "left-20 right-0") : "left-0 right-0"}`}
    >
      {/* Logo - Show only when not logged in */}
      {!isLogged && (
        <img
          onClick={() => {
            navigation("/");
          }}
          src={Logo}
          alt="Logo"
          className="h-12 pl-5 cursor-pointer logo-navv lg:h-16 lg:pl-20"
        />
      )}

      {/* Mobile Menu Toggle - hidden on mobile, visible on desktop */}
      <div className="items-center hidden lg:flex">
        <button onClick={toggleMobileMenu} className="z-30">
          {isMobileMenuOpen ? (
            <CloseIcon className="mr-5 text-3xl text-title" />
          ) : (
            <MenuIcon className="mr-5 text-3xl text-title" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <nav
        className={`lg:hidden fixed top-0 left-0 w-full h-full bg-[#f9f6f1] p-6 z-20 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
       
        
        
        {/* Menu Links - Show only when not logged in */}
        {!isLogged && (
          <div className="bg-[#f9f6f1] rounded-t-[40px] pl-5 flex flex-col mt-8 space-y-6">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                toggleMobileMenu();
                if (location.pathname !== "/") {
                  navigation("/");
                } else {
                  scrollToSection("home");
                }
              }}
              className="text-2xl text-title font-montserrat_regular hover:text-primary"
            >
              Acceuil
            </a>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                toggleMobileMenu();
                if (location.pathname !== "/") {
                  navigation("/");
                } else {
                  scrollToSection("about");
                }
              }}
              className="text-2xl text-title font-montserrat_regular hover:text-primary"
            >
              À propos
            </a>
            <a
              href="#free-courses"
              onClick={(e) => {
                e.preventDefault();
                toggleMobileMenu();
                if (location.pathname !== "/") {
                  navigation("/");
                } else {
                  scrollToSection("free-courses");
                }
              }}
              className="text-2xl text-title font-montserrat_regular hover:text-primary"
            >
              Cours gratuits
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                toggleMobileMenu();
                if (location.pathname !== "/") {
                  navigation("/");
                } else {
                  scrollToSection("contact");
                }
              }}
              className="pb-2 text-2xl text-title font-montserrat_regular hover:text-primary"
            >
              Contact
            </a>
          </div>
        )}
        
        {/* Menu utilisateur mobile */}
            {/* Only show sign up / login for mobile if not logged in */}
            {!isLogged && (
              <div className="lg:hidden pr-3 pl-3 ml-0 rounded-b-[40px] bg-[#f9f6f1] flex flex-col space-y-5">
                <CustomButton
                  text={"S'inscrire"}
                  onClick={() => {
                    navigation("/role");
                    toggleMobileMenu();
                  }}
                  width={"w-full"}
                  className="h-12 text-base rounded-lg"
                />
                <CustomButton
                  text={"Se connecter"}
                  onClick={() => {
                    navigation("/login");
                    toggleMobileMenu();
                  }}
                  width={"w-full"}
                  className="h-12 text-base bg-white border-2 rounded-lg border-primary text-primary"
                />
              </div>
            )}
      </nav>

      {/* Desktop Menu - Show only when not logged in */}
      {!isLogged && (
        <nav className="hidden lg:block">
          <ul className="flex space-x-8 xl:space-x-12">
            <li>
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname !== "/") {
                    navigation("/");
                  } else {
                    scrollToSection("home");
                  }
                }}
                className="text-lg transition-colors text-title font-montserrat_regular hover:text-primary"
              >
                Acceuil
              </a>
            </li>
            <li>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname !== "/") {
                    navigation("/");
                  } else {
                    scrollToSection("about");
                  }
                }}
                className="text-lg transition-colors text-title font-montserrat_regular hover:text-primary"
              >
                À propos
              </a>
            </li>
            <li>
              <a
                href="#free-courses"
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname !== "/") {
                    navigation("/");
                  } else {
                    scrollToSection("free-courses");
                  }
                }}
                className="text-lg transition-colors text-title font-montserrat_regular hover:text-primary"
              >
                Cours gratuits
              </a>
            </li>
            <li>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname !== "/") {
                    navigation("/");
                  } else {
                    scrollToSection("contact");
                  }
                }}
                className="text-lg transition-colors text-title font-montserrat_regular hover:text-primary"
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>
      )}

      {/* Menu utilisateur desktop */}
      {isLogged ? (
        <div className="relative hidden ml-auto lg:flex" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center py-1 pl-2 pr-4 space-x-2 transition-all duration-200 rounded-full hover:bg-gray-50"
          >
            <div className="bg-[#09745f] text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-medium shadow-md">
              {userInitials}
            </div>
            <span className="text-base font-medium text-gray-700 truncate max-w-[140px]">
              {userFullName}
            </span>
            <FontAwesomeIcon 
              icon={faChevronDown} 
              className="w-3 h-3 text-gray-500 transition-transform duration-200"
              style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          {dropdownOpen && (
            <div 
              className="absolute right-0 z-50 w-56 mt-2 bg-white border border-gray-200 rounded-md shadow-lg top-full"
            >
              <a 
                href="#" 
                className="flex items-center px-4 py-3 text-base text-gray-700 hover:bg-gradient-to-r from-[#09745f] to-[#07b98e] hover:text-white transition-colors duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  goToDashboard();
                }}
              >
                <FontAwesomeIcon icon={faChartBar} className="w-5 h-5 mr-3 text-blue-500" />
                Tableau de bord
              </a>
              <a 
                href="#" 
                className="flex items-center px-4 py-3 text-base text-gray-700 hover:bg-gradient-to-r from-[#09745f] to-[#07b98e] hover:text-white transition-colors duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  navigation('/dashboard/updateprofil');
                  setDropdownOpen(false);
                }}
              >
                <FontAwesomeIcon icon={faUserCircle} className="w-5 h-5 mr-3 text-blue-500" />
                Mon espace
              </a>
              <a 
                href="#" 
                className="flex items-center px-4 py-3 text-base text-gray-700 hover:bg-gradient-to-r from-[#09745f] to-[#07b98e] hover:text-white transition-colors duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                  setDropdownOpen(false);
                }}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 mr-3 text-red-500" />
                Déconnexion
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="hidden space-x-4 lg:flex">
          <CustomButton
            text={"S'inscrire"}
            onClick={() => navigation("/role")}
            width={"w-40"}
            className="h-[40px] rounded-md text-base"
          />
          <CustomButton
            text={"Se connecter"}
            onClick={() => navigation("/login")}
            width={"w-40"}
            className="bg-white border-2 border-primary text-primary rounded-md h-[40px] text-base"
          />
        </div>
      )}
    </header>
  );
};

export default Header;