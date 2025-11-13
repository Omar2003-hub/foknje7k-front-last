import React, { useEffect, useState } from "react";
import CustomTable from "../../../shared/custom-table/custom-table";
import { columnsFielManagement } from "../../../mocks/fakeData";
import CustomSelect from "../../../shared/custom-select/custom-select";
import { getAllUserSubjectService, getSubjectServiceById } from "../../../services/subject-service";
import {
  deleteItemPlaylistService,
  getPlayListService,
} from "../../../services/playList-service";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CustomButton from "../../../shared/custom-button/custom-button";
import { dA } from "@fullcalendar/core/internal-common";
import { log } from "console";
import { t } from "i18next";
import { set } from "video.js/dist/types/tech/middleware";

const ManagementFiles = () => {
  const [subject, setSubjects] = useState<any>([]);
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [subjectSelected, setSubjectSelected] = useState<any>("");
  const [selectedRow, setSelectedRow] = useState<any>(null);
  useEffect(() => {
    getAllUserSubjectService()
      .then((res) => {
        const subjectsOptions = res.data.map((item: any) => ({
          label: item.speciality,
          value: item.id,
        }));
        console.log(subjectsOptions);
        setSubjects(subjectsOptions);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);
  const createItems = (items: any[], baseId: number, type: string): any[] =>
    items.map((item, index) => ({
      id: baseId,
      title: item.title,
      id_file: item.id,
      type: type,
      telecharge: item.isFailed ? "échoué" : item.isCompleted ? "terminé" : "en cours",
    }));
  const handleSelectChange = (selectedValue: any) => {
    const selectedId = selectedValue.target.value;

    setSubjectSelected(selectedId);
    console.log("selected Id:", selectedId);
    getSubjectServiceById(selectedId)
      .then((res) => {
        const playlists = res.data.playLists;
        if (playlists.length <= 0) {
          setPlaylist([]);
          return;
        }
        let allItems: any[] = [];

        playlists.forEach((data: any) => {
          const videoItems = createItems(data.videos || [], data.id, "Video");
          const ficheItems = createItems(data.fiches || [], data.id, "Fiche");
          const exerciceItems = createItems(data.exercices || [], data.id, "Exercice");
          const correctionItems = createItems(data.corrections || [], data.id, "Correction");
          const qcmItems = createItems(data.qcms || [], data.id, "QCM");


          allItems = [
            ...allItems,
            ...videoItems,
            ...ficheItems,
            ...exerciceItems,
            ...correctionItems,
            ...qcmItems,
          ];
        });

        setPlaylist(allItems);
      })
      .catch((e) => {
        console.log(e);
      });
  };
  const handleDeleteClick = (row: any) => {
    setSelectedRow(row);
    setOpenDeleteDialog(true);
  };
  const handleDeleteClose = () => setOpenDeleteDialog(false);
  const handleDelete = () => {
    if (selectedRow) {
      deleteItemPlaylistService(selectedRow.id, selectedRow.id_file)
        .then((res) => {
          window.location.reload();
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };
  const ActionButtons: React.FC<{ row: any }> = ({ row }) => (
    <div className="flex items-center justify-center space-x-2">
        <button
            className={`px-5 py-1 text-white rounded-full ${
                row.telecharge === "en cours" ? "bg-text cursor-not-allowed" : "bg-red"
            }`}
            disabled={row.telecharge === "en cours"} // Button will only be disabled if telecharge is "en cours"
            onClick={() => handleDeleteClick(row)}
        >
            Supprimer
        </button>
    </div>
);


  const renderActions = (row: any) => <ActionButtons row={row} />;
  return (
    <div className="w-full p-1 lg:p-10">
      <div className="flex flex-col items-start justify-between w-full mb-5 space-y-4 md:flex-row md:items-center md:space-y-0">
        <h1 className="text-2xl text-title font-montserrat_bold md:text-3xl">
          Les Fichiers
        </h1>
        <CustomSelect
          placeholder={"selectinner Matiére"}
          name="selectedSubject"
          value={subjectSelected}
          width={"w-full md:w-1/4"}
          onChange={(e) => handleSelectChange(e)}
          options={subject}
        />
      </div>
      <CustomTable
        title="Gérer Fichiers"
        columns={columnsFielManagement}
        data={playlist}
        actions={renderActions}
      />
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteClose}
        fullWidth
        maxWidth="sm"
      >
        <Box className="p-6">
          <DialogTitle className="flex items-center justify-between">
            <p className="text-2xl text-title font-montserrat_bold">
              Supprimer Fichier
            </p>
            <IconButton onClick={handleDeleteClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent className="space-y-6">
            <p>Êtes-vous sûr de vouloir supprimer cet élèment ?</p>

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
    </div>
  );
};

export default ManagementFiles;
