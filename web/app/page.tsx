export default function Page() {
  return (
    <section className="max-w-2xl mx-auto text-center pt-20">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Resume Righting
      </h1>

      <p className="text-lg text-gray-300 mb-2">
        Right writing for the right roles.
      </p>

      <p className="text-sm md:text-base text-gray-400 mb-6">
        From-scratch resume writing for the roles you want.
      </p>

      <p className="text-sm md:text-base text-gray-400 mb-8">
        Your resume isn&apos;t a history document. It&apos;s a product. I don&apos;t fix old resumes, I replace them. We extract your story, identify your value, and build a resume designed to get interviews, not just pass filters.
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
  );
}