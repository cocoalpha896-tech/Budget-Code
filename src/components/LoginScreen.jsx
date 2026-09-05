export default function LoginScreen({ onSignIn, error }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-8">
        <div className="mb-1 text-3xl font-semibold tracking-tight text-ink-text">Budget</div>
        <p className="text-sm text-ink-muted">Your numbers, in your own Drive.</p>
      </div>

      <button
        onClick={onSignIn}
        className="w-full max-w-xs rounded-xl bg-gradient-to-r from-accent to-sky-400 py-3.5 text-sm font-semibold text-ink-bg active:opacity-80"
      >
        Sign in with Google
      </button>

      <p className="mt-6 max-w-xs text-xs leading-relaxed text-ink-muted">
        This creates a single file, budget_data.json, in your Drive. Nothing else in
        your Drive is ever read or touched.
      </p>

      {error && (
        <p className="mt-4 max-w-xs text-xs text-status-bad">
          Couldn't sign in: {error.message || 'unknown error'}. Try again.
        </p>
      )}
    </div>
  );
}
