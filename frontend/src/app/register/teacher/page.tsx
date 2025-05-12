"use client";

import { useRouter } from "next/navigation";
import { FormEvent, SetStateAction, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  FileInput,
  Group,
  LoadingOverlay,
  MultiSelect,
  Stepper,
} from "@mantine/core";
import { Button } from "@mantine/core";
import "@mantine/dates/styles.css";
import AccountInfo from "../components/AccountInfo";
import { UserInfo } from "../components/AccountInfo";
import AddressInput from "../components/AddressInput";
import Link from "next/link";
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
  const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);

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
  const [file, setFile] = useState<File | null>(null);

  const [active, setActive] = useState(0);
  
  const [highestStepVisited, setHighestStepVisited] = useState(active);

  // TODO: Attach this function to the form like so <form onSubmit={onSubmit}>
  async function onSubmit() {
    setIsLoadingSubmit(true); // Start Loading

    try {
      // TODO: Remove mock delay for testing
      const res = await fetch('/api/users/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...teacherInfo, file: file}),
      });
    
      const data = await res.json();
      if(res.status != 400)
      {
        throw new Error("Couldn't create account");
        
      }
      console.log(res.status);
      console.log(data.message);
    } catch (error) {
      // Error Handling
      console.error(error);
    } finally {
      //move to home page
      setIsLoadingSubmit(false); //might not need this
      window.location.href = "home"; //should go to student home
    }
  }
  if(isLoadingSubmit) return <LoadingOverlay zIndex={900} />
  
  
  const handleDrop = (acceptedFile: File | null) => {
    setFile(acceptedFile);
  };

  const updateCredentials = (cred: string[]) => {
    setTeacherInfo({
      ...teacherInfo,
      credentials: cred,
    });
  };
  

  const handleStepChange = (nextStep: number) => {
    const isOutOfBounds = nextStep > 3 || nextStep < 0;

    if (isOutOfBounds) {
      return;
    }

    setActive(nextStep);
    setHighestStepVisited((hSC) => Math.max(hSC, nextStep));
  };

  // Allow the user to freely go back and forth between visited steps.
  const shouldAllowSelectStep = (step: number) => highestStepVisited >= step && active !== step;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white shadow-lg rounded-xl">
    <Group justify="center">
        <h1 className="font-bold text-blue-700 text-3xl pb-4">Register a Teacher</h1> 
      </Group>
    <Stepper active={active} onStepClick={setActive}>
      <Stepper.Step label="First step" description="Basic Information" allowStepSelect={shouldAllowSelectStep(0)}>
        <div className="mb-6">
          <AccountInfo setData={setTeacherInfo} />
        </div>
      </Stepper.Step>
      <Stepper.Step label="Second step" description="Input Address" allowStepSelect={shouldAllowSelectStep(1)}>
        <AddressInput setData={setTeacherInfo} />
      </Stepper.Step>
      <Stepper.Step label="Credentials" description="Upload your Credentials" allowStepSelect={shouldAllowSelectStep(2)}>
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
      <Button variant="default" onClick={() => handleStepChange(active - 1)}>Back</Button>
      <Button onClick={() => handleStepChange(active + 1)}>Next step</Button>
    </Group>
    <Group justify="center">
        <Link
          className="text-blue-800 text-m font-bold pt-4"
          href={{
            pathname: "/register/student",
          }}
        >
          Registering as Student? Click here
        </Link>
      </Group>
    </div>
  );
  
}
