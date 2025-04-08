/**
 * CONTACT PAGE
 *
 * Requires:
 * - Contact Form
 *   - Name Field
 *   - Email Field
 *   - Message Field
 *   - Submit Button
 * 
 * Additional Notes:
 * - There is no need for us to edit the onSubmit asynchronous function
 *   in the ContactForm. This will be handled later on by the school.
 * - The Next.js official documentation might be helpful https://nextjs.org/docs/app/api-reference/components/form
 *
 */

import { ContactForm } from "./ContactForm";

export default function Page() {
  
  return (
    <section>
      <h1>Contact Us</h1>
      <ContactForm className="contact-form" />
    </section>
  );
}
