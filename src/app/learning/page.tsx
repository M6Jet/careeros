import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  return (
    <div>
      <h1>Learning Dashboard</h1>
      {!session ? (
        <div className="card">Sign in via <a href="/api/auth/signin">SSO</a> to load your learning items.</div>
      ) : (
        <div className="card">
          learning items data is served by <code>/api/learning</code>.
          Port the module UI from <code>standalone/CareerOS.html</code> (all view logic is
          framework-agnostic vanilla JS) or build with your component library of choice.
        </div>
      )}
    </div>
  );
}
