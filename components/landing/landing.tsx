// components/landing-page-new.tsx
import React from "react";
import PrivacyPolicy from "./privacy";
import FeaturesCarousel from "../FeaturesCarousel";
import StartButton, { StartButtonWhite } from "../ui/startButton";
import Image from "next/image";


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
            <span>Simple. Powerful. Just works.</span>
          </div>

          <h1 className="text-5xl md:text-7xl mb-6">
            Task management
            <br />
            <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
              that works for you
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            No complexity. No learning curve. Just simple lists
            and notes that sync in real-time.
            <br />
            Perfect for individuals and teams.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <StartButton/>

            <button className="px-8 py-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-lg font-medium transition-colors">
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

        {/* Hero Image */}
   <div className="mt-20 relative z-10">
  <div className="max-w-6xl mx-auto">
    <div className="rounded-2xl shadow-2xl border-6 border-white overflow-hidden animate-float">
      <div className="w-full h-[350px] md:h-[450px] lg:h-[550px] relative">
        <Image
          src="/hero.png" 
          alt="CoTask Dashboard Preview"
          fill
          className="object-contain"
          priority
          sizes="100vw"
        />
      </div>
    </div>
  </div>
</div>


      </section>

      {/* Features Carousel Section */}
      <FeaturesCarousel />

      {/* Simplicity Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl md:text-5xl mb-6">
                Built on the principle of
                <span className="text-[#4F46E5]">
                  {" "}
                  simplicity
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                No overwhelming menus. No complex workflows. No
                steep learning curve.
              </p>
              <p className="text-xl text-gray-600 mb-8">
                Cotask gets out of your way so you can focus on
                what matters: getting things done.
              </p>
              <StartButton />
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <div className="w-full h-80 relative">
                  <Image
                    src="/note.png" // or any image you want
                    alt="CoTask Simple Interface"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-3xl p-12 md:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full animate-ping-slow" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full animate-ping-slower" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl mb-4">
                Ready to simplify your workflow?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join others who've already made the switch to
                effortless task management
              </p>
              <StartButtonWhite/>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="py-20 bg-gradient-to-br from-gray-50 to-white"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl mb-8 text-center">
              About Cotask
            </h2>
            <div className="space-y-6 text-lg text-gray-600">
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
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8">
                <h3 className="text-xl text-gray-900 mb-4">
                  Perfect for:
                </h3>
                <ul className="space-y-3">
                  {perfectFor.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#4F46E5] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        <span className="text-gray-900 font-medium">
                          {item.title}
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
              <p className="text-gray-900 italic">
                No bloat. No confusion. Just tasks and notes
                that work the way you expect them to.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <PrivacyPolicy />
    </div>
  );
}

// Data arrays
const features = [
  {
    icon: UsersIcon,
    title: "Real-time Sync",
    description: "See changes instantly as your team collaborates. No refresh needed.",
    color: "from-indigo-500 to-purple-600",
  },
  {
    icon: CheckCircleIcon,
    title: "Lists & Notes",
    description: "Create todo lists or rich text notes with embedded tasks.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: ShareIcon,
    title: "Easy Sharing",
    description: "Share with anyone. Control who can view or edit.",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: RotateCwIcon,
    title: "Recurring Tasks",
    description: "Set it once. Never forget your regular tasks again.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: ZapIcon,
    title: "Blazing Fast",
    description: "Optimized for speed. Works offline. Syncs when online.",
    color: "from-blue-500 to-cyan-600",
  },
];

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


// SVG Icon Components
function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 5.197a4 4 0 00-5.197-5.197" />
    </svg>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ShareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

function RotateCwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function ZapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}