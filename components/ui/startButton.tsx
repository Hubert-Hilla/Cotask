"use client";

import { redirect } from "next/navigation";

export default function StartButton() {
    return (
          <button onClick={() => redirect("../auth/sign-up")} className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white px-8 py-4 rounded-lg shadow-lg text-lg font-medium transition-all hover:shadow-xl" >
             Get Started Free
            <svg className="ml-2 w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
             </svg>
        </button>
    )
}

export function StartButtonWhite() {
    return (
            <button onClick={() => redirect("../auth/sign-up")} className="bg-white text-[#4F46E5] hover:bg-gray-100 text-lg px-8 py-4 rounded-lg font-medium transition-colors">
                Get Started - It's Free
                <svg className="ml-2 w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
    )
}