"use client";

import { useRouter } from "next/navigation";
import { FormEvent, SetStateAction, useState } from "react";
import { UserInfo } from "./page";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Box,
  FileInput,
  MultiSelect,
  NumberInput,
  Select,
  TextInput,
} from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { Group, Text, Button } from "@mantine/core";
import "@mantine/dates/styles.css";
import AccountInfo from "./components/AccountInfo";

interface Props {
  className?: string;
  /* TODO: Add Additional Props Here */
}

export type TeacherInfo = {
  userInfo: UserInfo;
  credentials: string[];
};
const subjects = [
  { value: "History", label: "History" },
  { value: "English", label: "English" },
  { value: "Math", label: "Math" },
  { value: "Science", label: "General Science" },
  { value: "Biology", label: "Biology" },
  { value: "Chemistry", label: "Chemistry" },
];

export function RegisterInstructor({ className }: Props) {
  const router = useRouter();
  const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);
  const { user, error, isLoading } = useUser();

  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo>({
    userInfo: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      language: "English",
      birthdate: new Date(),
      address: {
        street: "",
        city: "",
        state: "",
        zip: 0,
        country: "",
      },
    },
    credentials: [],
  });
  // TODO: Attach this function to the form like so <form onSubmit={onSubmit}>
  async function onSubmit() {
    setIsLoadingSubmit(true); // Start Loading

    try {


      // TODO: Remove mock delay for testing
      const seconds = 1.5;
      await new Promise(resolve => setTimeout(resolve, seconds * 1000));

      // TODO: Implement API calls with formData (we don't need to worry about this part!)
      router.push("/instructor");
    } catch (error) {
      // Error Handling
      console.error(error);
    } finally {
      setIsLoadingSubmit(false);
    }
  }
  const [files, setFiles] = useState<File | null>(null);

  const handleDrop = (acceptedFiles: File | null) => {
    setFiles(acceptedFiles);
  };

  const updateCredentials = (cred: string[]) => {
    setTeacherInfo({
      ...teacherInfo,
      credentials: cred,
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white shadow-lg rounded-xl">
      {/* Account Information Section */}
      <div className="mb-6">
        <AccountInfo data={teacherInfo} setData={setTeacherInfo} />
      </div>
  
      {/* Credentialed Subjects MultiSelect */}
      <div className="mb-6">
        <MultiSelect
          label="Licensed Teaching Subjects"
          placeholder="Choose Subjects"
          data={subjects}
          onChange={e => updateCredentials(e)}
          clearable
          className="w-full"
        />
      </div>
  
      {/* File Upload Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-700 text-center">Upload Your File</h2>
        <div className="flex justify-center">
          <FileInput
            label="Choose a file to upload"
            placeholder="Pick a file"
            required
            onChange={e => handleDrop(e)} // Handle file selection
            className="w-full sm:w-3/4"
          />
        </div>
      </div>
  
      {/* Submit Button */}
      <div className="flex justify-center">
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md w-full sm:w-auto"
          onClick={onSubmit}
        >
          Submit
        </Button>
      </div>
    </div>
  );
  
}
