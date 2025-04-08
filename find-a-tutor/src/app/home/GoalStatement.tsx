"use client";

interface Props {
  className?: string;
  /* TODO: Add Additional Props Here */
}

export function GoalStatement({ className }: Props) {
  // TODO: Finish Goal Statement Section

  return (
    <div className={`${className} p-8 text-center`}>
      <h2 className="text-3xl font-semibold">Our Goal</h2>
      <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
    </div>
  );
}
