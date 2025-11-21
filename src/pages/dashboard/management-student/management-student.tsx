import React, { useContext, useEffect, useState } from "react";
import CustomTable from "../../../shared/custom-table/custom-table";
import { columnsProf, columnsStudent } from "../../../mocks/fakeData";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
} from "@mui/material";
import {
  getAllStudentFromSuperTeacher,
  getAllUserByRole,
} from "../../../services/super-teacher";
import {
  addStudentGroupService,
  RemoveStudentGroupService,
  getUserGroupService,
} from "../../../services/group-service";
import {
  addSubjectToStudentService,
  removeSubjectFromStudentService,
  getAllUserSubjectService,
  addBulkSubjectsToStudentService, // <-- import bulk API
} from "../../../services/subject-service";
import CustomButton from "../../../shared/custom-button/custom-button";
import CloseIcon from "@mui/icons-material/Close";
import { RootState } from "../../../redux/store/store";
import { useSelector } from "react-redux";
import { SnackbarContext } from "../../../config/hooks/use-toast";
import CustomAutocomplete from "../../../shared/custom-autoComplete/custom-autocomplete";

const ManagementStudent = () => {
  const id = useSelector((state: RootState) => state?.user?.userData?.id);
  const [data, setData] = useState<any>([]);
  const [groupOptions, setGroupOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [subjectOptions, setSubjectOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [student, setStudent] = useState<any>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>("");
  const [selectedGroup, setSelectedGroup] = useState<number>(0);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAddSubjectDialog, setOpenAddSubjectDialog] = useState(false);
  const [openDeleteSubjectDialog, setOpenDeleteSubjectDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [deleteGroup, setDeleteGroup] = useState<number | null>(null);
  const [deleteSubject, setDeleteSubject] = useState<number | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]); // for bulk add
  const snackbarContext = useContext(SnackbarContext);

  useEffect(() => {
    getAllStudentFromSuperTeacher()
      .then((res) => {
        setData(res.data);
      })
      .catch((e) => {
        console.log(e);
      });
    getAllUserByRole("ROLE_STUDENT")
      .then((res) => {
        const teacherOptions = res.data.map((student: any) => ({
          label: student.fullName,
          value: student.id,
        }));
        setStudent(teacherOptions);
      })
      .catch((e) => {
        console.log(e);
      });
    getUserGroupService()
      .then((res) => {
        const groupOptions = res.data.map((group: any) => ({
          label: group.title,
          value: group.id,
        }));
        setGroupOptions(groupOptions);
      })
      .catch((e) => {
        console.log(e);
      });
    getAllUserSubjectService()
      .then((res) => {
        console.log('Subjects API response:', res.data); // Debugging log
        const subjectOptions = Array.isArray(res.data)
          ? res.data.map((subject: any) => ({
              label: subject.speciality, // Updated to use 'speciality' for label
              value: subject.id, // 'id' remains the value
            }))
          : [];
        console.log('Mapped subject options:', subjectOptions); // Debugging log
        setSubjectOptions(subjectOptions);
      })
      .catch((e) => {
        console.error('Error fetching subjects:', e); // Debugging log
      });
  }, []);

  const handleAddClick = () => setOpenAddDialog(true);
  const handleAddClose = () => setOpenAddDialog(false);
  const handleDeleteClick = (row: any) => {
    setSelectedRow(row);
    setOpenDeleteDialog(true);
  };
  const handleDeleteClose = () => setOpenDeleteDialog(false);

  const handleAddSubjectClick = (row: any) => {
    setSelectedRow(row);
    setOpenAddSubjectDialog(true);
    setSelectedSubjects([]); // reset selection
  };
  const handleAddSubjectClose = () => {
    setOpenAddSubjectDialog(false);
    setSelectedSubject("");
  };

  const handleDeleteSubjectClick = (row: any) => {
    setSelectedRow(row);
    setOpenDeleteSubjectDialog(true);
  };
  const handleDeleteSubjectClose = () => {
    setOpenDeleteSubjectDialog(false);
    setDeleteSubject(null);
  };

  const handleSave = () => {
    addStudentGroupService(selectedGroup, selectedStudent)
      .then((res) => {
        getAllStudentFromSuperTeacher()
          .then((res) => {
            setData(res.data);
          })
          .catch((e) => {
            console.log(e);
          });
        if (snackbarContext) {
          snackbarContext.showMessage(
            "Succes",
            "Elève ajouter avec succée",
            "success",
          );
        }
        handleAddClose();
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const handleDelete = () => {
    if (selectedRow && deleteGroup) {
      RemoveStudentGroupService(deleteGroup, selectedRow.id)
        .then(() => {
          getAllStudentFromSuperTeacher()
            .then((res) => {
              setData(res.data);
            })
            .catch((e) => {
              console.log(e);
            });
          if (snackbarContext) {
            snackbarContext.showMessage(
              "Succes",
              "Élève est supprimé avec succée",
              "success",
            );
          }
          handleDeleteClose();
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  const handleSaveSubject = () => {
    if (selectedRow && selectedSubject) {
      addSubjectToStudentService(selectedRow.id, Number(selectedSubject))
        .then(() => {
          getAllStudentFromSuperTeacher()
            .then((res) => {
              setData(res.data);
            })
            .catch((e) => {
              console.log(e);
            });
          if (snackbarContext) {
            snackbarContext.showMessage(
              "Succes",
              "Matière ajoutée avec succès",
              "success",
            );
          }
          handleAddSubjectClose();
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  const handleSaveSubjectsBulk = async () => {
    if (selectedRow && selectedSubjects.length > 0) {
      await addBulkSubjectsToStudentService(selectedRow.id, selectedSubjects);
      getAllStudentFromSuperTeacher()
        .then((res) => {
          setData(res.data);
        })
        .catch((e) => {
          console.log(e);
        });
      if (snackbarContext) {
        snackbarContext.showMessage(
          "Succes",
          "Matières ajoutées avec succès",
          "success",
        );
      }
      handleAddSubjectClose();
    }
  };

  const handleDeleteSubject = () => {
    if (selectedRow && deleteSubject) {
      removeSubjectFromStudentService(selectedRow.id, deleteSubject)
        .then(() => {
          getAllStudentFromSuperTeacher()
            .then((res) => {
              setData(res.data);
            })
            .catch((e) => {
              console.log(e);
            });
          if (snackbarContext) {
            snackbarContext.showMessage(
              "Succes",
              "Matière supprimée avec succès",
              "success",
            );
          }
          handleDeleteSubjectClose();
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  const handleDeleteSubjectSingle = async (subjectId: number) => {
    if (selectedRow && subjectId) {
      await removeSubjectFromStudentService(selectedRow.id, subjectId);
      getAllStudentFromSuperTeacher()
        .then((res) => {
          setData(res.data);
        })
        .catch((e) => {
          console.log(e);
        });
      if (snackbarContext) {
        snackbarContext.showMessage(
          "Succes",
          "Matière supprimée avec succès",
          "success",
        );
      }
    }
  };

  const ActionButtons: React.FC<{ row: any }> = ({ row }) => (
    <div className="flex flex-wrap items-center justify-center gap-2 min-w-fit">
      <button
        style={{ background: '#22c55e', color: '#fff', border: '2px solid #16a34a', fontWeight: 'bold', borderRadius: '9999px', boxShadow: '0 2px 8px rgba(34,197,94,0.2)' }}
        className="px-4 py-2 text-sm whitespace-nowrap"
        onClick={() => handleAddSubjectClick(row)}
      >
        + Matière
      </button>
      <button
        style={{ background: '#ef4444', color: '#fff', border: '2px solid #b91c1c', fontWeight: 'bold', borderRadius: '9999px', boxShadow: '0 2px 8px rgba(239,68,68,0.2)' }}
        className="px-4 py-2 text-sm whitespace-nowrap"
        onClick={() => handleDeleteSubjectClick(row)}
      >
        - Matière
      </button>
      <button
        style={{ background: '#dc2626', color: '#fff', border: '2px solid #991b1b', fontWeight: 'bold', borderRadius: '9999px', boxShadow: '0 2px 8px rgba(220,38,38,0.2)' }}
        className="px-4 py-2 text-sm whitespace-nowrap"
        onClick={() => handleDeleteClick(row)}
      >
        Supprimer
      </button>
    </div>
  );
  const ActionStatus: React.FC<{ row: any }> = ({ row }) => (
    <div className="flex items-center justify-center space-x-2">
      <div>
        {row?.groups
          ?.filter((item: any) => item.superTeacherId === id)
          .map((group: any) => group.title)
          .join(" ,  ")}
      </div>
    </div>
  );

  const renderActions = (row: any) => <ActionButtons row={row} />;
  const renderStatus = (row: any) => <ActionStatus row={row} />;

  return (
    <div className="w-full p-1 lg:p-10">
      <div className="flex flex-col items-start justify-between w-full mb-5 space-y-4 md:flex-row md:items-center md:space-y-0">
        <h1 className="text-2xl text-title font-montserrat_bold md:text-3xl">
          Gestion éleves
        </h1>
        <CustomButton text={"Ajouter éleves"} onClick={handleAddClick} />
      </div>

      <CustomTable
        title="Gérer éleves"
        columns={columnsStudent}
        //@ts-ignore
        data={[...new Map(data.map((item) => [item.id, item])).values()]}
        actions={renderActions}
        status={renderStatus}
        statusName={"Groups"}
      />

      {/* Add Student Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleAddClose}
        fullWidth
        maxWidth="md"
      >
        <Box className="p-6">
          <DialogTitle className="flex items-center justify-between">
            <p className="text-2xl text-title font-montserrat_bold">
              Ajouter éleves
            </p>
            <IconButton onClick={handleAddClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent className="space-y-6">
            <FormControl fullWidth className="mb-4">
              <label id="select-student-label">Choisir éleves</label>
              <CustomAutocomplete
                options={student}
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e)}
                placeholder="élève..."
              />
            </FormControl>

            <FormControl fullWidth className="mb-4">
              <label>Choisir Groupe</label>
              <Select
                labelId="select-group-label"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value as number)}
              >
                {groupOptions.map((group: any) => (
                  <MenuItem key={group.value} value={group.value}>
                    {group.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <div className="flex justify-end mt-6 space-x-4">
              <Button
                className={"w-44 rounded-2xl border"}
                variant="outlined"
                color={"error"}
                onClick={handleAddClose}
              >
                Annuler
              </Button>
              <CustomButton
                text={"Enregister"}
                width={"w-44"}
                onClick={handleSave}
              />
            </div>
          </DialogContent>
        </Box>
      </Dialog>

      {/* Delete Student Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteClose}
        fullWidth
        maxWidth="md"
      >
        <Box className="p-6">
          <DialogTitle className="flex items-center justify-between">
            <p className="text-2xl text-title font-montserrat_bold">
              Supprimer éleves
            </p>
            <IconButton onClick={handleDeleteClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent className="space-y-6">
            <p>Êtes-vous sûr de vouloir supprimer cet élève du groupe ?</p>
            <FormControl fullWidth className="mb-4">
              <label>Choisir Groupe à supprimer</label>
              <Select
                labelId="select-delete-group-label"
                value={deleteGroup}
                onChange={(e) => setDeleteGroup(e.target.value as number)}
              >
                {selectedRow?.groups
                  ?.filter((item: any) => item.superTeacherId === id)
                  .map((group: any) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.title}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <div className="flex justify-end mt-6 space-x-4">
              <Button
                className={"w-44 rounded-2xl border"}
                variant="outlined"
                color={"error"}
                onClick={handleDeleteClose}
              >
                Annuler
              </Button>
              <CustomButton
                text={"Supprimer"}
                width={"w-44"}
                onClick={handleDelete}
              />
            </div>
          </DialogContent>
        </Box>
      </Dialog>

      {/* Add Subject Dialog - Redesigned */}
      <Dialog
        open={openAddSubjectDialog}
        onClose={handleAddSubjectClose}
        fullWidth
        maxWidth="md"
      >
        <Box className="p-6">
          <DialogTitle className="flex items-center justify-between">
            <p className="text-2xl text-title font-montserrat_bold">
              Gérer les matières de l'élève
            </p>
            <IconButton onClick={handleAddSubjectClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent className="space-y-6">
            <p className="mb-4">
              Élève sélectionné: <strong>{selectedRow?.fullName}</strong>
            </p>
            <FormControl fullWidth className="mb-4">
              <label>Ajouter des matières</label>
              <Select
                labelId="select-subject-label"
                multiple
                value={selectedSubjects}
                onChange={(e) => setSelectedSubjects(e.target.value as number[])}
                renderValue={(selected) =>
                  subjectOptions
                    .filter((opt) => selected.includes(opt.value))
                    .map((opt) => opt.label)
                    .join(", ")
                }
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                      zIndex: 1300,
                    },
                  },
                }}
              >
                {subjectOptions.map((subject: any) => (
                  <MenuItem key={subject.value} value={subject.value}>
                    {subject.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <div className="flex justify-end mt-6 space-x-4">
              <Button
                className={"w-44 rounded-2xl border"}
                variant="outlined"
                color={"error"}
                onClick={handleAddSubjectClose}
              >
                Annuler
              </Button>
              <CustomButton
                text={"Ajouter"}
                width={"w-44"}
                onClick={handleSaveSubjectsBulk}
              />
            </div>
            <div className="mt-8">
              <label className="block mb-2 font-semibold">Matières assignées</label>
              <div className="flex flex-wrap gap-2">
                {selectedRow?.subjects?.length > 0 ? (
                  selectedRow.subjects.map((subject: any) => (
                    <div key={subject.id} className="flex items-center px-3 py-1 bg-gray-100 rounded">
                      <span className="mr-2">{subject.title || subject.speciality}</span>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteSubjectSingle(subject.id)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500">Aucune matière assignée</span>
                )}
              </div>
            </div>
          </DialogContent>
        </Box>
      </Dialog>

      {/* Delete Subject Dialog */}
      <Dialog
        open={openDeleteSubjectDialog}
        onClose={handleDeleteSubjectClose}
        fullWidth
        maxWidth="md"
      >
        <Box className="p-6">
          <DialogTitle className="flex items-center justify-between">
            <p className="text-2xl text-title font-montserrat_bold">
              Supprimer Matière de l'élève
            </p>
            <IconButton onClick={handleDeleteSubjectClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent className="space-y-6">
            <p>
              Êtes-vous sûr de vouloir supprimer cette matière de l'élève{" "}
              <strong>{selectedRow?.fullName}</strong> ?
            </p>
            <FormControl fullWidth className="mb-4">
              <label>Choisir Matière à supprimer</label>
              <Select
                labelId="select-delete-subject-label"
                value={deleteSubject}
                onChange={(e) => setDeleteSubject(e.target.value as number)}
              >
                {selectedRow?.subjects?.map((subject: any) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <div className="flex justify-end mt-6 space-x-4">
              <Button
                className={"w-44 rounded-2xl border"}
                variant="outlined"
                color={"error"}
                onClick={handleDeleteSubjectClose}
              >
                Annuler
              </Button>
              <CustomButton
                text={"Supprimer"}
                width={"w-44"}
                onClick={handleDeleteSubject}
              />
            </div>
          </DialogContent>
        </Box>
      </Dialog>
    </div>
  );
};

export default ManagementStudent;
