"use client";

export default function Play() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl font-bold text-red-500 mb-4">
        Pro Racing Game 🏎️
      </h1>
      <iframe
        src="/racing/index.html"
        className="w-[420px] h-[620px] border-4 border-red-500 rounded-xl"
      />
    </main>
  );
}
