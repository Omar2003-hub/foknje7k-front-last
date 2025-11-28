import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import { Box, Modal, Typography } from "@mui/material";
import { AddAPhoto as AddAPhotoIcon } from "@mui/icons-material";
import CustomInput from "../shared/custom-input/custom-input";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import CustomButton from "../shared/custom-button/custom-button";
import { FormModalProps } from "./offerModal";
import { getUserGroupService } from "../services/group-service";
import CustomSelect from "../shared/custom-select/custom-select";
import { SnackbarContext } from "../config/hooks/use-toast";
import { classesLevel } from "../mocks/education-level";

interface FormData {
  image: string;
  title: string;
  subTitle: string;
  description: string;
  monthlyPrice: number | string;
  trimesterPrice: number | string;
  semesterPrice: number | string;
  yearlyPrice: number | string;
  offerDetails: string;
  classId: number | string;
  requiredEducationLevel?: string;
  allSubjects?: boolean;
  subjectCount?: number | string;
  promoCode?: string;
}

const defaultData: FormData = {
  image: "",
  title: "",
  subTitle: "",
  description: "",
  monthlyPrice: "",
  trimesterPrice: "",
  semesterPrice: "",
  yearlyPrice: "",
  offerDetails: "",
  classId: "",
  requiredEducationLevel: "",
  allSubjects: false,
  subjectCount: "",
  promoCode: "",
};
  
const OfferStudentModal: React.FC<FormModalProps> = ({
  open,
  onClose,
  initialData = defaultData,
  modalTitle,
  buttonText,
  onButtonClick,
  onImageChange,
}) => {
  const snackbarContext = useContext(SnackbarContext);
  // @ts-ignore
  const [sendeData, setSendeData] = useState<FormData>(initialData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [benefitInput, setBenefitInput] = useState<string>("");
  const [groupOptions, setGroupOptions] = useState<
    { label: string; value: number }[]
  >([]);

  const initialEducationLevel = classesLevel.find(
    (level) => level.value === (initialData as FormData).requiredEducationLevel,
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSendeData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageFile(file);
        if (onImageChange) {
          onImageChange(result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      console.error("No file selected or file is invalid.");
    }
  };

  const handleAddBenefit = () => {
    if (benefits.length < 5) {
      if (benefitInput.trim() && benefitInput.length < 30) {
        setBenefits([...benefits, benefitInput.trim()]);
        setBenefitInput("");
      }
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleActionClick = () => {
    const formData = new FormData();
    const { image, ...selectedUser } = sendeData;

    const offerDetails = benefits.join(" \n ");
    // Add promoCode to the payload if present
    formData.append(
      "studentOfferDTOJson",
      JSON.stringify({ ...selectedUser, offerDetails, promoCode: sendeData.promoCode }),
    );
    if (imageFile) {
      formData.append("image", imageFile);
    }

    // Check if offer is free (all price fields are 0 or empty)
    const isFree = [sendeData.monthlyPrice, sendeData.trimesterPrice, sendeData.semesterPrice, sendeData.yearlyPrice]
      .every(p => !p || Number(p) === 0);

    if (!isFree && (!imageFile && !sendeData.image)) {
      if (snackbarContext) {
        snackbarContext.showMessage(
          "Erreur",
          "Veuiller importer une image",
          "error",
        );
      }
      return;
    }

    onButtonClick(formData);
  };

  useEffect(() => {
    if (open) {
      getUserGroupService()
        .then((res) => {
          const options = res.data.map((group: any) => ({
            label: group.title,
            value: group.id,
          }));
          setGroupOptions(options);
        })
        .catch((e) => {
          console.log(e);
        });
      // @ts-ignore
      setSendeData(initialData);
      setBenefits(
        initialData.offerDetails ? initialData.offerDetails.split("\n") : [],
      );
    }
  }, [open, initialData]);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setSendeData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setSendeData(defaultData);
        setImageFile(null);
        onClose();
      }}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box className="bg-backgroundHome absolute top-10 left-1/2 transform -translate-x-1/2 w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto shadow p-10">
        <div className="flex justify-center w-full mb-5">
          <h1 className="text-3xl font-montserrat_semi_bold text-primary">
            {modalTitle}
          </h1>
        </div>

        {/* Payment Image Upload - Only show if not free */}
        {(() => {
          const isFree = [sendeData.monthlyPrice, sendeData.trimesterPrice, sendeData.semesterPrice, sendeData.yearlyPrice]
            .every(p => !p || Number(p) === 0);
          if (isFree) return null;
          return (
            <div className="flex items-center justify-center w-full h-40 my-2 bg-gray-200">
              <label className="flex flex-col items-center cursor-pointer">
                {imageFile || sendeData.image ? (
                  <img
                    src={
                      imageFile ? URL.createObjectURL(imageFile) : sendeData.image
                    }
                    alt="Uploaded"
                    className="object-cover w-40 h-40 rounded-3xl"
                  />
                ) : (
                  <div className="flex flex-col items-center cursor-pointer">
                    <AddAPhotoIcon />
                    <Typography variant="caption">Add an image</Typography>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          );
        })()}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <CustomInput
            label="Promo Code (optional)"
            inputType="text"
            CustomStyle="mb-5"
            value={sendeData.promoCode || ""}
            name="promoCode"
            onChange={handleChange}
          />
          <CustomInput
            label="Title"
            inputType="text"
            CustomStyle="mb-5"
            value={sendeData.title}
            name="title"
            onChange={handleChange}
          />
          <CustomInput
            label="Sous Titre"
            inputType="text"
            CustomStyle="mb-5"
            value={sendeData.subTitle}
            name="subTitle"
            onChange={handleChange}
          />
          <CustomInput
            label="Description"
            inputType="text"
            CustomStyle="mb-5"
            value={sendeData.description}
            name="description"
            onChange={handleChange}
          />
          <CustomInput
            label="Monthly Price"
            inputType="number"
            CustomStyle="mb-5"
            value={sendeData.monthlyPrice}
            name="monthlyPrice"
            onChange={handleChange}
          />
          <CustomInput
            label="Trimester Price"
            inputType="number"
            CustomStyle="mb-5"
            value={sendeData.trimesterPrice}
            name="trimesterPrice"
            onChange={handleChange}
          />
          <CustomInput
            label="Semester Price"
            inputType="number"
            CustomStyle="mb-5"
            value={sendeData.semesterPrice}
            name="semesterPrice"
            onChange={handleChange}
          />
          <CustomInput
            label="Yearly Price"
            inputType="number"
            CustomStyle="mb-5"
            value={sendeData.yearlyPrice}
            name="yearlyPrice"
            onChange={handleChange}
          />
          <CustomSelect
            label="Class"
            placeholder={"Select Class"}
            customStyle="me-3"
            options={groupOptions}
            value={sendeData.classId}
            onChange={handleSelectChange}
            name="classId"
          />
          <CustomSelect
            label="Education Level"
            placeholder={"Select Education Level"}
            customStyle="me-3"
            options={classesLevel}
            value={sendeData.requiredEducationLevel || initialEducationLevel?.value}
            onChange={handleSelectChange}
            name="requiredEducationLevel"
          />
          <div className="flex items-center mb-5">
            <input
              type="checkbox"
              id="allSubjects"
              name="allSubjects"
              checked={sendeData.allSubjects || false}
              onChange={(e) => setSendeData((prevData) => ({ ...prevData, allSubjects: e.target.checked, subjectCount: e.target.checked ? "" : prevData.subjectCount }))}
              className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary focus:ring-primary focus:ring-2"
            />
            <label htmlFor="allSubjects" className="ml-2 text-sm font-medium text-gray-900">
              All Subjects
            </label>
          </div>
          <CustomInput
            label="Subject Count"
            inputType="number"
            CustomStyle="mb-5"
            value={sendeData.subjectCount}
            name="subjectCount"
            onChange={handleChange}
            disabled={sendeData.allSubjects || false}
          />
          <div className="w-full">
            <div className="flex items-center justify-between w-full">
              <CustomInput
                label="Add Benefit"
                inputType="text"
                CustomStyle="w-11/12 mb-2"
                value={benefitInput}
                name="benefitInput"
                onChange={(e) => setBenefitInput(e.target.value)}
              />
              <div onClick={handleAddBenefit}>
                <AddCircleIcon className={"text-primary"} />
              </div>
            </div>

            <ul className={"flex flex-wrap"}>
              {benefits.map((benefit, index) => (
                <li
                  key={index}
                  className="flex items-center px-2 mx-1 mb-5 border rounded border-primary"
                >
                  <span className={"font-montserrat_regular text-title"}>
                    {benefit}
                  </span>
                  <div
                    className="mx-3"
                    onClick={() => handleRemoveBenefit(index)}
                  >
                    <RemoveCircleIcon className={"text-red"} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-center w-full">
          <CustomButton text={buttonText} onClick={handleActionClick} />
        </div>
      </Box>
    </Modal>
  );
};

export default OfferStudentModal;
