import React, { useContext, useEffect, useState } from "react";
import CustomSelectDashboard from "../../../shared/custom-select-dashboard/custom-selectDashboard";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import ListIcon from "@mui/icons-material/List";
import CustomButton from "../../../shared/custom-button/custom-button";
import CustomInput from "../../../shared/custom-input/custom-input";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import YouTubeIcon from "@mui/icons-material/YouTube";
import {
  getAllSubjectsByGroupId,
  getAllUserSubjectService,
} from "../../../services/subject-service";
import SubjectIcon from "@mui/icons-material/Subject";
import { uploadItemPlayListService, updateItemPlayListService, getSasTokenService } from "../../../services/playList-service";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { SnackbarContext } from "../../../config/hooks/use-toast";
import { getUserGroupService } from "../../../services/group-service";
import CustomSelect from "../../../shared/custom-select/custom-select";

import { BlobClient, BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';


import { fileDB } from "../../../services/firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { log } from "console";
import { blob } from "node:stream/consumers";
import { co } from "@fullcalendar/core/internal-common";


const Files = () => {
  const [subject, setSubjects] = useState<any>([]);
  const [allSubjects, setAllSubjects] = useState<any>([]);
  const [playlists, setPlaylists] = useState<any>([]);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    subject: "",
    fileName: "",
    playlist: "",
    segment: "",
    youtubeUrl: "",
  });
  const [groupOptions, setGroupOptions] = useState<
    { label: string; value: number }[]
  >([]);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null); // New state for selected group

  const snackbarContext = useContext(SnackbarContext);
  useEffect(() => {
    getUserGroupService()
      .then((res) => {
        const options = res.data.map((group: any) => ({
          label: group.title,
          value: group.id,
        }));
        setSelectedGroupId(options[0].value);
        setGroupOptions(options);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);
  useEffect(() => {
    if (selectedGroupId) {
      getAllSubjectsByGroupId(selectedGroupId)
        .then((res) => {
          const subjectsOptions = res.data.map((item: any) => {
            let teacherName = '';
            if (item.teacher && item.teacher.name) {
              teacherName = item.teacher.name;
            } else if (item.teacherName) {
              teacherName = item.teacherName;
            } else if (item.teacherId) {
              teacherName = item.teacherId;
            }
            return {
              label: teacherName ? `${item.speciality} (Prof: ${teacherName})` : item.speciality,
              value: item.id,
            };
          });
          setAllSubjects(res.data);
          setSubjects(subjectsOptions);
        })
        .catch((e) => {
          console.log(e);
        });
    } else {
      setSubjects([]); // Clear subjects if no group is selected
      setAllSubjects([]);
    }
  }, [selectedGroupId]);

  const handleSelectChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>,
  ) => {
    const { name, value } = event.target;

    if (name === "subject") {
      const filteredValue = allSubjects.filter(
        (item: { id: number }) => item.id === Number(value),
      );
      const playlistsOptions = filteredValue[0]?.playLists.map((item: any) => ({
        label: item.title,
        value: item.id,
      }));
      setPlaylists(playlistsOptions);
    }

    // Clear file when switching to YouTube and clear YouTube URL when switching away
    if (name === "segment") {
      if (value === "youtube") {
        setFile(null); // Clear file when switching to YouTube
      } else {
        // Clear YouTube URL when switching away from YouTube
        setFormData((prevData) => ({
          ...prevData,
          youtubeUrl: "",
        }));
      }
    }

    setFormData((prevData) => ({
      ...prevData,
      [name!]: value,
    }));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileSend = event.target.files?.[0];
    if (fileSend) {
      setFile(fileSend);
    }
  };


  const handleClick = async () => {
    // For YouTube videos, we don't need a file
    if (formData.segment === 'youtube') {
      if (!formData.youtubeUrl) {
        if (snackbarContext) {
          snackbarContext.showMessage(
            "Erreur",
            "Veuillez saisir l'URL YouTube",
            "error",
          );
        }
        return;
      }

      // Validate YouTube URL format
      const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/;
      if (!youtubeUrlPattern.test(formData.youtubeUrl)) {
        if (snackbarContext) {
          snackbarContext.showMessage(
            "Erreur",
            "Veuillez saisir une URL YouTube valide (ex: https://www.youtube.com/watch?v=...)",
            "error",
          );
        }
        return;
      }

      if(formData.subject === "" || formData.playlist === "" || formData.fileName === "") {
        if (snackbarContext) {
          snackbarContext.showMessage(
            "Erreur",
            "Veuillez remplir tous les champs",
            "error",
          );
        }
        return;
      }

      // Handle YouTube URL submission logic
      const formSent = new FormData();
      const formSentJson = {
        category: formData.segment,
        title: formData.fileName,
        youtubeUrl: formData.youtubeUrl, // Add YouTube URL to the payload
      };
      formSent.append("subjectId", formData.subject);
      formSent.append("uploadItemRequestJson", JSON.stringify(formSentJson));
      
      setLoading(true);
      try {
        const response = await uploadItemPlayListService(
          Number(formData.playlist),
          formSent,
          (progressEvent: any) => {
            // For YouTube URLs, we can simulate progress or skip it
            setUploadProgress(100);
          }
        );
        
        setFormData({
          segment: "",
          fileName: "",
          subject: "",
          playlist: "",
          youtubeUrl: "",
        });
        
        if (snackbarContext) {
          snackbarContext.showMessage(
            "Succès",
            "URL YouTube ajoutée avec succès",
            "success",
          );
        }
        setLoading(false);
        setUploadProgress(0);
      } catch (error) {
        console.error("Error uploading YouTube URL:", error);
        if (snackbarContext) {
          snackbarContext.showMessage(
            "Erreur",
            "Erreur lors de l'ajout de l'URL YouTube",
            "error",
          );
        }
        setLoading(false);
        setUploadProgress(0);
      }
      return;
    }

    // Original file upload logic for non-YouTube content
    if (!file) {
      if (snackbarContext) {
        snackbarContext.showMessage(
          "Erreur",
          "Veuillez sélectionner un fichier",
          "error",
        );
      }
      return;
    }

    const fileExtension = file.name?.split('.').pop()?.toLowerCase();

    if (!fileExtension) {
      if (snackbarContext) {
        snackbarContext.showMessage(
          "Erreur",
          "Impossible de déterminer le type de fichier. Veuillez vérifier le fichier et réessayer.",
          "error",
        );
      }

      return;
    }
    const isVideo = ['mp4', 'avi', 'mov', 'mkv'].includes(fileExtension);
    const isPdf = fileExtension === 'pdf';
    const selectedCategory = formData.segment;

    const allowedVideoExtensions = ['mp4', 'avi', 'mov', 'mkv'];


    if (!allowedVideoExtensions.includes(fileExtension) && selectedCategory === 'video') {
      if (snackbarContext) {
        snackbarContext.showMessage(
          "Erreur",
          "L'extension du fichier vidéo n'est pas autorisée. les extensions autorisées sont : " + allowedVideoExtensions.join(", "),
          "error",
        );
      }
      return;
    }

    if (!isVideo && !isPdf) {
      if (snackbarContext) {
        snackbarContext.showMessage(
          "Erreur",
          "Le fichier n'est ni une vidéo ni un PDF. Veuillez vérifier le fichier et réessayer.",
          "error",
        );
      }
      return;
    }
    if (isVideo && selectedCategory !== 'video') {
      if (snackbarContext) {
        snackbarContext.showMessage(
          "Erreur",
          "Le fichier est une vidéo, mais la catégorie n'est pas définie sur 'vidéo'. Veuillez corriger votre sélection.",
          "error"
        );
      }
      return; 
    }

    if (isPdf && selectedCategory === 'video') {
      if (snackbarContext) {
        snackbarContext.showMessage(
          "Erreur",
          "La catégorie sélectionnée n'est pas 'vidéo' et le fichier n'est pas un PDF. Veuillez vérifier vos sélections.",
          "error"
        );
      }
      return; 
    }

    if(formData.subject === "" || formData.playlist === "" || formData.segment === "" || formData.fileName === "") {
      if (snackbarContext) {
        snackbarContext.showMessage(
          "Erreur",
          "Veuillez remplir tous les champs",
          "error",
        );
      }
      return;
    }

    const formSent = new FormData();
    const formSentJson = {
      category: formData.segment,
      title: formData.fileName,
    };
    formSent.append("subjectId", formData.subject);
    formSent.append("uploadItemRequestJson", JSON.stringify(formSentJson));
    formSent.append("file", file as Blob);

    let uploadProgress = 0;
    setLoading(true);
    const rest = await uploadItemPlayListService(
      Number(formData.playlist),
      formSent,
      (progressEvent: any) => {
        uploadProgress = Math.round(
          (progressEvent.loaded / progressEvent.total) * 100,
        );
        setUploadProgress(uploadProgress);
      }
    ).then((res) => {
        setFormData({
          segment: "",
          fileName: "",
          subject: "",
          playlist: "",
          youtubeUrl: "",
        });
      if (snackbarContext) {
        snackbarContext.showMessage(
          "Succes",
          "Fichier téléchargé avec succès",
          "success",
        );
        setLoading(false);
        setUploadProgress(0);
      }
      return res;
    }).catch((e) => {
      console.log(e);
      setLoading(false);

    });
    setLoading(false);
    setUploadProgress(0);


    /*try {
      if (!file?.name) {
        throw new Error("File name is undefined");
      }
      const res = await getSasTokenService(`${formSentJson.category}/${file.name}`);
      const sasUrl = res.data;

      const accountName = 'foknje7ikblob';
      const blobEndpoint = `https://${accountName}.blob.core.windows.net/`;
      const fullBlobUrl = `${blobEndpoint}blobby/${formSentJson.category}/${file.name}?${sasUrl}`;

      const blockBlobClient = new BlockBlobClient(fullBlobUrl);


      const customBlockSize = file.size > 1024 * 1024 * 32 ? 1024 * 1024 * 4 : 1024 * 512;

      const uploadOptions = {
        blockSize: customBlockSize,
        onProgress: (progress : any) => {
          const percentComplete = Math.round((progress.loadedBytes / file.size) * 100);
          console.log(`Progress: ${percentComplete}%`);
          setUploadProgress(percentComplete);
        },
      };
  
 
      try {
        // Start the file upload
        await blockBlobClient.uploadBrowserData(file, uploadOptions);
        setUploadProgress(100);
        alert("Fichier téléchargé avec succès");
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Ficher non téléchargé");
      } finally {
      }

      await updateItemPlayListService(
        Number(rest.data.id),
        Number(formData.subject),
        encodeURIComponent(fullBlobUrl),
        formData.segment
      );
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
    }

    /*
    try {
      const uploadTask = uploadBytesResumable(fileRef, file as Blob);
    
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Error uploading file:", error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
    
          await updateItemPlayListService(
            Number(rest.data.id),
            Number(formData.subject),
            encodeURIComponent(downloadURL),
            formData.segment
          );
          setLoading(false);
        }
      );
    } catch (error) {
      console.error("Error uploading file:", error);
    }*/

  };

  return (
    <div className="flex flex-col justify-center w-full px-4 mb-10 md:px-0">
      <h1 className="mb-6 text-2xl text-title font-montserrat_bold md:text-3xl md:mb-10">
        Gestion des Fichiers
      </h1>
      <div className="flex justify-center w-full">
        <div className="flex flex-col items-center w-full max-w-full p-6 bg-white rounded-3xl md:p-10 md:w-10/12">
          <h1 className="mb-3 text-xl text-center text-title font-montserrat_bold md:text-3xl">
            Téléchargement des Fichiers
          </h1>
          <p className="mb-6 text-sm text-center text-text font-montserrat_regular md:mb-10">
            Veuillez fournir le/les fichier(s) pour les télécharger
          </p>

          <CustomSelect
            label={"Class"}
            placeholder={"Select Class"}
            customStyle="me-3 mb-5"
            labelClasses={"font-montserrat_bold mb-2"}
            width={"w-1/2 md:w-full"}
            options={groupOptions}
            onChange={(e) => {
              setSelectedGroupId(Number(e.target.value));
            }}
            name="classId"
            //@ts-ignore
            value={selectedGroupId}
          />
          <CustomSelectDashboard
            options={subject}
            value={formData.subject}
            onChange={handleSelectChange}
            name="subject"
            iconSuffix={SubjectIcon}
            label={"Matière"}
          />

          <CustomInput
            label={"Nom du fichier"}
            CustomStyle={"w-full"}
            labelClasses={"font-montserrat_bold mb-2"}
            placeholder={"Insérer le nom complet"}
            iconPrefix={<PersonAddIcon className={"text-text"} />}
            value={formData.fileName}
            name="fileName"
            onChange={handleInputChange}
          />

          <CustomSelectDashboard
            options={[
              { value: "youtube", label: "Youtube Video" },
              { value: "video", label: "Vidéo" },
              { value: "qcm", label: "QCM" },
              { value: "fiche", label: "Fichier" },
              { value: "exercice", label: "Exercice" },
              { value: "correction", label: "Correction" },
            ]}
            value={formData.segment}
            onChange={handleSelectChange}
            name="segment"
            iconSuffix={ListIcon}
            label={"Le Segment"}
          />

          {formData.segment === 'youtube' ? (
            <CustomInput
              label={"Ajouter Youtube Url"}
              CustomStyle={"w-full"}
              inputType={"url"}
              labelClasses={"font-montserrat_bold mb-2"}
              placeholder={"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
              iconPrefix={<YouTubeIcon className={"text-text"} />}
              value={formData.youtubeUrl}
              name="youtubeUrl"
              onChange={handleInputChange}
            />
          ) : (
            <CustomInput
              label={"Télécharger le fichier"}
              CustomStyle={"w-full"}
              inputType={"file"}
              labelClasses={"font-montserrat_bold mb-2"}
              placeholder={"Sélectionner un fichier"}
              iconPrefix={<NoteAddIcon className={"text-text"} />}
              onChange={handleFileChange}
            />
          )}

          {/* Section for Playlist Select */}
          <CustomSelectDashboard
            options={playlists}
            value={formData.playlist}
            onChange={handleSelectChange}
            name="playlist"
            iconSuffix={LibraryMusicIcon}
            label={"Le chapitre"}
          />

          <div className="flex justify-end w-full mt-10 md:mt-20">
            <CustomButton
              text={"Télécharger"}
              width={"w-full md:w-44"}
              className={"text-white font-montserrat_bold"}
              onClick={handleClick}
            />
          </div>
        </div>
      </div>

      {loading && (
        <div
          className={
            "w-full left-0 top-0 h-full fixed flex items-center justify-center backdrop-blur-sm"
          }
          style={{ zIndex: 1000000 }}
        >
          <div className="flex flex-col items-center">
            <CircularProgress color={"success"} size={100} />
            <p>Transfert en cours vers le serveur : {uploadProgress}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Files;
