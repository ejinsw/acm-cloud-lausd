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

import { RegisterInstructor } from "./RegisterInstructor";
import { RegisterStudent } from "./RegisterStudent";

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
  // TODO: Update ternary with some stateful condition (i.e. a switch that toggles a boolean useState())
  return (
    <section>{false ? <RegisterStudent /> : <RegisterInstructor />}</section>
  );
}
