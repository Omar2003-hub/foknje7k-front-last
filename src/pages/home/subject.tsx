import React, { useContext, useEffect, useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import DashboardLayout from "../../shared/layout/DashboardLayout";


interface SubjectType {
  id: number;
  backgroundImageUrl: string;
  level: string;
  teacherId: string;
  speciality: string;
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

  const handleOpenModal = (profile: SubjectType | null) => {
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
    item: SubjectType,
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



  return (
    <DashboardLayout>
      <div className="flex flex-col items-center px-4 pb-20 md:px-12 space-y-6">




        <div className="-mt-[40px] w-full">
          <WelcomeCard />
        </div>
             
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full my-10 px-4">
                {subjects.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/subject-details?id=${item.id}`)}
                    className="relative w-full overflow-hidden transition-all duration-300 ease-in-out transform bg-white shadow-xl rounded-2xl hover:shadow-2xl hover:scale-105 group cursor-pointer"
                  >
                    {/* Cover Image with Gradient Overlay */}
                    <div className="relative h-40 overflow-hidden rounded-t-2xl">
                      <div
                        className="w-full h-full transition-all duration-300 bg-center bg-cover filter brightness-90 group-hover:brightness-100"
                        style={{ backgroundImage: `url("${item.backgroundImageUrl}")` }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
                      
                      {/* Menu Button */}
                      {(role === "ROLE_ADMIN" || role === "ROLE_SUPER_TEACHER") && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200">
                            <IconButton 
                              onClick={(event) => {
                                event.stopPropagation();
                                handleClickMenu(event, item);
                              }} 
                              className="p-2"
                            >
                              <MoreVertIcon className="text-gray-700" />
                            </IconButton>
                          </div>
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleCloseMenu}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "right",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "right",
                            }}
                            PaperProps={{
                              sx: {
                                borderRadius: '12px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                minWidth: '120px',
                              }
                            }}
                          >
                            <MenuItem
                              onClick={(event) => {
                                event.stopPropagation();
                                handleOpenModal(currentItem);
                              }}
                              className="text-sm font-medium"
                            >
                              Edit
                            </MenuItem>
                            <MenuItem 
                              onClick={(event) => {
                                event.stopPropagation();
                                handleClickAlert();
                              }}
                              className="text-sm font-medium text-red-600"
                            >
                              Delete
                            </MenuItem>
                          </Menu>
                        </div>
                      )}
                    </div>
                    {/* Content Section */}
                    <div className="p-6 space-y-4">
                      {/* Subject and Level */}
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#09745f] transition-colors duration-200 line-clamp-2">
                          {item.speciality}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-[#07b98e] rounded-full"></div>
                          <span className="text-sm font-medium text-gray-600 capitalize">
                            {item.level}
                          </span>
                        </div>
                      </div>

                      {/* Teacher Name */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-[#09745f] to-[#07b98e] rounded-full flex items-center justify-center">
                            <FontAwesomeIcon icon={faChalkboardTeacher} className="text-white text-xs" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 truncate">
                            {item.superTeacherFullName}
                          </span>
                        </div>
                      </div>

                      {/* Join Button */}
                      <div className="pt-2">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/subject-details?id=${item.id}`);
                          }}
                          className="w-full bg-gradient-to-r from-[#09745f] via-[#048c6b] to-[#07b98e] hover:from-[#07b98e] hover:to-[#09745f] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-center cursor-pointer"
                        >
                          Rejoindre
                        </div>
                      </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-[#07b98e]/10 to-[#09745f]/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-300"></div>
                  </div>
                ))}
                {(role === "ROLE_ADMIN" || role === "ROLE_SUPER_TEACHER") && (
                  <div className="flex items-center justify-center">
                    <div
                      onClick={() => handleOpenModal(null)}
                      className="flex items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-[#09745f] transition-all duration-300 group"
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 bg-gradient-to-r from-[#09745f] to-[#07b98e] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <AddIcon className="text-white" style={{ fontSize: 32 }} />
                        </div>
                        <p className="text-gray-600 font-medium group-hover:text-[#09745f] transition-colors duration-300">
                          Ajouter une nouvelle matière
                        </p>
                      </div>
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
    </DashboardLayout>
  );
};

export default Subject;