import React, { useState, useEffect, useRef } from "react";
import { apiRequest } from "../services/api/api.js";
import {
  useUser,
  useAuth,
  SignInButton,
  UserButton,
} from "@clerk/react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  List,
  Home,
  User,
  X,
  Menu,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

const Navbar = ({
  logosrc = null,
  siteName = "Tech Quiz Master",
  rightcontent = null,
  onNavigate = null,
}) => {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const { isSignedIn } = useUser();
  const { getToken } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // ========================================
  // UPDATE USER ACTIVITY
  // ========================================

  useEffect(() => {
    if (!isSignedIn) return;

    let mounted = true;

    const updateUserActivity = async () => {
      try {
        const token = await getToken();

        if (!mounted || !token) return;

        await apiRequest(
          "/users/activity",
          "POST",
          null,
          token
        );
      } catch (err) {
        console.error(
          "Activity update failed:",
          err
        );
      }
    };

    updateUserActivity();

    const activityInterval =
      setInterval(
        updateUserActivity,
        60000
      );

    return () => {
      mounted = false;
      clearInterval(activityInterval);
    };
  }, [isSignedIn, getToken]);

  // ========================================
  // CLOSE MOBILE MENU ON RESIZE
  // ========================================

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener(
      "resize",
      onResize
    );

    const prevOverflow =
      document.body.style.overflow;

    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener(
        "resize",
        onResize
      );

      document.body.style.overflow =
        prevOverflow || "";
    };
  }, [mobileOpen]);

  // ========================================
  // NAVIGATION
  // ========================================

  const handleNavigate = (href) => {
    setMobileOpen(false);

    if (onNavigate) {
      return onNavigate(href);
    }

    try {
      navigate(href);
    } catch (err) {
      window.location.href = href;
    }
  };

  // ========================================
  // ACTIVE ROUTE
  // ========================================

  const isActive = (path) => {
    return location.pathname === path;
  };

  // ========================================
  // SAVE CLERK TOKEN + REDIRECT
  // ========================================

  const prevSignedInRef =
    useRef(isSignedIn);

  useEffect(() => {
    let mounted = true;

    async function saveTokenAndMaybeRedirect() {
      if (
        !isSignedIn ||
        prevSignedInRef.current ===
          isSignedIn
      ) {
        return;
      }

      try {
        const token = await getToken();

        if (token && mounted) {
          localStorage.setItem(
            "clerkToken",
            token
          );

          console.log(
            "Clerk Token Saved"
          );
        }
      } catch (err) {
        console.error(
          "Failed to get the Clerk token:",
          err
        );
      }

      const path =
        window.location.pathname;

      const shouldRedirect =
        path === "/" ||
        path === "/login" ||
        path === "/signed" ||
        path === "";

      if (shouldRedirect) {
        if (onNavigate) {
          return onNavigate(
            "/dashboard"
          );
        }

        try {
          navigate("/dashboard");
        } catch {
          window.location.href =
            "/dashboard";
        }
      }

      prevSignedInRef.current =
        isSignedIn;
    }

    saveTokenAndMaybeRedirect();

    return () => {
      mounted = false;
    };
  }, [
    isSignedIn,
    getToken,
    navigate,
    onNavigate,
  ]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md">

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="flex h-[76px] items-center justify-between">

          {/* ========================================
              BRAND
          ======================================== */}

          <button
            type="button"
            onClick={() =>
              handleNavigate("/")
            }
            className="group flex items-center gap-3"
          >

            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-200 transition-transform duration-200 group-hover:scale-105">

              <img
                src={
                  logosrc ||
                  "/logoquiz.png"
                }
                alt={`${siteName} logo`}
                className="h-full w-full object-contain"
              />

            </div>

            <div className="hidden text-left sm:block">

              <div className="flex items-center gap-1.5">

                <span className="text-[19px] font-extrabold leading-tight tracking-tight text-slate-900">
                  {siteName}
                </span>

                <ShieldCheck
                  size={16}
                  className="text-indigo-600"
                />

              </div>

              <span className="mt-0.5 block text-[11px] font-medium tracking-wide text-slate-500">
                Admin Panel
              </span>

            </div>

          </button>

          {/* ========================================
              DESKTOP NAVIGATION
          ======================================== */}

          {isSignedIn && (
            <div className="hidden items-center gap-2 md:flex">

              {/* Dashboard */}
              <button
                onClick={() =>
                  handleNavigate(
                    "/dashboard"
                  )
                }
                className={`group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  isActive("/dashboard")
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                }`}
              >
                <Home
                  size={18}
                  className="transition-transform group-hover:scale-105"
                />

                <span>
                  Dashboard
                </span>
              </button>

              {/* List Quiz */}
              <button
                onClick={() =>
                  handleNavigate(
                    "/list"
                  )
                }
                className={`group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  isActive("/list")
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                }`}
              >
                <List
                  size={18}
                  className="transition-transform group-hover:scale-105"
                />

                <span>
                  List Quiz
                </span>
              </button>

            </div>
          )}

          {/* ========================================
              RIGHT SIDE
          ======================================== */}

          <div className="flex items-center gap-3">

            {rightcontent ? (
              <div className="hidden md:flex">
                {rightcontent}
              </div>
            ) : (
              <>
                {/* Signed Out */}
                {!isSignedIn && (
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="hidden items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-50 md:flex"
                    >
                      <User size={17} />
                      Login
                    </button>
                  </SignInButton>
                )}

                {/* Signed In */}
                {isSignedIn && (
                  <div className="rounded-full border border-slate-200 bg-slate-50 p-1 shadow-sm">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox:
                            "h-9 w-9",
                        },
                      }}
                    />
                  </div>
                )}
              </>
            )}

            {/* ========================================
                MOBILE MENU BUTTON
            ======================================== */}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();

                setMobileOpen(
                  (value) => !value
                );
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 md:hidden"
              aria-label={
                mobileOpen
                  ? "Close menu"
                  : "Open menu"
              }
            >
              {mobileOpen ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}
            </button>

          </div>

        </div>
      </div>

      {/* ========================================
          MOBILE MENU
      ======================================== */}

      {mobileOpen && (
        <div className="fixed inset-0 top-[76px] z-40 md:hidden">

          {/* Backdrop */}
          <div
            onClick={() =>
              setMobileOpen(false)
            }
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
          />

          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm border-l border-slate-200 bg-white shadow-2xl">

            <div className="p-5">

              {/* Mobile Brand */}
              <div className="mb-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">

                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
                  <img
                    src={
                      logosrc ||
                      "/logoquiz.png"
                    }
                    alt={`${siteName} logo`}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    {siteName}
                  </p>

                  <p className="text-xs text-slate-500">
                    Admin Panel
                  </p>
                </div>

              </div>

              {/* Navigation */}
              <nav className="space-y-2">

                {isSignedIn && (
                  <>
                    {/* Dashboard */}
                    <button
                      onClick={() =>
                        handleNavigate(
                          "/dashboard"
                        )
                      }
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left font-semibold transition ${
                        isActive(
                          "/dashboard"
                        )
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Home size={19} />

                        Dashboard
                      </span>

                      <ChevronRight
                        size={17}
                      />
                    </button>

                    {/* List */}
                    <button
                      onClick={() =>
                        handleNavigate(
                          "/list"
                        )
                      }
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left font-semibold transition ${
                        isActive(
                          "/list"
                        )
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <List size={19} />

                        List Quiz
                      </span>

                      <ChevronRight
                        size={17}
                      />
                    </button>
                  </>
                )}

                {!isSignedIn && (
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <User size={19} />

                      Login
                    </button>
                  </SignInButton>
                )}

                {isSignedIn && (
                  <div className="mt-5 border-t border-slate-100 pt-5">

                    <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Account
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                      <UserButton />

                      <span className="text-sm font-semibold text-slate-700">
                        My Profile
                      </span>
                    </div>

                  </div>
                )}

              </nav>
            </div>
          </div>
        </div>
      )}

    </nav>
  );
};

export default Navbar;