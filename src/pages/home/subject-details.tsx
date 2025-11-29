import React, { useEffect, useRef, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import { Pdf } from "../../assets/svg";
import { getSubjectServiceById } from "../../services/subject-service";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faBookOpen } from '@fortawesome/free-solid-svg-icons';
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
  Alert
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
import DashboardLayout from "../../shared/layout/DashboardLayout";

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

  const buildStreamUrl = (url: string) => {
    if (!url || isYouTubeUrl(url)) return url;
    try {
      const parsed = new URL(url, window.location.origin);
      const pathname = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
      const fileName = pathname || parsed.pathname;
      const baseApi = "http://localhost:8081";
      return `${baseApi}/api/v1/local-storage/stream-video?fileName=${encodeURIComponent(fileName)}`;
    } catch {
      const sanitized = url.replace(/^\/+/, "");
      const baseApi = "http://localhost:8081";
      return `${baseApi}/api/v1/local-storage/stream-video?fileName=${encodeURIComponent(sanitized)}`;
    }
  };

  useEffect(() => {
    if (videoRef.current && !isYouTubeUrl(videoUrl)) {
      videoRef.current.src = buildStreamUrl(videoUrl);
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

  // Apply custom styles
  useEffect(() => {
    const customScrollbarStyle = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #09745f, #07b98e);
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #07b98e, #09745f);
      }
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = customScrollbarStyle;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center px-4 pb-20 space-y-6 md:px-12">
        <div className="flex flex-col w-full gap-6 max-w-7xl lg:flex-row">
          {/* Video Player Section */}
          <div className="flex-1 overflow-hidden bg-white shadow-xl rounded-2xl">
            <div className="relative overflow-hidden aspect-video bg-gradient-to-br from-gray-900 to-gray-800">
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
              {!videoUrl && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <OndemandVideoIcon sx={{ fontSize: 80 }} className="mb-4" />
                    <p className="text-lg font-medium">Sélectionnez une vidéo pour commencer</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Video Title */}
            <div className="p-6">
              <h1 className="mb-2 text-2xl font-bold text-gray-800 md:text-3xl">
                {activePlaylist?.title || "Sélectionnez un chapitre"}
              </h1>
              {activePlaylist?.description && (
                <p className="leading-relaxed text-gray-600">
                  {activePlaylist.description}
                </p>
              )}
            </div>
          </div>

          {/* Chapters Sidebar */}
          <div className="overflow-hidden bg-white shadow-xl lg:w-80 rounded-2xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center text-xl font-bold text-gray-800">
                  <FontAwesomeIcon icon={faBookOpen} className="mr-3 text-[#09745f]" />
                  Chapitres
                </h2>
                
                {canManageChapters && (
                  <button
                    onClick={handleCreateOpen}
                    className="p-2 bg-gradient-to-r from-[#09745f] to-[#07b98e] text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    aria-label="Ajouter un chapitre"
                  >
                    <AddIcon sx={{ fontSize: 20 }} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              {subjectData?.playLists.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <FontAwesomeIcon icon={faBookOpen} className="mb-3 text-4xl" />
                  <p>Aucun chapitre disponible</p>
                </div>
              ) : (
                <div className="p-2">
                  {subjectData?.playLists.map((playlist, index) => (
                    <div
                      key={playlist.id}
                      className={`group relative mb-2 rounded-xl transition-all duration-300 cursor-pointer ${
                        playlist.id === activePlaylist?.id 
                          ? "bg-gradient-to-r from-[#09745f] to-[#07b98e] text-white shadow-lg" 
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <div 
                        className="p-4"
                        onClick={() => handlePlaylistClick(playlist)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-1">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full mr-2 ${
                                playlist.id === activePlaylist?.id 
                                  ? "bg-white/20 text-white" 
                                  : "bg-[#09745f] text-white"
                              }`}>
                                {index + 1}
                              </span>
                              <h3 className={`font-semibold truncate ${
                                playlist.id === activePlaylist?.id ? "text-white" : "text-gray-800"
                              }`}>
                                {playlist.title}
                              </h3>
                            </div>
                            
                            {/* Video count */}
                            <div className={`flex items-center text-sm ${
                              playlist.id === activePlaylist?.id ? "text-white/80" : "text-gray-500"
                            }`}>
                              <OndemandVideoIcon sx={{ fontSize: 16 }} className="mr-1" />
                              <span>{playlist.videos?.length || 0} vidéos</span>
                            </div>
                          </div>
                          
                          {canManageChapters && (
                            <div className={`flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                              playlist.id === activePlaylist?.id ? "opacity-100" : ""
                            }`}>
                              <button
                                className="p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(playlist);
                                }}
                                aria-label="Modifier"
                              >
                                <FontAwesomeIcon icon={faEdit} className="text-xs" />
                              </button>
                              <button
                                className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(playlist);
                                }}
                                aria-label="Supprimer"
                              >
                                <FontAwesomeIcon icon={faTrash} className="text-xs" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resources Section */}
        <div className="w-full overflow-hidden bg-white shadow-xl max-w-7xl rounded-2xl">
          <div className="border-b border-gray-100">
            <div className="flex flex-wrap items-center justify-between p-6">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => {
                  const isActive = status === activeStatus;
                  return (
                    <button
                      key={status}
                      className={`px-4 py-2 rounded-xl font-medium capitalize transition-all duration-200 ${
                        isActive 
                          ? "bg-gradient-to-r from-[#09745f] to-[#07b98e] text-white shadow-lg" 
                          : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      }`}
                      onClick={() => handleStatusClick(status)}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
              
              {/* Add File Button */}
              {canManageChapters && activePlaylist && (
                <a
                  href={`https://foknje7ek.com/dashboard/files?subjectId=${id}&playlistId=${activePlaylist.id}&type=${statusToTypeMap[activeStatus]}`}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#09745f] to-[#07b98e] text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <InsertDriveFileIcon sx={{ fontSize: 20 }} />
                  <span>Ajouter un fichier</span>
                </a>
              )}
            </div>
          </div>

          <div className="p-6">
            {!activePlaylist ? (
              <div className="py-12 text-center">
                <FontAwesomeIcon icon={faBookOpen} className="mb-4 text-6xl text-gray-300" />
                <p className="mb-2 text-xl text-gray-500">Aucun chapitre sélectionné</p>
                <p className="text-gray-400">Sélectionnez un chapitre pour voir les ressources</p>
              </div>
            ) : filteredResources.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredResources
                  .sort((a, b) => a.id - b.id)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="relative p-4 transition-all duration-300 border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-lg"
                    >
                      {canManageChapters && (
                        <button
                          onClick={() => handleDeleteFileClick(
                            item.id,
                            statusToTypeMap[activeStatus]
                          )}
                          className="absolute z-20 flex items-center justify-center rounded-full shadow top-2 right-2 w-7 h-7 hover:opacity-80"
                          aria-label="Supprimer"
                          style={{lineHeight: 1, padding: 0, border: 'none', background: '#09745f'}}
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-xs text-white" />
                        </button>
                      )}
                      {activeStatus === "videos" ? (
                        <div 
                          className="cursor-pointer"
                          onClick={() => handleVideoClick(item.url)}
                        >
                          <div className="flex items-center mb-3">
                            <div className="p-2 bg-gradient-to-r from-[#09745f] to-[#07b98e] rounded-lg mr-3">
                              <OndemandVideoIcon className="text-white" sx={{ fontSize: 24 }} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 group-hover:text-[#09745f] transition-colors line-clamp-2">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-500">Vidéo</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <div className="flex items-center mb-3">
                            <div className="p-2 mr-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600">
                              <img alt="pdf" src={Pdf} className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 group-hover:text-[#09745f] transition-colors line-clamp-2">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-500 capitalize">{activeStatus}</p>
                            </div>
                          </div>
                        </a>
                      )}
                      
                      {/* Delete Button */}
                      {canManageChapters && (
                        <button
                          onClick={() => handleDeleteFileClick(
                            item.id, 
                            statusToTypeMap[activeStatus]
                          )}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 z-10"
                          aria-label="Supprimer"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                      )}
                      
                      {/* Play overlay for videos */}
                      {activeStatus === "videos" && (
                        <div
                          className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover:opacity-100 bg-black/10 rounded-xl"
                          style={{ pointerEvents: 'none' }}
                        >
                          <div className="p-3 bg-white rounded-full shadow-lg">
                            <OndemandVideoIcon className="text-[#09745f]" sx={{ fontSize: 32 }} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <InsertDriveFileIcon className="mb-4 text-6xl text-gray-300" />
                <p className="mb-2 text-xl text-gray-500">Aucune ressource disponible</p>
                <p className="text-gray-400">Aucun contenu trouvé pour cette section</p>
              </div>
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
    </DashboardLayout>
  );
};

export default SubjectDetails;
