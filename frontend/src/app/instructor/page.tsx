/**
 * STUDENT HOME PAGE
 *
 * Requires:
 * - Search Bar
 *   - Search Type Dropdown
 *     - Subject
 *     - Name
 *   - Input Field
 *   - Search Button
 * - Session Cards
 *   - Tutor Name
 *   - Tutor Image(?)
 *   - Tutor Rating
 *   - Subject
 *   - Description
 *   - Meeting Button / Link(?) -- "1 hour"
 *
 * Additional Notes:
 * - After meeting, redirect to student review
 *
 */

import { SearchBar } from "./SearchBar";
import { SessionCard } from "./SessionCard";

export default function Page() {
  return (
    <section>
      <SearchBar />
      <div>
        {/* TODO: Dynamically create a SessionCard for each Session */}
        <SessionCard />
      </div>
    </section>
  );
}
