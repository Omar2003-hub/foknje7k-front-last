import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../../shared/custom-button/custom-button";
import AddIcon from "@mui/icons-material/Add";
import WelcomeCard from "../../componet/welcome-card";
import ClassesModal from "../../componet/classModal";
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import DashboardLayout from "../../shared/layout/DashboardLayout";

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



  return (
    <DashboardLayout>
      <div className="flex flex-col items-center space-y-6 px-4 md:px-8">
        <div className="-mt-[40px] w-full">
          <WelcomeCard />
        </div>
             
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full pt-10 mb-10 px-4">
                {profileData.filter(item => item.active === true).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigation(`/subject/${item.id}`)}
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
                          <div className="transition-all duration-200 rounded-full shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white">
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
                            open={Boolean(anchorEl) && currentItem === item}
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
                                handleOpenModal(item);
                                handleCloseMenu();
                              }}
                              className="text-sm font-medium"
                            >
                              Edit
                            </MenuItem>
                            <MenuItem 
                              onClick={(event) => {
                                event.stopPropagation();
                                handleClickAlert(item);
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
                      {/* Title and Level */}
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#09745f] transition-colors duration-200 line-clamp-2">
                          {item.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-[#07b98e] rounded-full"></div>
                          <span className="text-sm font-medium text-gray-600 capitalize">
                            {getEducationLevelLabel(item.educationLevel)}
                          </span>
                        </div>
                      </div>

                      {/* Teacher Name */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-[#09745f] to-[#07b98e] rounded-full flex items-center justify-center">
                            <FontAwesomeIcon icon={faChalkboardTeacher} className="text-xs text-white" />
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
                            navigation(`/subject/${item.id}`);
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
                          Ajouter une nouvelle classe
                        </p>
                      </div>
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
    </DashboardLayout>
  );
};

export default Home;