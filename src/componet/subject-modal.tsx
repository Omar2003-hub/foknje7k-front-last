import React, { useState, ChangeEvent, useEffect, useContext } from "react";
import { Modal, Box } from "@mui/material";
import CustomInput from "../shared/custom-input/custom-input";
import CustomButton from "../shared/custom-button/custom-button";
import { AddAPhoto as AddAPhotoIcon } from "@mui/icons-material";
import CustomSelect from "../shared/custom-select/custom-select";
import { colorOptions } from "../mocks/offers";
import { getAllTeacherFromSuperTeacher } from "../services/super-teacher";
import { RootState } from "../redux/store/store";
import { useSelector } from "react-redux";
import { SnackbarContext } from "../config/hooks/use-toast";
import CustomAutocomplete from "../shared/custom-autoComplete/custom-autocomplete";

interface Subject {
  id?: number;
  backgroundImageUrl?: string;
  teacherId?: string;
  level: string;
  speciality: string;
}

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: Subject;
  modalTitle: string;
  buttonText: string;
  onButtonClick: (formData: any) => void;
}

const defaultData: Subject = {
  level: "",
  speciality: "",
  teacherId: "",
};

const SubjectModal: React.FC<ProfileModalProps> = ({
  open,
  onClose,
  initialData = defaultData,
  modalTitle,
  buttonText,
  onButtonClick,
}) => {
  const snackbarContext = useContext(SnackbarContext);

  const role = useSelector(
    (state: RootState) => state?.user?.userData?.role.name,
  );
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(
    null,
  );
  const id = useSelector((state: RootState) => state?.user?.userData?.id);
  const name = useSelector(
    (state: RootState) => state?.user?.userData?.fullName,
  );
  // mainImage removed
  const [teachersArray, setTeachers] = useState<any[]>([]);
  const [formData, setFormData] = useState<Subject>(initialData ?? defaultData);

  useEffect(() => {
    if (role === "ROLE_ADMIN" || role === "ROLE_SUPER_TEACHER") {
      getAllTeacherFromSuperTeacher()
        .then((res) => {
          const teachers = res.data.map((item: { fullName: any; id: any }) => ({
            label: item.fullName,
            value: item.id,
          }));
          teachers.push({
            label: name,
            value: id,
          });
          setTeachers(teachers);
        })
        .catch((e) => {
          console.log(e);
        });
    }

    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(defaultData);
    }
  }, [initialData]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageUpload = (
    event: ChangeEvent<HTMLInputElement>,
    type: "backgroundImage",
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        backgroundImageUrl: URL.createObjectURL(file),
      }));
      setBackgroundImageFile(file);
    }
  };

  // Section logic removed

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleActionClick = () => {
    const preparedFormData = new FormData();
    const PreparedJson = {
      speciality: formData.speciality,
      level: formData.level,
      // @ts-ignore
      teacherId: formData?.teacherId ? formData.teacherId : id,
    };
  
    // Check fields before stringifying
    if (PreparedJson.speciality === "" || PreparedJson.level === "") {
      if (snackbarContext) {
        snackbarContext.showMessage("Erreur", "Veuillez remplir les champs", "error");
      }
      return;
    }
  
    const subject = JSON.stringify(PreparedJson);
    preparedFormData.append("subjectDTOJson", subject);
    console.log(subject);
  
    if (backgroundImageFile) {
      preparedFormData.append("backgroundImage", backgroundImageFile);
    }
    if (!backgroundImageFile && !formData.backgroundImageUrl) {
      if (snackbarContext) {
        snackbarContext.showMessage(
          "Erreur",
          "Veuillez importer une image de couverture",
          "error"
        );
      }
      return;
    }
  
    onButtonClick(preparedFormData);
  
    onClose();
  };
  

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box className="bg-backgroundHome absolute top-10 left-1/2 transform -translate-x-1/2 w-11/12 sm:w-9/12 md:w-7/12 lg:w-6/12 xl:w-5/12 shadow p-5 sm:p-10 max-h-[calc(100vh-80px)] overflow-y-auto">
        <div className="flex justify-center w-full mb-5">
          <h1 className="text-3xl text-center font-montserrat_semi_bold text-primary">
            {modalTitle}
          </h1>
        </div>
        <div className="flex flex-col items-center md:flex-row justify-evenly">
          <div className="flex items-center justify-center w-1/3 h-40 my-2">
            <label className="flex flex-col items-center cursor-pointer">
              {backgroundImageFile || formData.backgroundImageUrl ? (
                <img
                  src={
                    backgroundImageFile
                      ? URL.createObjectURL(backgroundImageFile)
                      : formData.backgroundImageUrl
                  }
                  alt="Cover"
                  className="object-cover h-40 w-80 rounded-3xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-40 border-2 w-80 rounded-3xl border-primary">
                  <AddAPhotoIcon />
                  <p className="text-sm text-title font-montserrat_regular">
                    Add a cover photo
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  handleImageUpload(event, "backgroundImage")
                }
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <CustomInput
            label="Speciality"
            inputType="text"
            CustomStyle="mb-5"
            value={formData.speciality}
            name="speciality"
            onChange={handleChange}
          />
          <CustomInput
            label="Level"
            inputType="text"
            CustomStyle="mb-5"
            value={formData.level}
            name="level"
            onChange={handleChange}
          />
          <div>
            <label
              className={`block text-xs font-montserrat_regular mb-2 text-title `}
            >
              Professur
            </label>
            <CustomAutocomplete
              options={teachersArray}
              value={formData.teacherId}
              onChange={(value) =>
                setFormData({ ...formData, teacherId: value })
              }
            />
          </div>
        </div>

        {/* Section UI removed as backend no longer supports it */}

        <div className="flex justify-center mt-6">
          <CustomButton text={buttonText} onClick={handleActionClick} />
        </div>
      </Box>
    </Modal>
  );
};

export default SubjectModal;
