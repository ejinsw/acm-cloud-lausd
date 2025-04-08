import { ChangeEvent, Dispatch, SetStateAction } from "react";
import { UserInfo } from "../page";
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
import { TeacherInfo } from "../RegisterInstructor";
import { StudentInfo } from "../RegisterStudent";
interface AccountInfoProps<T extends StudentInfo | TeacherInfo> {
  data: T;
  setData: Dispatch<SetStateAction<T>>;
}
const countries = [
  { value: "USA", label: "United States of America" },
  { value: "Canada", label: "Canada" },
];
const usStates = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

export default function AccountInfo<T extends StudentInfo | TeacherInfo>({
  data,
  setData,
}: AccountInfoProps<T>) {
  const setDataValue = (input: ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [input.target.name]: input.target.value });
  };

  const updateDataManually = (name: string, value: (Date | null) | string) => {
    setDataValue({
      target: { name, value },
    } as ChangeEvent<HTMLInputElement>);
  };
  const updateAddress = (filter: string, value: string | number | null) => {
    setData(prevData => ({
      ...prevData,
      userInfo: {
        ...prevData.userInfo,
        address: {
          ...prevData.userInfo.address,
          [filter]: value ?? "",
        },
      },
    }));
  };
  return (
    <>
      <TextInput label="First Name" placeholder="John" />
      <TextInput label="Last Name" placeholder="Doe" />
      <Box maw={300} mx="auto">
        <DateInput
          label="Select your birthdate"
          placeholder="YYYY-MM-DD"
          value={data.userInfo.birthdate}
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
        value={data.userInfo.phoneNumber}
        name="phoneNumber"
        onChange={setDataValue}
      />

      <TextInput
        label="Street Address"
        name="street"
        onChange={e => updateAddress("street", e.target.value)}
        placeholder="123 StreetName Ave."
      />
      <TextInput
        label="City"
        name="city"
        onChange={e => updateAddress("city", e.target.value)}
        placeholder="Los Angeles"
      />
      <NumberInput
        label="Zipcode"
        name="zipcode"
        onChange={e => updateAddress("zipcode", e)}
      />
      <Select
        label="Select your state"
        name="state"
        placeholder="Pick one"
        data={usStates}
        onChange={e => updateAddress("state", e)}
        searchable
        clearable
      />
      <Select
        label="Select your country"
        name="country"
        placeholder="Country"
        data={countries}
        onChange={e => updateAddress("country", e)}
        clearable
      />
    </>
  );
}
