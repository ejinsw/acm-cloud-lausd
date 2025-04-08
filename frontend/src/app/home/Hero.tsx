"use client";

interface Props {
  className?: string;
}

export function Hero({ className }: Props) {
  return (
    <div className={`relative h-screen bg-cover bg-center text-white ${className}`}
      style={{
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <nav className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md py-4 px-6 flex justify-end space-x-4 z-50 border-b border-white">
        <button className="text-white opacity-50 hover:opacity-100 transition-opacity duration-300 px-4 py-2">
          Button 1
        </button>
        <button className="text-white opacity-50 hover:opacity-100 transition-opacity duration-300 px-4 py-2">
          Button 2
        </button>
        <button className="text-white opacity-50 hover:opacity-100 transition-opacity duration-300 px-4 py-2">
          Button 3
        </button>
        <button className="text-white opacity-50 hover:opacity-100 transition-opacity duration-300 px-4 py-2">
          Button 4
        </button>
      </nav>


      <div className="relative flex flex-col items-center justify-center h-full text-center px-6">
        <h1 className="text-5xl font-bold">LAUSD Tutors</h1>
        <p className="text-xl mt-4">Connecting students and instructors at LAUSD</p>
      </div>
    </div>
  );
}
