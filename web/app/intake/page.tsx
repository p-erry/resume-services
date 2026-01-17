const FORMSPREE_ENDPOINT = "https://formspree.io/f/xwvvvzgg";

export default function IntakePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 bg-black text-white">
      <section className="max-w-xl w-full">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Start Your Resume Righting Intake
        </h1>

        <p className="text-sm md:text-base text-gray-300 mb-6 text-center">
          This is the first step in rewriting your professional story. Share the
          basics below and the details will be sent directly to my inbox.
        </p>

        <form
          action={FORMSPREE_ENDPOINT}
          method="POST"
          className="space-y-4 text-sm md:text-base"
        >
          <div>
            <label className="block mb-1 text-gray-300" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white"
              type="text"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300" htmlFor="linkedin">
              LinkedIn profile (optional)
            </label>
            <input
              id="linkedin"
              name="linkedin"
              className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white"
              type="url"
              placeholder="https://linkedin.com/in/you"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300" htmlFor="roles">
              What roles are you targeting?
            </label>
            <textarea
              id="roles"
              name="roles"
              className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white"
              rows={3}
              placeholder="Example: Senior Program Manager roles in tech-enabled services, or similar."
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300" htmlFor="notes">
              Anything else I should know right now?
            </label>
            <textarea
              id="notes"
              name="notes"
              className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white"
              rows={3}
              placeholder="Timeline, specific job links, career pivots, challenges, etc."
            />
          </div>

          {/* Honeypot anti-bot field (hidden from humans) */}
          <input type="text" name="_gotcha" className="hidden" />

          {/* Optional redirect after success */}
          <input type="hidden" name="_redirect" value="/" />

          <button
            type="submit"
            className="mt-4 inline-flex items-center rounded-lg bg-white px-6 py-2 text-sm font-medium text-black hover:bg-gray-200 transition"
          >
            Submit intake
          </button>

          <p className="text-xs text-gray-500 mt-2">
            You&apos;ll receive a confirmation email once this form is
            submitted. I&apos;ll review your details and follow up with next
            steps and recommended tier.
          </p>
        </form>
      </section>
    </main>
  );
}
