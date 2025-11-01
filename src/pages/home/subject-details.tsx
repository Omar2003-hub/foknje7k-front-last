import React, { useEffect, useRef, useState, useContext, createContext } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import { Pdf } from "../../assets/svg";
import { getSubjectServiceById } from "../../services/subject-service";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { SnackbarContext } from "../../config/hooks/use-toast";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Snackbar,
  Alert,
  Drawer
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { 
  deletePlaylistService, 
  createPlayListService,
  updatePlayListService,
  deleteItemPlaylistService
} from "../../services/playList-service";
import AddIcon from "@mui/icons-material/Add";
import "./subject-detail.css";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
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
  { path: "/files", name: "Fichiers", roles: ["ROLE_ADMIN", "ROLE_SUPER_TEACHER", "ROLE_TEACHER"] },
  { path: "/calender", name: "Calendrier Live", roles: ["ROLE_ADMIN", "ROLE_TEACHER", "ROLE_SUPER_TEACHER", "ROLE_STUDENT"] },
  { path: "/chat", name: "Chat Room", roles: ["ROLE_ADMIN", "ROLE_TEACHER", "ROLE_SUPER_TEACHER", "ROLE_STUDENT"] },
  { path: "/requests-prof", name: "Demandes des Professeurs", roles: ["ROLE_ADMIN"] },
  { path: "/requests-student", name: "Demandes des Étudiants", roles: ["ROLE_ADMIN"] },
  { path: "/stats", name: "Statistiques", roles: ["ROLE_ADMIN"] },
];

interface Video {
  id: number;
  title: string;
  url: string;
  isCompleted: boolean;
}

interface Resource {
  id: number;
  title: string;
  url: string;
  isCompleted: boolean;
}

interface Playlist {
  id: number;
  title: string;
  description: string;
  videos: Video[];
  qcms: Resource[];
  fiches: Resource[];
  exercices: Resource[];
  corrections: Resource[];
  [key: string]: any;
}

interface SubjectData {
  playLists: Playlist[];
}

interface SnackbarContextType {
  showToast?: (message: string, severity: "success" | "error") => void;
  showSnackbar?: (message: string, severity: "success" | "error") => void;
}

const SubjectDetails = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  
  // Récupération du rôle utilisateur
  const role = useSelector((state: RootState) => state?.user?.userData?.role?.name);
  const isAdmin = role === "ROLE_ADMIN";
  const canManageChapters = role === "ROLE_ADMIN" || role === "ROLE_SUPER_TEACHER" || role === "ROLE_TEACHER";

  const [subjectData, setSubjectData] = useState<SubjectData | null>(null);
  const [activeStatus, setActiveStatus] = useState<string>("videos");
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteFileDialog, setOpenDeleteFileDialog] = useState(false);
  
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);
  const [playlistToEdit, setPlaylistToEdit] = useState<Playlist | null>(null);
  const [fileToDelete, setFileToDelete] = useState<{
    id: number;
    type: string;
    playlistId: number;
  } | null>(null);
  
  const [localSnackbar, setLocalSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error"
  });
  
  const [newPlaylist, setNewPlaylist] = useState({
    title: "",
    description: "",
  });
  
  const [editPlaylist, setEditPlaylist] = useState({
    title: "",
    description: "",
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const snackbarContext = useContext(SnackbarContext) as SnackbarContextType;

  // États pour le sidebar
  const [expanded, setExpanded] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const showToast = React.useCallback((message: string, severity: "success" | "error") => {
    if (snackbarContext?.showToast) {
      snackbarContext.showToast(message, severity);
    } else if (snackbarContext?.showSnackbar) {
      snackbarContext.showSnackbar(message, severity);
    } else {
      setLocalSnackbar({ open: true, message, severity });
    }
  }, [snackbarContext]);

  const fileTypeMapping: Record<string, string> = {
    Video: "videos",
    Fiche: "fiches",
    Exercice: "exercices",
    Correction: "corrections",
    QCM: "qcms"
  };

  const statusToTypeMap: Record<string, string> = {
    videos: 'Video',
    qcms: 'QCM',
    fiches: 'Fiche',
    exercices: 'Exercice',
    corrections: 'Correction'
  };

  const fetchSubjectData = React.useCallback(() => {
    getSubjectServiceById(Number(id))
      .then((res) => {
        const data = res.data;
        setSubjectData(data);
        if (data.playLists.length > 0) {
          const firstPlaylist = data.playLists[0];
          setActivePlaylist(firstPlaylist);
          if (firstPlaylist.videos?.length > 0) {
            setVideoUrl(firstPlaylist.videos[0].url);
          }
        }
      })
      .catch((error) => {
        console.error("Failed to fetch subject:", error);
        showToast("Erreur lors du chargement du sujet", "error");
      });
  }, [id, showToast]);

  useEffect(() => {
    if (id) {
      fetchSubjectData();
    }
  }, [id, fetchSubjectData]);

  const handleVideoClick = (url: string) => {
    setVideoUrl(url);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  // Function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Function to check if URL is a YouTube URL
  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  useEffect(() => {
    if (videoRef.current && !isYouTubeUrl(videoUrl)) {
      videoRef.current.src = videoUrl;
      videoRef.current.setAttribute("controlslist", "nodownload");
    }
  }, [videoUrl]);

  const handleStatusClick = (statusName: string) => {
    setActiveStatus(statusName);
  };

  const handlePlaylistClick = (playlist: Playlist) => {
    setActivePlaylist(playlist);
    setActiveStatus("videos");
    if (playlist.videos?.length > 0) {
      setVideoUrl(playlist.videos[0].url);
    }
  };

  const handleDeleteClick = (playlist: Playlist) => {
    setPlaylistToDelete(playlist);
    setOpenDeleteDialog(true);
  };

  const handleDeleteClose = () => {
    setOpenDeleteDialog(false);
    setPlaylistToDelete(null);
  };

  const handleCreateOpen = () => setOpenCreateDialog(true);
  const handleCreateClose = () => {
    setOpenCreateDialog(false);
    setNewPlaylist({ title: "", description: "" });
  };

  const handleEditClick = (playlist: Playlist) => {
    setPlaylistToEdit(playlist);
    setEditPlaylist({
      title: playlist.title,
      description: playlist.description || ""
    });
    setOpenEditDialog(true);
  };

  const handleEditClose = () => {
    setOpenEditDialog(false);
    setPlaylistToEdit(null);
    setEditPlaylist({ title: "", description: "" });
  };

  const handleDeleteFileClick = (fileId: number, fileType: string) => {
    if (!activePlaylist) return;
    
    setFileToDelete({
      id: fileId,
      type: fileType,
      playlistId: activePlaylist.id
    });
    setOpenDeleteFileDialog(true);
  };

  const handleDeleteFileClose = () => {
    setOpenDeleteFileDialog(false);
    setFileToDelete(null);
  };

  const handleDeletePlaylist = () => {
    if (!playlistToDelete || !subjectData) return;

    deletePlaylistService(playlistToDelete.id)
      .then(() => {
        const updatedPlaylists = subjectData.playLists.filter(
          pl => pl.id !== playlistToDelete.id
        );
        
        setSubjectData({
          ...subjectData,
          playLists: updatedPlaylists
        });
        
        if (activePlaylist?.id === playlistToDelete.id) {
          const newActivePlaylist = updatedPlaylists[0] || null;
          setActivePlaylist(newActivePlaylist);
          setVideoUrl(newActivePlaylist?.videos?.[0]?.url || "");
        }
        
        showToast("Chapitre supprimé avec succès", "success");
      })
      .catch((error) => {
        console.error("Failed to delete playlist:", error);
        showToast("Échec de la suppression du chapitre", "error");
      })
      .finally(() => {
        handleDeleteClose();
      });
  };

  const handleCreatePlaylist = () => {
    if (!id) {
      showToast("ID du sujet non disponible", "error");
      return;
    }

    if (!newPlaylist.title.trim()) {
      showToast("Veuillez saisir un titre pour le chapitre", "error");
      return;
    }

    createPlayListService(Number(id), newPlaylist)
      .then(() => {
        fetchSubjectData();
        showToast("Chapitre créé avec succès", "success");
        handleCreateClose();
      })
      .catch((error) => {
        console.error("Failed to create playlist:", error);
        showToast("Échec de la création du chapitre", "error");
      });
  };

  const handleUpdatePlaylist = () => {
    if (!playlistToEdit || !id) {
      showToast("Données de modification invalides", "error");
      return;
    }

    if (!editPlaylist.title.trim()) {
      showToast("Veuillez saisir un titre pour le chapitre", "error");
      return;
    }

    updatePlayListService(playlistToEdit.id, Number(id), {
      title: editPlaylist.title,
      description: editPlaylist.description
    })
      .then(() => {
        fetchSubjectData();
        showToast("Chapitre modifié avec succès", "success");
        
        if (activePlaylist?.id === playlistToEdit.id) {
          setActivePlaylist({
            ...activePlaylist,
            title: editPlaylist.title,
            description: editPlaylist.description
          });
        }
        
        handleEditClose();
      })
      .catch((error) => {
        console.error("Failed to update playlist:", error);
        showToast("Échec de la modification du chapitre", "error");
      });
  };

  const handleDeleteFile = () => {
    if (!fileToDelete || !subjectData) return;

    deleteItemPlaylistService(fileToDelete.playlistId, fileToDelete.id)
      .then(() => {
        const updatedPlaylists = subjectData.playLists.map(playlist => {
          if (playlist.id === fileToDelete.playlistId) {
            const resourceType = fileTypeMapping[fileToDelete.type];
            return {
              ...playlist,
              [resourceType]: playlist[resourceType].filter(
                (item: any) => item.id !== fileToDelete.id
              )
            };
          }
          return playlist;
        });

        setSubjectData({
          ...subjectData,
          playLists: updatedPlaylists
        });

        if (activePlaylist && activePlaylist.id === fileToDelete.playlistId) {
          const updatedActivePlaylist = updatedPlaylists.find(
            pl => pl.id === activePlaylist.id
          );
          if (updatedActivePlaylist) {
            setActivePlaylist(updatedActivePlaylist);
          }
        }

        showToast("Fichier supprimé avec succès", "success");
      })
      .catch(error => {
        console.error("Failed to delete file:", error);
        showToast("Échec de la suppression du fichier", "error");
      })
      .finally(() => {
        handleDeleteFileClose();
      });
  };

  const getFilteredResources = () => {
    if (!activePlaylist) return [];

    switch (activeStatus) {
      case "videos": return activePlaylist.videos || [];
      case "qcms": return activePlaylist.qcms || [];
      case "fiches": return activePlaylist.fiches || [];
      case "exercices": return activePlaylist.exercices || [];
      case "corrections": return activePlaylist.corrections || [];
      default: return [];
    }
  };

  const statuses = ["videos", "qcms", "fiches", "exercices", "corrections"];
  const filteredResources = getFilteredResources();

  const preventContextMenu = (event: React.MouseEvent<HTMLVideoElement>) => {
    event.preventDefault();
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
        <div className="flex flex-col items-center px-4 pb-20 md:px-12">
          <div className="w-full md:w-11/12 flex flex-col md:flex-row justify-between bg-purple_bg px-4 md:px-10 py-5 h-[78vh] rounded-3xl mb-5">
            <div className="w-full h-full p-5 md:w-9/12">
              <div className="relative w-full h-full overflow-hidden bg-black">
                {videoUrl && isYouTubeUrl(videoUrl) ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(videoUrl)}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    key={videoUrl}
                    ref={videoRef}
                    className="object-cover w-full h-full"
                    controls
                    controlsList="nodownload"
                    onContextMenu={preventContextMenu}
                    playsInline
                    preload="auto"
                  >
                    <source src={videoUrl} />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
              <p className="mt-3 text-xl text-title md:text-2xl font-montserrat_semi_bold">
                {activePlaylist?.title || "Video title"}
              </p>
              
            </div>

            <div className="w-full p-4 md:w-1/4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl md:text-2xl text-title font-montserrat_semi_bold">
                  Les Chapitres
                </h2>
                
                {/* Bouton Ajouter chapitre (pour admin, super teacher et teacher) */}
                {canManageChapters && (
                  <button
                    onClick={handleCreateOpen}
                    className="p-2 text-white transition-colors rounded-full bg-purple hover:bg-purple-700"
                    aria-label="Ajouter un chapitre"
                  >
                    <AddIcon />
                  </button>
                )}
              </div>
              <ul className="overflow-y-auto h-[65vh] hide-scrollbar">
                {subjectData?.playLists.map((playlist) => (
                  <li
                    key={playlist.id}
                    className={`bg-white rounded-xl mb-1 px-2 py-3 list-none cursor-pointer ${
                      playlist.id === activePlaylist?.id ? "bg-purple text-primary" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex-grow text-lg font-montserrat_semi_bold"
                        onClick={() => handlePlaylistClick(playlist)}
                      >
                        {playlist.title}
                      </div>
                      
                      {/* Boutons Modifier/Supprimer (pour admin, super teacher et teacher) */}
                      {canManageChapters && (
                        <div className="flex space-x-1">
                          <button
                            className="relative bg-[#3e38db] text-white px-3 py-1 rounded-full text-sm
                                      transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                                      hover:scale-[1.03] hover:shadow-lg hover:bg-blue-600
                                      active:scale-95 active:shadow-md
                                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                                      group"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(playlist);
                            }}
                            aria-label="Modifier"
                          >
                            <FontAwesomeIcon 
                              icon={faEdit} 
                              className="text-red-500 transition-colors duration-200 group-hover:text-red-300"
                            />
                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 
                                          group-hover:opacity-100 transition-opacity duration-200
                                          text-xs text-blue-500 text-[#3e38db] font-medium whitespace-nowrap">
                              Modifier
                            </span>
                          </button>
                          <button
                            className="relative bg-red  px-3 py-1 rounded-full text-sm
                                      transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                                      hover:scale-[1.03] hover:shadow-lg hover:bg-red-700
                                      active:scale-95 active:shadow-md
                                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
                                      group"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(playlist);
                            }}
                            aria-label="Supprimer"
                          >
                            <FontAwesomeIcon 
                              icon={faTrash} 
                              className="text-white transition-colors duration-200 group-hover:text-red-100"
                            />
                            <span className="absolute text-xs font-medium transition-opacity duration-200 -translate-x-1/2 opacity-0 -bottom-6 left-1/2 group-hover:opacity-100 text-red whitespace-nowrap">
                              Supprimer
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center w-full p-4 md:w-11/12 bg-purple_bg md:p-10 rounded-xl">
            <div className="flex flex-wrap items-center justify-between w-full mb-4">
              <div className="flex">
                {statuses.map((status) => (
                  <div
                    key={status}
                    className={`capitalize font-montserrat_semi_bold text-lg px-4 py-2 cursor-pointer ${
                      status === activeStatus ? "text-white bg-purple rounded-lg" : "text-title"
                    }`}
                    onClick={() => handleStatusClick(status)}
                  >
                    {status}
                  </div>
                ))}
              </div>
              
              {/* Bouton Ajouter un fichier (pour admin, super teacher et teacher) */}
              {canManageChapters && activePlaylist && (
                <a
                  href={`https://foknje7ek.com/dashboard/files?subjectId=${id}&playlistId=${activePlaylist.id}&type=${statusToTypeMap[activeStatus]}`}
                  className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-purple hover:bg-purple-700"
                >
                  <InsertDriveFileIcon sx={{ fontSize: 20 }} />
                  <span>Ajouter un fichier</span>
                </a>
              )}
            </div>

            <div className="w-full pt-10">
              {filteredResources.length > 0 ? (
                <ul className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
                  {filteredResources
                    .filter((item) => item.isCompleted === true)
                    .sort((a, b) => a.id - b.id)
                    .map((item) =>
                      activeStatus !== "videos" ? (
                        <li key={item.id} className="flex items-center justify-between mb-2 list-none">
                          <a
                            href={item.url}
                            className="flex items-center text-title hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img alt="pdf" src={Pdf} className="w-8 h-8 mr-2" />
                            <p className="text-lg text-title font-montserrat_semi_bold">
                              {item.title}
                            </p>
                          </a>
                          
                          {/* Bouton Supprimer fichier (pour admin, super teacher et teacher) */}
                          {canManageChapters && (
                            <button
                              onClick={() => handleDeleteFileClick(
                                item.id, 
                                statusToTypeMap[activeStatus]
                              )}
                              className="ml-4 text-red hover:text-red-700"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          )}
                        </li>
                      ) : (
                        <li
                          key={item.id}
                          className="flex items-center justify-between list-none"
                        >
                          <div 
                            className="flex items-center cursor-pointer"
                            onClick={() => handleVideoClick(item.url)}
                          >
                            <OndemandVideoIcon className="text-3xl text-purple" fontSize="large" />
                            <p className="text-lg ms-4 text-title font-montserrat_semi_bold">
                              {item.title}
                            </p>
                          </div>
                          
                          {/* Bouton Supprimer vidéo (pour admin, super teacher et teacher) */}
                          {canManageChapters && (
                            <button
                              onClick={() => handleDeleteFileClick(
                                item.id, 
                                statusToTypeMap[activeStatus]
                              )}
                              className="ml-4 text-red hover:text-red-700"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          )}
                        </li>
                      )
                    )}
                </ul>
              ) : (
                <p className="py-10 text-center text-gray-500">Aucune ressource disponible pour cette section.</p>
              )}
            </div>
          </div>

          {/* Dialog pour supprimer un chapitre */}
          <Dialog open={openDeleteDialog} onClose={handleDeleteClose} fullWidth maxWidth="sm">
            <Box className="p-6">
              <DialogTitle className="flex items-center justify-between">
                <p className="text-2xl text-title font-montserrat_bold ">
                  Supprimer Chapitre
                </p>
                <IconButton onClick={handleDeleteClose}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent className="space-y-6">
                <p>Êtes-vous sûr de vouloir supprimer ce chapitre et tous ses contenus ?</p>
                <div className="flex justify-end mt-6 space-x-4">
                  <Button
                    className="text-gray-600 border border-gray-400 w-44 rounded-2xl hover:bg-gray-50"
                    variant="outlined"
                    onClick={handleDeleteClose}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="text-white w-44 rounded-2xl bg-red hover:bg-red-700"
                    variant="contained"
                    onClick={handleDeletePlaylist}
                  >
                    Supprimer
                  </Button>
                </div>
              </DialogContent>
            </Box>
          </Dialog>

          {/* Dialog pour créer un nouveau chapitre */}
          <Dialog open={openCreateDialog} onClose={handleCreateClose} fullWidth maxWidth="sm">
            <Box className="p-6">
              <DialogTitle className="flex items-center justify-between">
                <p className="text-2xl text-title font-montserrat_bold">
                  Créer un nouveau chapitre
                </p>
                <IconButton onClick={handleCreateClose}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent className="space-y-6">
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block mb-2 font-medium text-title">Titre du chapitre *</label>
                    <input
                      type="text"
                      placeholder="Ex: Introduction à la programmation"
                      value={newPlaylist.title}
                      onChange={(e) => setNewPlaylist({...newPlaylist, title: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-title">Description</label>
                    <textarea
                      placeholder="Ex: Ce chapitre couvre les bases de la programmation..."
                      value={newPlaylist.description}
                      onChange={(e) => setNewPlaylist({...newPlaylist, description: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-6 space-x-4">
                  <Button
                    className="text-gray-600 border border-gray-400 w-44 rounded-2xl hover:bg-gray-50"
                    variant="outlined"
                    onClick={handleCreateClose}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="text-white w-44 rounded-2xl bg-purple hover:bg-purple-700"
                    variant="contained"
                    onClick={handleCreatePlaylist}
                  >
                    Créer
                  </Button>
                </div>
              </DialogContent>
            </Box>
          </Dialog>

          {/* Dialog pour modifier un chapitre */}
          <Dialog open={openEditDialog} onClose={handleEditClose} fullWidth maxWidth="sm">
            <Box className="p-6">
              <DialogTitle className="flex items-center justify-between">
                <p className="text-2xl text-title font-montserrat_bold">
                  Modifier le chapitre
                </p>
                <IconButton onClick={handleEditClose}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent className="space-y-6">
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block mb-2 font-medium text-title">Titre du chapitre *</label>
                    <input
                      type="text"
                      placeholder="Ex: Introduction à la programmation"
                      value={editPlaylist.title}
                      onChange={(e) => setEditPlaylist({...editPlaylist, title: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-title">Description</label>
                    <textarea
                      placeholder="Ex: Ce chapitre couvre les bases de la programmation..."
                      value={editPlaylist.description}
                      onChange={(e) => setEditPlaylist({...editPlaylist, description: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-6 space-x-4">
                  <Button
                    className="text-gray-600 border border-gray-400 w-44 rounded-2xl hover:bg-gray-50"
                    variant="outlined"
                    onClick={handleEditClose}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="text-white bg-blue-500 w-44 rounded-2xl hover:bg-blue-600"
                    variant="contained"
                    onClick={handleUpdatePlaylist}
                  >
                    Enregistrer
                  </Button>
                </div>
              </DialogContent>
            </Box>
          </Dialog>

          {/* Dialog pour supprimer un fichier */}
          <Dialog open={openDeleteFileDialog} onClose={handleDeleteFileClose} fullWidth maxWidth="sm">
            <Box className="p-6">
              <DialogTitle className="flex items-center justify-between">
                <p className="text-2xl text-title font-montserrat_bold">
                  Supprimer Fichier
                </p>
                <IconButton onClick={handleDeleteFileClose}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent className="space-y-6">
                <p>Êtes-vous sûr de vouloir supprimer ce fichier ? Cette action est irréversible.</p>
                <div className="flex justify-end mt-6 space-x-4">
                  <Button
                    className="text-gray-600 border border-gray-400 w-44 rounded-2xl hover:bg-gray-50"
                    variant="outlined"
                    onClick={handleDeleteFileClose}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="text-white w-44 rounded-2xl bg-red hover:bg-red-700"
                    variant="contained"
                    onClick={handleDeleteFile}
                  >
                    Supprimer
                  </Button>
                </div>
              </DialogContent>
            </Box>
          </Dialog>

          <Snackbar
            open={localSnackbar.open}
            autoHideDuration={6000}
            onClose={() => setLocalSnackbar({...localSnackbar, open: false})}
          >
            <Alert 
              onClose={() => setLocalSnackbar({...localSnackbar, open: false})}
              severity={localSnackbar.severity}
              sx={{ width: '100%' }}
            >
              {localSnackbar.message}
            </Alert>
          </Snackbar>
        </div>
      </main>
    </div>
  );
};

export default SubjectDetails;