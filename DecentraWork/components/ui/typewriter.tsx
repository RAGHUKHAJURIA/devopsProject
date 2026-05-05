"use client";
import { TypewriterEffectSmooth } from "../ui/typewriter-effect";
import { useRouter } from "next/navigation";
export function TypewriterEffectSmoothEffect() {
  const router = useRouter();
  const words = [
    {
      text: "Freelance ",
    },
    {
      text: "marketplace",
    },
    {
      text: "with",
    },
    {
      text: "SOL",
    },
    {
      text: "Payments.",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];
  return (
    <div className="flex flex-col items-center justify-center  h-[40rem] ">
      <p className="text-zinc-600 dark:text-neutral-200 text-xs sm:text-base  ">
        The road to freelancing starts here
      </p>
      <TypewriterEffectSmooth words={words} />
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
        <button onClick={()=>{router.push('/signin')}} className="w-40 h-10 font-semibold rounded-xl text-white bg-blue-500 hover:bg-blue-700  ">
          View Listing
        </button>
        <button onClick={()=>{router.push('/signup')}} className="w-40 h-10 rounded-xl bg-white text-black border border-black  font-semibold text-sm">
          Join Now
        </button>
      </div>
    </div>
  );
}
