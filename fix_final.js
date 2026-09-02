const fs = require('fs');

const text = fs.readFileSync('src/pages/AuthPage.tsx', 'utf8');
const lines = text.split('\n');

const top_part = lines.slice(0, 287).join('\n');

const bottom_part = `
            {/* ================= SIGN IN MODE ================= */}
            {mode === "signin" && (
              <div key="signin">
                <div className="mb-8 text-center lg:text-left">
                  <h2 className="text-3xl font-medium text-gray-900 tracking-tight">
                    Welcome back
                  </h2>
                  <p className="text-sm text-gray-500 mt-2">
                    Log in to your account
                  </p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}
                  {successMessage && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-700 text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-3 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex justify-end mt-2">
                      <a
                        href="#forgot"
                        onClick={(e) => {
                          e.preventDefault();
                          setError(null);
                          setSuccessMessage(null);
                          setMode("forgot");
                          setResetStep(1);
                        }}
                        className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline transition"
                      >
                        Forgot password?
                      </a>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-medium h-12 rounded-xl transition flex items-center justify-center disabled:opacity-70 gap-2 shadow-sm"
                    >
                      {loading ? "Signing in..." : "Log In"}
                    </button>
                  </div>
                </form>

                <div className="mt-8 text-center pt-6">
                  <p className="text-sm text-gray-500">
                    Don't have an account?{" "}
                    <a
                      href="#signup"
                      onClick={(e) => {
                        e.preventDefault();
                        setError(null);
                        setMode("signup");
                      }}
                      className="text-emerald-600 hover:text-emerald-700 font-medium transition cursor-pointer"
                    >
                      Create account
                    </a>
                  </p>
                </div>
              </div>
            )}

            {/* ================= SIGN UP MODE ================= */}
            {mode === "signup" && (
              <div key="signup">
                <div className="mb-8 text-center lg:text-left">
                  <h2 className="text-3xl font-medium text-gray-900 tracking-tight">
                    Create your account
                  </h2>
                  <p className="text-sm text-gray-500 mt-2">
                    Start your style journey today.
                  </p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Full name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-3 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-3 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="flex items-start pt-2">
                    <label className="flex items-start gap-2 cursor-pointer group mt-1">
                      <input
                        type="checkbox"
                        required
                        className="w-4 h-4 mt-0.5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 bg-white cursor-pointer"
                      />
                      <span className="text-xs text-gray-500 group-hover:text-gray-700 transition leading-snug">
                        I agree to the <span className="text-emerald-600 hover:underline">Terms &amp; Conditions</span> and <span className="text-emerald-600 hover:underline">Privacy Policy</span>
                      </span>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-medium h-12 rounded-xl transition flex items-center justify-center disabled:opacity-70 gap-2 shadow-sm"
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </button>
                  </div>
                </form>

                <div className="mt-8 text-center pt-6">
                  <p className="text-sm text-gray-500">
                    Already have an account?{" "}
                    <a
                      href="#signin"
                      onClick={(e) => {
                        e.preventDefault();
                        setError(null);
                        setMode("signin");
                      }}
                      className="text-emerald-600 hover:text-emerald-700 font-medium transition cursor-pointer"
                    >
                      Log in
                    </a>
                  </p>
                </div>
              </div>
            )}

            {/* ================= FORGOT PASSWORD ================= */}
            {mode === "forgot" && (
              <div key="forgot">
                <div className="mb-8 text-center lg:text-left">
                  <h2 className="text-3xl font-medium text-gray-900 tracking-tight">
                    Recover Access
                  </h2>
                  <p className="text-sm text-gray-500 mt-2">
                    {resetStep === 1
                      ? "Enter your email to receive a secure recovery code."
                      : "Enter the code sent to your email and a new password."}
                  </p>
                </div>

                {resetStep === 1 ? (
                  <form onSubmit={handleRequestReset} className="space-y-4">
                    {error && (
                      <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}
                    {successMessage && (
                      <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-700 text-xs">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                        <span>{successMessage}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Email address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition"
                      />
                    </div>
                    <div className="pt-4 flex flex-col gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-medium h-12 rounded-xl transition flex items-center justify-center disabled:opacity-70 gap-2 shadow-sm"
                      >
                        {loading ? "Sending..." : "Send Recovery Code"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setMode("signin");
                        }}
                        className="w-full bg-transparent hover:bg-gray-50 text-gray-500 border border-gray-200 font-medium h-12 rounded-xl transition flex items-center justify-center cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleConfirmReset} className="space-y-4">
                    {error && (
                      <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Recovery code
                      </label>
                      <input
                        type="text"
                        required
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        New password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-3 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="pt-4 flex flex-col gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-medium h-12 rounded-xl transition flex items-center justify-center disabled:opacity-70 gap-2 shadow-sm"
                      >
                        {loading ? "Resetting..." : "Reset Password"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setResetStep(1);
                          setResetCode("");
                        }}
                        className="w-full bg-transparent hover:bg-gray-50 text-gray-500 border border-gray-200 font-medium h-12 rounded-xl transition flex items-center justify-center"
                      >
                        Back to Email
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          <div className="mt-12 pt-6 flex justify-between items-center text-[10px] text-gray-400 max-w-[420px] mx-auto w-full">
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure & Private
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> AI Personalization
              </span>
            </div>
            <button
              type="button"
              onClick={fillDemoSupervisor}
              className="hover:text-emerald-500 transition-colors underline decoration-dotted"
            >
              Demo Supervisor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
`

fs.writeFileSync('src/pages/AuthPage.tsx', top_part + '\n' + bottom_part);
