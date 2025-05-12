"use client";

import { useRouter } from "next/navigation";
import { FormEvent, SetStateAction, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  FileInput,
  Group,
  MultiSelect,
  Stepper,
} from "@mantine/core";
import { Button } from "@mantine/core";
import "@mantine/dates/styles.css";
import AccountInfo from "../components/AccountInfo";
import { UserInfo } from "../components/AccountInfo";
import AddressInput from "../components/AddressInput";
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

export default function RegisterInstructor({ className }: Props) {
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
  const [active, setActive] = useState(0);
  
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
  
  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white shadow-lg rounded-xl">
    <Group justify="center">
        <h1 className="font-bold text-blue-700 text-3xl pb-4">Register a Teacher</h1> 
      </Group>
    <Stepper active={active} onStepClick={setActive}>
      <Stepper.Step label="First step" description="Basic Information">
        <div className="mb-6">
          <AccountInfo setData={setTeacherInfo} />
        </div>
      </Stepper.Step>
      <Stepper.Step label="Second step" description="Input Address">
        <AddressInput setData={setTeacherInfo} />
      </Stepper.Step>
      <Stepper.Step label="Credentials" description="Upload your Credentials">
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
          <h2 className="text-lg font-semibold mb-2 text-gray-700 text-center">
            Upload Your File
          </h2>
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
      </Stepper.Step>
      <Stepper.Completed>
        <div className="flex justify-center">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md w-full sm:w-auto"
            onClick={onSubmit}
          >
            Submit
          </Button>
        </div>
      </Stepper.Completed>
    </Stepper>
    <Group justify="center" mt="xl">
      <Button variant="default" onClick={prevStep}>Back</Button>
      <Button onClick={nextStep}>Next step</Button>
    </Group>
    </div>
  );
  
}
