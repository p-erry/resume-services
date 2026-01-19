import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 bg-black text-white">
      <section className="max-w-2xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Resume Righting</h1>

        <p className="text-lg text-gray-300 mb-4">
          Your resume is not a history document, it is a product.
        </p>

        <p className="text-sm md:text-base text-gray-400 mb-10">
          I do not fix old resumes, I replace them. We start with your story, your impact, and the
          roles you are targeting, then build a new resume from the ground up that reads like a
          product, not a timeline.
        </p>

        <div className="flex flex-col items-center gap-2">
          <Link
            href="/intake"
            className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-medium text-black hover:bg-gray-200 transition"
          >
            Start intake
          </Link>

          <p className="text-xs text-gray-400">
            We’ll make it right.
          </p>
        </div>

        <p className="mt-8 text-xs text-gray-500">
          The intake generates a first draft, then we iterate into a final version.
        </p>
      </section>
    </main>
  );
}
