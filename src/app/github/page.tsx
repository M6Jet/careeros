import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  return (
    <div>
      <h1>GitHub</h1>
      {!session ? (
        <div className="card">Sign in via <a href="/api/auth/signin">SSO</a> to load your GitHub stats.</div>
      ) : (
        <div className="card">
          GitHub stats data is served by <code>/api/github/sync + /api/github/review</code>.
          Port the module UI from <code>standalone/CareerOS.html</code> (all view logic is
          framework-agnostic vanilla JS) or build with your component library of choice.
        </div>
      )}
    </div>
  );
}
