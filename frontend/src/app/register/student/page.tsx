"use client";

import { Button, Group, LoadingOverlay, NumberInput, Stepper } from "@mantine/core";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import AccountInfo, { UserInfo } from "../components/AccountInfo";
import Link from "next/link";
import AddressInput from "../components/AddressInput";
interface Props {
  className?: string;
  /* TODO: Add Additional Props Here */
}
export type StudentInfo = {
  userInfo: UserInfo;
  grade: number;
  schoolName: string;
};

export default function RegisterStudent({ className }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
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
    grade: 0,
    schoolName: "",
  });
  const [active, setActive] = useState(0);

  const [highestStepVisited, setHighestStepVisited] = useState(active);

  const shouldAllowSelectStep = (step: number) =>
    highestStepVisited >= step && active !== step;

  const handleStepChange = (nextStep: number) => {
    const isOutOfBounds = nextStep > 3 || nextStep < 0;

    if (isOutOfBounds) {
      return;
    }

    setActive(nextStep);
    setHighestStepVisited(hSC => Math.max(hSC, nextStep));
  };
  // Allow the user to freely go back and forth between visited steps.

  // TODO: Attach this function to the form like so <form onSubmit={onSubmit}>
  async function onSubmit() {
    setIsLoading(true); // Start Loading

    try {
      // TODO: Remove mock delay for testing
      const res = await fetch('/api/users/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentInfo),
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
      setIsLoading(false); //might not need this
      window.location.href = "home"; //should go to student home
    }
  }
  if(isLoading) return <LoadingOverlay zIndex={900} />
  return (
    <div
      className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white shadow-lg rounded-xl ${className}`}
    >
      <Group justify="center">
        <h1 className="font-bold text-blue-700 text-3xl pb-4">
          Register a Student
        </h1>
      </Group>

      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step
          label="First step"
          description="Create an account"
          allowStepSelect={shouldAllowSelectStep(0)}
        >
          <div className="mb-6">
            <AccountInfo setData={setStudentInfo} />
          </div>
        </Stepper.Step>
        <Stepper.Step
          label="Second step"
          description="Input Address"
          allowStepSelect={shouldAllowSelectStep(1)}
        >
          <AddressInput setData={setStudentInfo} />
        </Stepper.Step>
        <Stepper.Step
          label="School Information"
          description="Input school information"
          allowStepSelect={shouldAllowSelectStep(2)}
        >
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              School Name
            </label>
            <p className="text-sm text-gray-500 mb-2">(Full Name)</p>
            <input
              type="text"
              placeholder="Name"
              value={studentInfo.schoolName}
              onChange={e =>
                setStudentInfo({
                  ...studentInfo,
                  ["schoolName"]: e.target.value,
                })
              }
              className="w-full sm:w-3/4 px-4 py-2 mb-5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <label className="block text-gray-700 font-medium mb-2">
              School Grade Level
            </label>
            <p className="text-sm text-gray-500 mb-2">(1st-12th)</p>
            <input
              type="number"
              placeholder="Current Grade"
              value={studentInfo.grade}
              onChange={e =>
                setStudentInfo({
                  ...studentInfo,
                  ["grade"]: Number(e.target.value),
                })
              }
              min={1}
              max={12}
              className="w-full sm:w-3/4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
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
        <Button variant="default" onClick={() => handleStepChange(active - 1)}>
          Back
        </Button>
        <Button onClick={() => handleStepChange(active + 1)}>Next step</Button>
      </Group>
      <Group justify="center">
        <Link
          className="text-blue-800 text-m font-bold pt-4"
          href={{
            pathname: "/register/teacher",
          }}
        >
          Registering as Instructor? Click here
        </Link>
      </Group>
    </div>
  );
}
