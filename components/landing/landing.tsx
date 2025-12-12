// components/landing-page-new.tsx
import React from "react";
import PrivacyPolicy from "./privacy";
import FeaturesCarousel from "../FeaturesCarousel";
import StartButton, { StartButtonWhite } from "../ui/startButton";
import Image from "next/image";
import CookieNotice from "../CookieNotice";


export default function LandingPageNew() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-white to-indigo-50">

      {/* Hero Section */}
      <section className="px-4 py-20 md:py-32 text-center relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-[#4F46E5] mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="font-medium">Simple. Powerful. Just works.</span>
          </div>

          <h1 className="text-5xl md:text-7xl mb-6 font-bold">
            Task management
            <br />
            <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
              that works for you
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            No complexity. No learning curve. Just simple lists
            and notes that sync in real-time.
            <br />
            Perfect for individuals and teams.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <StartButton/>

            <button className="px-8 py-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 text-lg font-medium transition-all duration-200">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Setup in 30 seconds
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Your data is private
            </div>
          </div>
        </div>

        {/* Hero Image - Improved */}
        <div className="mt-20 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-2xl shadow-2xl border-8 border-white overflow-hidden animate-float bg-white">
              <div className="w-full h-[350px] md:h-[450px] lg:h-[550px] relative">
                <Image
                  src="/hero.png" 
                  alt="CoTask Dashboard Preview"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Carousel Section */}
      <FeaturesCarousel />

      {/* Simplicity Section - Improved */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="order-2 md:order-1">
              <h2 className="text-4xl md:text-5xl mb-6 font-bold leading-tight">
                Built on the principle of
                <span className="text-[#4F46E5]">
                  {" "}
                  simplicity
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                No overwhelming menus. No complex workflows. No
                steep learning curve.
              </p>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Cotask gets out of your way so you can focus on
                what matters: getting things done.
              </p>
              <StartButton />
            </div>

            <div className="relative order-1 md:order-2">
              <div className="rounded-2xl overflow-hidden shadow-2xl border-8 border-white bg-white">
                <div className="w-full aspect-[4/3] relative">
                  <Image
                    src="/note.png"
                    alt="CoTask Simple Interface"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-2xl opacity-50 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Improved */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-3xl p-12 md:p-16 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full animate-ping-slow" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full animate-ping-slower" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl mb-4 font-bold">
                Ready to simplify your workflow?
              </h2>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                Join others who've already made the switch to
                effortless task management
              </p>
              <StartButtonWhite/>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Improved */}
      <section
        id="about"
        className="py-20 bg-gradient-to-br from-gray-50 to-white"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl mb-8 text-center font-bold">
              About Cotask
            </h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                Cotask was built with one core principle:{" "}
                <span className="text-gray-900 font-semibold">
                  simplicity above all else
                </span>
                . We're not trying to be an enterprise project
                management tool or a complex workflow system.
                We're here to make everyday task management
                effortless.
              </p>
              <p>
                Whether you're an individual organizing your
                personal life, coordinating with friends and
                family on household tasks, or collaborating with
                a small team on straightforward projects, Cotask
                is designed for you. We believe that most tasks
                don't need complicated features—they just need
                to get done.
              </p>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
                <h3 className="text-xl text-gray-900 mb-5 font-semibold">
                  Perfect for:
                </h3>
                <ul className="space-y-4">
                  {perfectFor.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-[#4F46E5] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        <span className="text-gray-900 font-semibold">
                          {item.title}:
                        </span>{" "}
                        {item.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <p>
                With real-time synchronization, intuitive
                sharing controls, and a clean interface that
                stays out of your way, Cotask helps you focus on
                what matters most: getting things done without
                the overhead.
              </p>
              <p className="text-gray-900 font-medium italic text-center text-xl pt-4">
                No bloat. No confusion. Just tasks and notes
                that work the way you expect them to.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <PrivacyPolicy />

      {/* Cookie Notice */}
      <CookieNotice />
    </div>
  );
}

// Data arrays
const perfectFor = [
  {
    title: "Individuals",
    description: "managing personal tasks and goals",
  },
  {
    title: "Friends & Family",
    description: "coordinating household chores, events, and shopping lists",
  },
  {
    title: "Small Teams",
    description: "working on simple projects without unnecessary complexity",
  },
];