// components/dashboard/sections/WelcomeSection.tsx
interface WelcomeSectionProps {
  userName: string;
}

export default function WelcomeSection({ userName }: WelcomeSectionProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">Hello, {userName.split(' ')[0]}! 👋</h1>
      <p className="text-gray-600">
        Here's what's happening with your tasks today
      </p>
    </div>
  );
}