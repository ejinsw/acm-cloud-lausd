/**
 * STUDENT HOME PAGE
 *
 * Requires:
 * - First Name Field
 * - Last Name Field
 * - Email Field
 * - Parent's Email Field
 * - Phone # Field
 * - Address Field
 * - Birthdate Field (locked)
 * - Grade Field
 * - Password Field
 *
 * Additional Notes:
 *
 */

import { AccountSettings } from "./AccountSettings";

export default function Page() {
  return (
    <section>
      <AccountSettings />
    </section>
  );
}
