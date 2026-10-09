import { useState } from "react";
import {
  AlertCircle, Clapperboard, Eye, EyeOff, Loader2,
  LockKeyhole, LogIn, PlayCircle, UserPlus, Video,
} from "lucide-react";

export function AuthScreen({
  busy,
  error,
  onGuest,
  onTestUser,
  onSignIn,
  onSignUp,
}: {
  busy: boolean;
  error: string;
  onGuest: () => Promise<void>;
  onTestUser: () => Promise<void>;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-shell">
      <section className="auth-intro">
        <div className="auth-brand">
          <span className="auth-brand-mark"><Clapperboard size={24} /></span>
          <span><strong>Jini</strong><small>Stream anything</small></span>
        </div>
        <div className="auth-copy">
          <p className="eyebrow">Your personal streaming service</p>
          <h1>Movies & series. Endless trailers.</h1>
          <p>Browse a rich catalog of films and series, watch instantly, and keep your place across devices.</p>
        </div>
        <div className="auth-trust">
          <span><Video size={16} /> Instant playback</span>
          <span><PlayCircle size={16} /> Resume where you left off</span>
          <span><LockKeyhole size={16} /> Private, self-hosted</span>
        </div>
      </section>

      <main className="auth-panel">
        <section className="auth-card">
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button className={mode === "signin" ? "active" : ""} onClick={() => setMode("signin")} type="button">Sign in</button>
            <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")} type="button">Create account</button>
          </div>

          <div className="auth-card-heading">
            <h2>{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
            <p>{mode === "signin" ? "Sign in to keep watching." : "One account, your whole library of favorites."}</p>
          </div>

          {error ? <div className="auth-error" role="alert"><AlertCircle size={16} /><span>{error}</span></div> : null}

          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (mode === "signin") void onSignIn(email, password);
              else void onSignUp(name, email, password);
            }}
          >
            {mode === "signup" ? (
              <label>
                <span>Full name</span>
                <input autoComplete="name" minLength={2} onChange={(event) => setName(event.target.value)} placeholder="Your name" required value={name} />
              </label>
            ) : null}
            <label>
              <span>Email address</span>
              <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required type="email" value={email} />
            </label>
            <label>
              <span>Password</span>
              <div className="auth-password-field">
                <input autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={mode === "signup" ? 8 : undefined} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" required type={showPassword ? "text" : "password"} value={password} />
                <button aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((current) => !current)} type="button">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
            <button className="primary-button auth-submit" disabled={busy} type="submit">
              {busy ? <Loader2 className="spin" size={17} /> : mode === "signin" ? <LogIn size={17} /> : <UserPlus size={17} />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="auth-divider"><span>or hop straight in</span></div>
          <div className="auth-demo-actions">
            <button className="secondary-button" disabled={busy} onClick={() => void onTestUser()} type="button">Test user</button>
            <button className="secondary-button" disabled={busy} onClick={() => void onGuest()} type="button">Guest preview</button>
          </div>
          <p className="auth-test-hint">Test user login: <code>test@jini.local</code> / <code>JiniTest123!</code></p>
        </section>
      </main>
    </div>
  );
}