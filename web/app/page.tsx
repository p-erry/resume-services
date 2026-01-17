export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 bg-black text-white">
      <section className="max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Resume Righting
        </h1>

        <p className="text-lg text-gray-300 mb-4">
          Helping job seekers rewrite their professional story for better
          interviews and faster offers.
        </p>

        <p className="text-sm md:text-base text-gray-400 mb-8">
          Your resume is not a history document, it is a product. We refactor
          your narrative, surface the right achievements, and align your story
          to the roles you actually want.
        </p>

        <a
          href="/intake"
          className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-medium text-black hover:bg-gray-200 transition"
        >
          Start intake
        </a>

        <p className="mt-6 text-xs text-gray-500">
          Operated as a focused, human-led resume service, deployed on Vercel.
        </p>
      </section>
    </main>
  );
}
