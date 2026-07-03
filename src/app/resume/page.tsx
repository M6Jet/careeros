import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  return (
    <div>
      <h1>Resume Manager</h1>
      {!session ? (
        <div className="card">Sign in via <a href="/api/auth/signin">SSO</a> to load your resumes.</div>
      ) : (
        <div className="card">
          resumes data is served by <code>/api/resumes + /api/resumes/[id]/optimize</code>.
          Port the module UI from <code>standalone/CareerOS.html</code> (all view logic is
          framework-agnostic vanilla JS) or build with your component library of choice.
        </div>
      )}
    </div>
  );
}
