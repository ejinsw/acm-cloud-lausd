import { ChangeEvent, Dispatch, SetStateAction } from "react";

import {
  Box,
  Button,
  InputBase,
  NumberInput,
  Select,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IMaskInput } from "react-imask";
import { StudentInfo } from "../student/page";
import { TeacherInfo } from "../teacher/page";

export interface AccountInfoProps<T extends StudentInfo | TeacherInfo> {
  setData: Dispatch<SetStateAction<T>>;
}
export type AddressInfo = {
  street: string;
  city: string;
  state: string;
  zip: number;
  country: string;
};

export type UserInfo = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  language: string;
  birthdate: Date | null;
  address: AddressInfo;
};

export default function AccountInfo<T extends StudentInfo | TeacherInfo>({
  setData,
}: AccountInfoProps<T>) {
  const setDataValue = (input: ChangeEvent<HTMLInputElement>) => {
    setData(prevData => ({ ...prevData, [input.target.name]: input.target.value }));
  };

  const updateDataManually = (name: string, value: (Date | null) | string) => {
    setDataValue({
      target: { name, value },
    } as ChangeEvent<HTMLInputElement>);
  };
 
  return (
    <>
      <TextInput label="First Name" placeholder="John" />
      <TextInput label="Last Name" placeholder="Doe" />
      <Box maw={300} mx="auto" className="py-5">
        <DateInput
          label="Select your birthdate"
          placeholder="YYYY-MM-DD"
          onChange={e => updateDataManually("birthdate", e)}
          minDate={new Date(20, 0)}
          maxDate={new Date()} // Prevents future dates
          clearable
        />
      </Box>
      <InputBase
        label="Phone Number"
        component={IMaskInput}
        mask="+1 (000) 000-0000"
        placeholder="+1 (000) 000-0000"
        name="phoneNumber"
        onChange={setDataValue}
      />

    </>
  );
}
