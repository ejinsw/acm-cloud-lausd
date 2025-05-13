/**
 * REGISTER PAGE
 *
 * Requires:
 * - Student Register Form
 *   - First Name Field
 *   - Last Name Field
 *   - Email Field (optional)
 *   - Parent's Email Field (required)
 *   - Phone # Field
 *   - Address Field
 *   - Birthdate Field
 *   - Grade Field
 *   - Password Field
 *   - Submit Button
 *   - Login Page Link "/login"
 * - Instructor Register Form
 *   - First Name Field
 *   - Last Name Field
 *   - Email Field
 *   - Phone # Field
 *   - Address Field
 *   - Birthdate Field
 *   - Grade Field
 *   - Password Field
 *   - Credential File Field
 *   - Submit Button
 *   - Login Page Link "/login"
 *
 * Additional Notes:
 * - Verify that all fields are valid, otherwise don't let them submit!
 * - There is no need for us to edit the onSubmit asynchronous function
 *   in the ContactForm. This will be handled later on by the school.
 * - The Next.js official documentation might be helpful https://nextjs.org/docs/app/api-reference/components/form
 *
 */

"use client";

import { RegisterInstructor } from "./RegisterInstructor";
import { RegisterStudent } from "./RegisterStudent";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Container, Loader, Text, Center, SegmentedControl, Box } from "@mantine/core";
import { useState } from "react";

// export type InfoProp = {
//   addressHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
//   countryHandler: (
//     newValue: SingleValue<string>,
//     actionMeta: ActionMeta<string>
//   ) => void;
// };
// export type CountryProp = {
//   countryHandler: (
//     newValue: SingleValue<string>,
//     actionMeta: ActionMeta<string>
//   ) => void;
// };

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

export default function Page() {
  const [isStudent, setIsStudent] = useState(true);
  const { isLoading, error } = useUser();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container size="sm" py="xl">
        <Text c="red" ta="center">
          Error loading user data. Please try again later.
        </Text>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Box mb="xl" ta="center">
        <SegmentedControl
          value={isStudent ? "student" : "instructor"}
          onChange={(value) => setIsStudent(value === "student")}
          data={[
            { label: "Student Registration", value: "student" },
            { label: "Instructor Registration", value: "instructor" },
          ]}
        />
      </Box>
      <section>
        {isStudent ? <RegisterStudent /> : <RegisterInstructor />}
      </section>
    </Container>
  );
}
