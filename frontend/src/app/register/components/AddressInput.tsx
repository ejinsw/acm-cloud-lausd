import { NumberInput, Select, TextInput } from "@mantine/core";
import { AccountInfoProps } from "./AccountInfo";
import { StudentInfo } from "../student/page";
import { TeacherInfo } from "../teacher/page";
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


export default function AddressInput<T extends StudentInfo | TeacherInfo>({
    setData,
  }: AccountInfoProps<T>) {
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
