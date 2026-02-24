import { useState } from "react";
import { useAuth } from "../hooks/UseAuth";
import { useNavigate, Link } from "react-router-dom";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password, passwordConfirmation);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[var(--clr-primary-a10)] via-[var(--clr-primary-a20)] to-[var(--clr-primary-a40)] flex">

      {/* Background Shapes */}
      <div className="absolute w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -top-20 -left-20"></div>
      <div className="absolute w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-3xl bottom-[-150px] right-[-150px]"></div>
      <div className="absolute w-[400px] h-[400px] bg-white/10 rounded-full blur-2xl top-1/3 left-1/4"></div>
      <div className="absolute w-[300px] h-[300px] bg-blue-400/20 rounded-full blur-2xl top-10 right-1/4"></div>

      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>

      {/* Content Layer */}
      <div className="relative z-10 flex w-full">

        {/* LEFT SIDE TEXT */}
        <div className="hidden lg:flex w-1/2 items-center justify-center px-20 text-white">
          <div>
            <h1 className="text-4xl font-bold mb-6">
              Join TaskFlow
            </h1>
            <p className="text-lg opacity-90 max-w-md">
              Create your account and start managing your tasks
              with clarity and precision.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="flex w-full lg:w-1/2 items-center justify-center p-8">

          <div className="w-full max-w-md backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-xl p-8 hover:scale-105 transition duration-300">

            <h2 className="text-3xl font-semibold text-center mb-6 text-white">
              Register
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="block text-sm text-white mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm text-white mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm text-white mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm text-white mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)]"
                  value={passwordConfirmation}
                  onChange={(e) =>
                    setPasswordConfirmation(e.target.value)
                  }
                />
              </div>

              {error && (
                <div className="text-sm text-[#b13535] bg-[#e29d9d]/20 p-2 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-xl text-white font-semibold bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)] transition duration-300 disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Register"}
              </button>

              <p className="text-sm text-center text-white mt-4">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="underline hover:text-gray-200"
                >
                  Login
                </Link>
              </p>

            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;