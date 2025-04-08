/**
 * LOGIN PAGE
 *
 * Requires:
 * - Login Form
 *   - Username Field
 *   - Password Field
 *   - Remember Me Checkbox
 *   - Instructor Checkbox
 *   - Submit Button
 *   - Register Page Link "/register"
 * 
 * Additional Notes:
 * - Other than the conditional, is no need for us to edit the onSubmit asynchronous 
 *   function in the ContactForm. This will be handled later on by the school.
 * - The Next.js official documentation might be helpful https://nextjs.org/docs/app/api-reference/components/form
 *
 */

import { Login } from "./Login";

export default function Page() {
  return (
    <section>
      <Login />
    </section>
  );
}
