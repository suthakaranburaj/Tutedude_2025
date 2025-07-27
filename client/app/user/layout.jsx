"use client";

export default function UserLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="w-full py-4 px-8 bg-white dark:bg-gray-800 shadow-md mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Portal</h1>
      </header>
      <main className="max-w-5xl mx-auto px-4">{children}</main>
    </div>
  );
} 