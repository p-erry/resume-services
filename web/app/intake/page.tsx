export default function IntakePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 bg-black text-white">
      <section className="max-w-xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Start Your Resume Righting Intake
        </h1>

        <p className="text-sm md:text-base text-gray-300 mb-6 text-center">
          This is the first step in rewriting your professional story. Share
          the basics below and we will handle the narrative heavy lifting.
        </p>

        <form className="space-y-4 text-sm md:text-base">
          <div>
            <label className="block mb-1 text-gray-300">Name</label>
            <input
              className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white"
              type="text"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300">Email</label>
            <input
              className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white"
              type="email"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300">
              LinkedIn profile (optional)
            </label>
            <input
              className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white"
              type="url"
              placeholder="https://linkedin.com/in/you"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300">
              What roles are you targeting?
            </label>
            <textarea
              className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white"
              rows={3}
              placeholder="Example: Senior Program Manager roles in tech-enabled services, or similar."
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300">
              Anything else I should know right now?
            </label>
            <textarea
              className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white"
              rows={3}
              placeholder="Timeline, specific job links, career pivots, challenges, etc."
            />
          </div>

          <p className="text-xs text-gray-500">
            File upload, payment, and full workflow will be added soon. For
            now, this serves as a design and routing placeholder.
          </p>

          <button
            type="button"
            className="mt-4 inline-flex items-center rounded-lg bg-white px-6 py-2 text-sm font-medium text-black hover:bg-gray-200 transition"
          >
            Coming soon
          </button>
        </form>
      </section>
    </main>
  );
}
