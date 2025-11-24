import React, { useContext, useEffect, useState, useMemo } from "react";
import CustomTable from "../../../shared/custom-table/custom-table";
import { columnsStudent } from "../../../mocks/fakeData";
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
  TextField,
  InputAdornment,
  Card,
  CardContent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  getAllStudentFromSuperTeacher,
  getAllUserByRole,
} from "../../../services/super-teacher";
import {
  addStudentGroupService,
  RemoveStudentGroupService,
} from "../../../services/group-service";
import {
  removeSubjectFromStudentService,
  addBulkSubjectsToStudentService,
  getAllSubjectsByGroupId,
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
  const [student, setStudent] = useState<any>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>("");
  const [studentOffers, setStudentOffers] = useState<any[]>([]);
  const [selectedStudentOffer, setSelectedStudentOffer] = useState<number | null>(null);
  // Use enum values for periods and map to user-friendly labels
  const periodOptions = [
    { value: "MONTHLY", label: "Mensuel" },
    { value: "TRIMESTER", label: "Trimestriel" },
    { value: "SEMESTER", label: "Semestriel" },
    { value: "YEARLY", label: "Annuel" },
  ];
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAddSubjectDialog, setOpenAddSubjectDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [deleteGroup, setDeleteGroup] = useState<number | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]); // for bulk add
  const [selectedGroupForSubject, setSelectedGroupForSubject] = useState<number | null>(null);
  const [filteredSubjectOptions, setFilteredSubjectOptions] = useState<{ label: string; value: number }[]>([]);
  const snackbarContext = useContext(SnackbarContext);

  // Filter and pagination states
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 20;

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
    // Fetch student offers
    import("../../../services/student-offer").then(({ getAllStudentOfferService }) => {
      getAllStudentOfferService().then((res: any) => {
        setStudentOffers(Array.isArray(res) ? res : res.data || []);
      }).catch((e: any) => {
        console.log(e);
      });
    });
    // Optionally fetch periods from API if needed
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
    setSelectedGroupForSubject(null);
    setFilteredSubjectOptions([]);
  };
  const handleAddSubjectClose = () => {
    setOpenAddSubjectDialog(false);
    setSelectedGroupForSubject(null);
    setFilteredSubjectOptions([]);
  };
  // When group is selected, fetch all subjects for that group from the backend
  useEffect(() => {
    if (!selectedGroupForSubject) {
      setFilteredSubjectOptions([]);
      return;
    }
    // Fetch all subjects for the selected group
    getAllSubjectsByGroupId(selectedGroupForSubject).then((subjects: any) => {
      console.log('Subjects returned by getAllSubjectsByGroupId:', subjects);
      // The correct array is subjects.data (from API), or subjects.data.data
      const subjectList = Array.isArray(subjects?.data) ? subjects.data : (Array.isArray(subjects?.data?.data) ? subjects.data.data : []);
      // Get assigned subject IDs
      const assignedSubjectIds = Array.isArray(selectedRow?.subjects)
        ? selectedRow.subjects.map((s: any) => s.id)
        : [];
      // Deduplicate by ID
      const uniqueSubjectsMap = new Map();
      subjectList.forEach((subject: any) => {
        if (!uniqueSubjectsMap.has(subject.id)) {
          uniqueSubjectsMap.set(subject.id, subject);
        }
      });
      const uniqueSubjects = Array.from(uniqueSubjectsMap.values());
      setFilteredSubjectOptions(
        uniqueSubjects.map((subject: any) => ({
          label: subject.title || subject.speciality,
          value: subject.id,
          assigned: assignedSubjectIds.includes(subject.id),
        }))
      );
      setSelectedSubjects([]); // reset subjects when group changes
    });
  }, [selectedGroupForSubject, selectedRow]);

  // const handleDeleteSubjectClick = (row: any) => {
  //   setSelectedRow(row);
  //   setOpenDeleteSubjectDialog(true);
  // };
  // const handleDeleteSubjectClose = () => {
  //   setOpenDeleteSubjectDialog(false);
  //   setDeleteSubject(null);
  // };

  const handleSave = () => {
    if (!selectedStudent || !selectedStudentOffer || !selectedPeriod) {
      if (snackbarContext) {
        snackbarContext.showMessage(
          "Erreur",
          "Veuillez remplir tous les champs.",
          "error",
        );
      }
      return;
    }
    addStudentGroupService(0, selectedStudent, String(selectedStudentOffer), selectedPeriod)
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
        setSelectedStudentOffer(null);
        setSelectedPeriod("");
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

  // const handleSaveSubject = () => {
  //   if (selectedRow && selectedSubject) {
  //     addSubjectToStudentService(selectedRow.id, Number(selectedSubject))
  //       .then(() => {
  //         getAllStudentFromSuperTeacher()
  //           .then((res) => {
  //             setData(res.data);
  //           })
  //           .catch((e) => {
  //             console.log(e);
  //           });
  //         if (snackbarContext) {
  //           snackbarContext.showMessage(
  //             "Succes",
  //             "Matière ajoutée avec succès",
  //             "success",
  //           );
  //         }
  //         handleAddSubjectClose();
  //       })
  //       .catch((e) => {
  //         console.log(e);
  //       });
  //   }
  // };

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

  // const handleDeleteSubject = () => {
  //   if (selectedRow && deleteSubject) {
  //     removeSubjectFromStudentService(selectedRow.id, deleteSubject)
  //       .then(() => {
  //         getAllStudentFromSuperTeacher()
  //           .then((res) => {
  //             setData(res.data);
  //           })
  //           .catch((e) => {
  //             console.log(e);
  //           });
  //         if (snackbarContext) {
  //           snackbarContext.showMessage(
  //             "Succes",
  //             "Matière supprimée avec succès",
  //             "success",
  //           );
  //         }
  //         handleDeleteSubjectClose();
  //       })
  //       .catch((e) => {
  //         console.log(e);
  //       });
  //   }
  // };

  const handleDeleteSubjectSingle = async (subjectId: number) => {
    if (selectedRow && subjectId) {
      await removeSubjectFromStudentService(selectedRow.id, subjectId);
      // Update the UI immediately for better UX
      setSelectedRow((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          subjects: prev.subjects.filter((s: any) => s.id !== subjectId),
        };
      });
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
    <div className="flex items-center justify-center gap-2">
      <button
        style={{ background: '#22c55e', color: '#fff', border: '2px solid #16a34a', fontWeight: 'bold', borderRadius: '9999px', boxShadow: '0 2px 8px rgba(34,197,94,0.2)' }}
        className="px-4 py-2 text-sm whitespace-nowrap"
        onClick={() => handleAddSubjectClick(row)}
      >
        Gérer Matières
      </button>
      {/* <button
        style={{ background: '#ef4444', color: '#fff', border: '2px solid #b91c1c', fontWeight: 'bold', borderRadius: '9999px', boxShadow: '0 2px 8px rgba(239,68,68,0.2)' }}
        className="px-4 py-2 text-sm whitespace-nowrap"
        onClick={() => handleDeleteSubjectClick(row)}
      >
        - Matière
      </button> */}
      <button
        style={{ background: '#dc2626', color: '#fff', border: '2px solid #991b1b', fontWeight: 'bold', borderRadius: '9999px', boxShadow: '0 2px 8px rgba(220,38,38,0.2)' }}
        className="px-4 py-2 text-sm whitespace-nowrap"
        onClick={() => handleDeleteClick(row)}
      >
        Supprimer Classe
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

  // Filter and pagination logic
  const filtered = useMemo(() => {
    let result = Array.from(new Map(data.map((item: any) => [item.id, item])).values());
    
    // Apply text search filter
    if (query) {
      const q = query.toLowerCase();
      result = result.filter((student: any) => {
        const fullName = (student.fullName || "").toLowerCase();
        const email = (student.email || "").toLowerCase();
        return fullName.includes(q) || email.includes(q);
      });
    }

    // Apply group filter
    if (groupFilter) {
      result = result.filter((student: any) => {
        return student.groups?.some((group: any) => group.title === groupFilter);
      });
    }

    return result;
  }, [data, query, groupFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / studentsPerPage);
  const paginatedStudents = useMemo(() => {
    const startIdx = (currentPage - 1) * studentsPerPage;
    return filtered.slice(startIdx, startIdx + studentsPerPage);
  }, [filtered, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, groupFilter]);

  // Get unique groups for filter dropdown
  const availableGroups = useMemo<string[]>(() => {
    const groups = data.flatMap((student: any) => 
      student.groups?.filter((g: any) => g.superTeacherId === id).map((g: any) => g.title) || []
    );
    return Array.from(new Set(groups)).filter(Boolean) as string[];
  }, [data, id]);

  return (
    <div className="w-full p-1 lg:p-10">
      <div className="flex flex-col items-start justify-between w-full mb-5 space-y-4 md:flex-row md:items-center md:space-y-0">
        <h1 className="text-2xl text-title font-montserrat_bold md:text-3xl">
          Gestion éleves
        </h1>
        <CustomButton text={"Ajouter éleves"} onClick={handleAddClick} />
      </div>

      {/* Search and Filter Section */}
      <Card className="mb-6 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            <div className="flex flex-col w-full gap-4 sm:flex-row lg:w-auto">
              {/* Search Input */}
              <TextField
                placeholder="Rechercher par nom ou email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                variant="outlined"
                size="small"
                className="w-full sm:w-64"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon className="text-gray-400" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Group Filter */}
              <FormControl size="small" className="w-full sm:w-48">
                <Select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  displayEmpty
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterListIcon className="text-gray-400" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Tous les groupes</MenuItem>
                  {availableGroups.map((group: string) => (
                    <MenuItem key={group} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outlined"
                onClick={() => {
                  setQuery("");
                  setGroupFilter("");
                }}
                disabled={!query && !groupFilter}
              >
                Réinitialiser
              </Button>
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="mt-4 text-sm text-gray-600">
            Affichage de {paginatedStudents.length} sur {filtered.length} élève(s)
            {(query || groupFilter) && ` (filtré depuis ${data.length} total)`}
          </div>
        </CardContent>
      </Card>

      <CustomTable
        title="Gérer éleves"
        columns={columnsStudent}
        //@ts-ignore
        data={paginatedStudents}
        actions={renderActions}
        status={renderStatus}
        statusName={"Groups"}
      />

      {/* Pagination Controls */}
      {filtered.length > 0 && (
        <Card className="mt-6 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outlined"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  size="small"
                >
                  Première
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  size="small"
                >
                  Précédent
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  size="small"
                >
                  Suivant
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  size="small"
                >
                  Dernière
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              <label>Choisir Offre</label>
              <Select
                labelId="select-student-offer-label"
                value={selectedStudentOffer ?? ""}
                onChange={(e) => setSelectedStudentOffer(Number(e.target.value))}
                displayEmpty
              >
                <MenuItem value="" disabled>Choisir une offre</MenuItem>
                {studentOffers.map((offer: any) => (
                  <MenuItem key={offer.id} value={offer.id}>{offer.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth className="mb-4">
              <label>Choisir Période</label>
              <Select
                labelId="select-period-label"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as string)}
                displayEmpty
              >
                <MenuItem value="" disabled>Choisir une période</MenuItem>
                {periodOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
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

      {/* Add Subject Dialog - Guided group/subject selection */}
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
            {/* Group selection dropdown */}
            <FormControl fullWidth className="mb-4">
              <label>Choisir un groupe</label>
              <Select
                labelId="select-group-for-subject-label"
                value={selectedGroupForSubject ?? ''}
                onChange={(e) => setSelectedGroupForSubject(Number(e.target.value))}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Sélectionner un groupe
                </MenuItem>
                {selectedRow?.groups?.map((group: any) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Subject selection dropdown, only show if group is selected */}
            {selectedGroupForSubject && (
              <FormControl fullWidth className="mb-4">
                <label>Ajouter des matières du groupe</label>
                <Select
                  labelId="select-subject-label"
                  multiple
                  value={Array.isArray(selectedSubjects) ? selectedSubjects : []}
                  onChange={(e) => {
                    let value = e.target.value;
                    let arr: number[] = [];
                    if (Array.isArray(value)) {
                      arr = value.map((v) => Number(v));
                    } else if (typeof value === 'string') {
                      arr = value.split(',').map((v) => Number(v));
                    } else if (typeof value === 'number') {
                      arr = [value];
                    }
                    setSelectedSubjects(arr);
                  }}
                  renderValue={(selected) =>
                    filteredSubjectOptions
                      .filter((opt) => Array.isArray(selected) && selected.includes(opt.value))
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
                  {filteredSubjectOptions.length > 0 ? (
                    filteredSubjectOptions.map((subject: any) => (
                      <MenuItem key={subject.value} value={subject.value} disabled={subject.assigned}>
                        {subject.label}
                        {subject.assigned && (
                          <span style={{ color: '#888', marginLeft: 8 }}>(déjà assignée)</span>
                        )}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Aucune matière disponible pour ce groupe</MenuItem>
                  )}
                </Select>
              </FormControl>
            )}
            <div className="flex justify-end mt-6 space-x-4">
              <Button
                className={"w-44 rounded-2xl border"}
                variant="outlined"
                color={"error"}
                onClick={handleAddSubjectClose}
              >
                Annuler
              </Button>
              <span
                className={
                  !selectedGroupForSubject || selectedSubjects.length === 0
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              >
                <CustomButton
                  text={"Ajouter"}
                  width={"w-44"}
                  onClick={handleSaveSubjectsBulk}
                />
              </span>
            </div>
            <div className="mt-8">
              <label className="block mb-2 font-semibold">Matières assignées</label>
              <div>
                {selectedRow?.subjects?.length > 0 ? (
                  // Group subjects by groupId, try to match group from selectedRow.groups if missing
                  Object.entries(
                    selectedRow.subjects.reduce((acc: any, subject: any) => {
                      let groupId = subject.groupId;
                      let groupTitle = subject.groupTitle || subject.group?.title;
                      // Try to match group if missing
                      if (!groupId || !groupTitle) {
                        const foundGroup = Array.isArray(selectedRow.groups)
                          ? selectedRow.groups.find((g: any) =>
                              g.id === subject.groupId ||
                              (subject.group && g.id === subject.group.id) ||
                              (subject.groupId == null && subject.group && g.id === subject.group.id)
                            )
                          : null;
                        if (!groupId && foundGroup) groupId = foundGroup.id;
                        if (!groupTitle && foundGroup) groupTitle = foundGroup.title;
                      }
                      // Fallback if still missing
                      groupId = groupId || 'Autre';
                      groupTitle = groupTitle || 'Autre';
                      if (!acc[groupId]) {
                        acc[groupId] = { title: groupTitle, subjects: [] };
                      }
                      acc[groupId].subjects.push(subject);
                      return acc;
                    }, {})
                  ).map(([groupId, groupData]: any) => (
                    <div key={groupId} className="mb-4">
                      <div className="mb-2 font-semibold text-blue-700">{groupData.title}</div>
                      <div className="flex flex-wrap gap-2">
                        {groupData.subjects.map((subject: any) => (
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
                        ))}
                      </div>
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
      {/* <Dialog
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
      </Dialog> */}
    </div>
  );
};

export default ManagementStudent;
