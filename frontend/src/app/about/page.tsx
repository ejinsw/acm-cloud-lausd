/**
 * ABOUT PAGE
 *
 * Requires:
 * - Meet the Team Section
 *   - Reusable Profile Component
 *     - Image
 *     - Name
 * - Mission Statement Section
 *   - Title
 *   - Text
 * 
 * Additional Notes:
 * - For any long text sections, use lorem ipsum placeholder text
 *
 */

import { MissionStatement } from "./MissionStatement";
import { Profile } from "./Profile";

export default function Page() {
  return (
    <section>
      <MissionStatement />
      <Profile />
      {/* TODO: Add Additional Profiles */}
    </section>
  );
}
