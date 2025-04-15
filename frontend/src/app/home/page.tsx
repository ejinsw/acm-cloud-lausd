/**
 * HOME PAGE
 *
 * Requires:
 * - Hero Section (i.e. Headline)
 *   - Title -- "LAUSD Tutors"
 *   - Subtitle -- "Connecting students and instructors at LAUSD"
 *   - Background Image (use something from https://unsplash.com/ or other fair use photos)
 * - Goal Statement Section
 *   - Title
 *   - Text
 *
 * Additional Notes:
 * - For any long text sections, use lorem ipsum placeholder text
 *
 */

import { AccountManagement } from "./components/AccountManagement";
import { GoalStatement } from "./GoalStatement";
import { Hero } from "./Hero";

export default function Page() {
  return (
    <section>
      <AccountManagement />
      <Hero />
      <h1> hello world</h1>
      <GoalStatement />
    </section>
  );
}
