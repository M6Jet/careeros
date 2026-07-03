import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  return (
    <div>
      <h1>Job Tracker</h1>
      {!session ? (
        <div className="card">Sign in via <a href="/api/auth/signin">SSO</a> to load your jobs.</div>
      ) : (
        <div className="card">
          jobs data is served by <code>/api/jobs</code>.
          Port the module UI from <code>standalone/CareerOS.html</code> (all view logic is
          framework-agnostic vanilla JS) or build with your component library of choice.
        </div>
      )}
    </div>
  );
}
