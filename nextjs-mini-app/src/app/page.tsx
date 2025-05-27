import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">Conflict Resolution Onboarding</h1>
        <p className="text-lg mb-8">
          Welcome! Please answer a few questions to help us understand your situation.
        </p>
        <Link href="/onboarding" legacyBehavior>
          <a className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Start Onboarding
          </a>
        </Link>
      </div>
    </main>
  );
}
