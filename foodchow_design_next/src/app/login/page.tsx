// "use client";

// import { useState, type FormEvent } from "react";
// import Link from "next/link";
// import "./page.css";

// /**
//  * /login — FoodChow admin sign-in. Teal branding + food imagery on the left,
//  * email / password form with show-hide + "forgot password" view on the right.
//  * The submit handler is wired as an example; connect it to the real auth API
//  * (see src/hooks/useAuth.ts) when the backend is ready.
//  */
// export default function LoginPage() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [mode, setMode] = useState<"login" | "forgot">("login");
//   const [resetSent, setResetSent] = useState(false);

//   const handleLogin = (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     // const data = new FormData(e.currentTarget);
//     // login({ email: String(data.get("email")), password: String(data.get("password")) });
//   };

//   const handleReset = (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setResetSent(true);
//   };

//   return (
//     <div id="pg-login">
//       {/* ── LEFT: branding + food showcase ── */}
//       <div className="brand-pane">
//         <div className="food-thumbs">
//           <img
//             className="f1"
//             src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80"
//             alt="Pizza"
//           />
//           <img
//             className="f2"
//             src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80"
//             alt="Burger"
//           />
//           <img
//             className="f3"
//             src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"
//             alt="Salad bowl"
//           />
//         </div>

//         <div className="brand-logo">
//           <span className="logo-mark">
//             <i className="fas fa-utensils" />
//           </span>
//           FoodChow
//         </div>

//         <div className="brand-copy">
//           <h1>Run your restaurant from one powerful dashboard.</h1>
//           <p>
//             Menus, orders, marketing and reports — manage it all in one place and
//             keep your kitchen moving.
//           </p>
//         </div>

//         <div className="brand-stats">
//           <div className="stat">
//             <div className="n">12k+</div>
//             <div className="l">Restaurants</div>
//           </div>
//           <div className="stat">
//             <div className="n">3M+</div>
//             <div className="l">Orders served</div>
//           </div>
//           <div className="stat">
//             <div className="n">60+</div>
//             <div className="l">Countries</div>
//           </div>
//         </div>
//       </div>

//       {/* ── RIGHT: form ── */}
//       <div className="form-pane">
//         {/* LOGIN VIEW */}
//         <div className={`form-card ${mode === "login" ? "" : "hidden"}`}>
//           <div className="eyebrow">Welcome back</div>
//           <h2>Sign in to your account</h2>
//           <p className="sub">Enter your credentials to access the admin panel.</p>

//           <form onSubmit={handleLogin}>
//             <div className="field">
//               <label htmlFor="email">Email address</label>
//               <div className="input-wrap">
//                 <i className="far fa-envelope lead" />
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   placeholder="you@restaurant.com"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="field">
//               <label htmlFor="password">Password</label>
//               <div className="input-wrap">
//                 <i className="fas fa-lock lead" />
//                 <input
//                   id="password"
//                   name="password"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="••••••••"
//                   required
//                 />
//                 <button
//                   type="button"
//                   className="toggle-pw"
//                   aria-label={showPassword ? "Hide password" : "Show password"}
//                   onClick={() => setShowPassword((s) => !s)}
//                 >
//                   <i className={showPassword ? "far fa-eye-slash" : "far fa-eye"} />
//                 </button>
//               </div>
//             </div>

//             <div className="row-between">
//               <label className="remember">
//                 <input type="checkbox" name="remember" /> Remember me
//               </label>
//               <button
//                 type="button"
//                 className="link-teal"
//                 onClick={() => {
//                   setMode("forgot");
//                   setResetSent(false);
//                 }}
//               >
//                 Forgot password?
//               </button>
//             </div>

//             <button type="submit" className="btn-submit">
//               <i className="fas fa-right-to-bracket" /> Sign In
//             </button>
//           </form>

//           <div className="divider">or continue with</div>
//           <div className="social-row">
//             <button type="button" className="btn-social">
//               <i className="fab fa-google" /> Google
//             </button>
//             <button type="button" className="btn-social">
//               <i className="fab fa-facebook-f" /> Facebook
//             </button>
//           </div>

//           <div className="signup-note">
//             Don&apos;t have an account? <Link href="#" className="link-teal">Create one</Link>
//           </div>
//         </div>

//         {/* FORGOT PASSWORD VIEW */}
//         <div className={`form-card ${mode === "forgot" ? "" : "hidden"}`}>
//           <button
//             type="button"
//             className="back-link"
//             onClick={() => setMode("login")}
//           >
//             <i className="fas fa-arrow-left" /> Back to sign in
//           </button>
//           <div className="eyebrow">Account recovery</div>
//           <h2>Forgot your password?</h2>
//           <p className="sub">
//             Enter your email and we&apos;ll send you a link to reset it.
//           </p>

//           <div className={`sent-note ${resetSent ? "show" : ""}`}>
//             <i className="far fa-circle-check" style={{ marginTop: "1px" }} />
//             <span>Reset link sent. Check your inbox for next steps.</span>
//           </div>

//           <form onSubmit={handleReset}>
//             <div className="field">
//               <label htmlFor="reset-email">Email address</label>
//               <div className="input-wrap">
//                 <i className="far fa-envelope lead" />
//                 <input
//                   id="reset-email"
//                   name="reset-email"
//                   type="email"
//                   placeholder="you@restaurant.com"
//                   required
//                 />
//               </div>
//             </div>

//             <button type="submit" className="btn-submit">
//               <i className="far fa-paper-plane" /> Send reset link
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { authService } from "@/api/services/auth.service";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import "./page.css";

/**
 * /login — FoodChow admin sign-in. Teal branding + food imagery on the left,
 * email / password form with show-hide + "forgot password" view on the right.
 * The submit handler is wired as an example; connect it to the real auth API
 * (see src/hooks/useAuth.ts) when the backend is ready.
 */
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [resetSent, setResetSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // const handleLogin = (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   // const data = new FormData(e.currentTarget);
  //   // login({ email: String(data.get("email")), password: String(data.get("password")) });
  // };
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    setIsLoading(true);

    try {
      const response = await authService.login({
        email,
        password,
      });

      console.log("Login Response:", response);

      if (response.success && response.data?.length) {
        const shopId = response.data[0].shop_id;

        sessionStorage.removeItem("subdomain");
        sessionStorage.removeItem("subdomain_for");
        sessionStorage.setItem("shop_id", String(shopId));
        sessionStorage.setItem("isLoggedIn", "true");

        router.replace("/setup/my-profile");
      } else {
        setIsLoading(false);
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: response.message || "Invalid Email or Password",
        });
      }
    } catch (error: any) {
      console.error(error);
      setIsLoading(false);

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error?.message || "Something went wrong. Please try again.",
      });
    }
  };
  const handleReset = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetSent(true);
  };

  return (
    <div id="pg-login">
      {isLoading && (
        <div className="login-full-loader">
          <i className="fas fa-spinner fa-spin" />
        </div>
      )}
      {/* ── LEFT: branding + food showcase ── */}
      <div className="brand-pane">
        <div className="food-thumbs">
          <img
            className="f1"
            src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80"
            alt="Pizza"
          />
          <img
            className="f2"
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80"
            alt="Burger"
          />
          <img
            className="f3"
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"
            alt="Salad bowl"
          />
        </div>

        <div className="brand-logo">
          <span className="logo-mark">
            <i className="fas fa-utensils" />
          </span>
          FoodChow
        </div>

        <div className="brand-copy">
          <h1>Run your restaurant from one powerful dashboard.</h1>
          <p>
            Menus, orders, marketing and reports — manage it all in one place
            and keep your kitchen moving.
          </p>
        </div>

        <div className="brand-stats">
          <div className="stat">
            <div className="n">12k+</div>
            <div className="l">Restaurants</div>
          </div>
          <div className="stat">
            <div className="n">3M+</div>
            <div className="l">Orders served</div>
          </div>
          <div className="stat">
            <div className="n">60+</div>
            <div className="l">Countries</div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: form ── */}
      <div className="form-pane">
        {/* LOGIN VIEW */}
        <div className={`form-card ${mode === "login" ? "" : "hidden"}`}>
          <div className="eyebrow">Welcome back</div>
          <h2>Sign in to your account</h2>
          <p className="sub">
            Enter your credentials to access the admin panel.
          </p>

          <form onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <div className="input-wrap">
                <i className="far fa-envelope lead" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@restaurant.com"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <i className="fas fa-lock lead" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="toggle-pw"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                >
                  <i
                    className={showPassword ? "far fa-eye-slash" : "far fa-eye"}
                  />
                </button>
              </div>
            </div>

            <div className="row-between">
              <label className="remember">
                <input type="checkbox" name="remember" /> Remember me
              </label>
              <button
                type="button"
                className="link-teal"
                onClick={() => {
                  setMode("forgot");
                  setResetSent(false);
                }}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? (
                <i className="fas fa-spinner fa-spin" />
              ) : (
                <>
                  <i className="fas fa-right-to-bracket" /> Sign In
                </>
              )}
            </button>
          </form>

          <div className="divider">or continue with</div>
          <div className="social-row">
            <button type="button" className="btn-social">
              <i className="fab fa-google" /> Google
            </button>
            <button type="button" className="btn-social">
              <i className="fab fa-facebook-f" /> Facebook
            </button>
          </div>

          <div className="signup-note">
            Don&apos;t have an account?{" "}
            <Link href="#" className="link-teal">
              Create one
            </Link>
          </div>
        </div>

        {/* FORGOT PASSWORD VIEW */}
        <div className={`form-card ${mode === "forgot" ? "" : "hidden"}`}>
          <button
            type="button"
            className="back-link"
            onClick={() => setMode("login")}
          >
            <i className="fas fa-arrow-left" /> Back to sign in
          </button>
          <div className="eyebrow">Account recovery</div>
          <h2>Forgot your password?</h2>
          <p className="sub">
            Enter your email and we&apos;ll send you a link to reset it.
          </p>

          <div className={`sent-note ${resetSent ? "show" : ""}`}>
            <i className="far fa-circle-check" style={{ marginTop: "1px" }} />
            <span>Reset link sent. Check your inbox for next steps.</span>
          </div>

          <form onSubmit={handleReset}>
            <div className="field">
              <label htmlFor="reset-email">Email address</label>
              <div className="input-wrap">
                <i className="far fa-envelope lead" />
                <input
                  id="reset-email"
                  name="reset-email"
                  type="email"
                  placeholder="you@restaurant.com"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-submit">
              <i className="far fa-paper-plane" /> Send reset link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}