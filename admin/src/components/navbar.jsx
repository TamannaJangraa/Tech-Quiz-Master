import React, { useState, useEffect, useRef } from "react";
import { navbarStyles } from "../assets/dummyStyles";
import {
  useUser,
  useAuth,
  SignInButton,
  UserButton,
} from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { List, Home, User, X, Menu } from "lucide-react";

const Navbar = ({
  logosrc = null,
  siteName = "Tech Quiz Master",
  rightcontent = null,
  onNavigate = null,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  // Close mobile menu on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Close mobile menu on desktop resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", onResize);

    const prevOverflow = document.body.style.overflow;

    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = prevOverflow || "";
    };
  }, [mobileOpen]);

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

  // Save Clerk token after sign in
  const prevSignedInRef = useRef(isSignedIn);

  useEffect(() => {
    let mounted = true;

    async function saveTokenAndMaybeRedirected() {
      if (
        !isSignedIn ||
        prevSignedInRef.current === isSignedIn
      ) {
        return;
      }

      try {
        const token = await getToken();

        if (token && mounted) {
          localStorage.setItem("clerkToken", token);
          console.log("Clerk Token Saved");
        }
      } catch (err) {
        console.error(
          "Failed to get the Clerk token:",
          err
        );
      }

      const path = window.location.pathname;

      const shouldRedirect =
        path === "/" ||
        path === "/login" ||
        path === "/signed" ||
        path === "";

      if (shouldRedirect) {
        if (onNavigate) {
          return onNavigate("/dashboard");
        }

        try {
          navigate("/dashboard");
        } catch {
          window.location.href = "/dashboard";
        }
      }

      prevSignedInRef.current = isSignedIn;
    }

    saveTokenAndMaybeRedirected();

    return () => {
      mounted = false;
    };
  }, [isSignedIn, getToken, navigate, onNavigate]);

  return (
    <nav className={navbarStyles.nav}>
      <div className={navbarStyles.container}>
        <div className={navbarStyles.innerContainer}>

          {/* LOGO + SITE NAME */}
          <div className={navbarStyles.homeButton}>
            <button
              type="button"
              onClick={() => handleNavigate("/")}
              className={navbarStyles.homeButton}
            >
              <div className={navbarStyles.logoWrapper}>
                <img
                  src={logosrc || "/logoquiz.png"}
                  alt={`${siteName} logo`}
                  className={navbarStyles.logoImg}
                  style={{
                    width: "60px",
                    height: "60px",
                    display: "block",
                    objectFit: "contain",
                  }}
                />
              </div>

              <div className={navbarStyles.siteNameWrapper}>
                <span className={navbarStyles.siteName}>
                  {siteName}
                </span>

                <span className={navbarStyles.siteSubtitle}>
                  Learning Platform
                </span>
              </div>
            </button>
          </div>

          {/* DESKTOP NAVIGATION */}
          {isSignedIn && (
            <div className={navbarStyles.desktopCenterContainer}>
              <div className={navbarStyles.desktopCenterInner}>

                <button
                  onClick={() => handleNavigate("/dashboard")}
                  className={navbarStyles.dashboardButton}
                >
                  <Home className={navbarStyles.dashboardIcon} />

                  <span className={navbarStyles.dashboardText}>
                    Dashboard
                  </span>
                </button>

                <button
                  onClick={() => handleNavigate("/list")}
                  className={navbarStyles.listButton}
                >
                  <List className={navbarStyles.listIcon} />

                  <span className={navbarStyles.listText}>
                    List Quiz
                  </span>
                </button>

              </div>
            </div>
          )}

          {/* PROFILE SECTION */}
          <div className="flex items-center gap-3">

            <div className={navbarStyles.desktopRightContent}>
              {rightcontent ? (
                rightcontent
              ) : (
                <div className={navbarStyles.profileGroup}>

                  {!isSignedIn && (
                    <SignInButton mode="modal">
                      <button
                        type="button"
                        className={navbarStyles.profileButton}
                      >
                        <User className={navbarStyles.profileIcon} />

                        <span>My Profile</span>
                      </button>
                    </SignInButton>
                  )}

                  {isSignedIn && (
                    <div className={navbarStyles.profileGroup}>
                      <div className={navbarStyles.profileBlur} />

                      <UserButton
                        appearance={{
                          elements: {
                            avatarBox: "w-9 h-9",
                          },
                        }}
                      />
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <div className={navbarStyles.mobileMenuContainer}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileOpen((s) => !s);
                }}
                className={navbarStyles.hamburgerButton}
              >
                {mobileOpen ? (
                  <X className={navbarStyles.xIcon} />
                ) : (
                  <Menu className={navbarStyles.menuIcon} />
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className={navbarStyles.mobileOverlay}
        >
          <div
            onClick={() => setMobileOpen(false)}
            className={navbarStyles.mobileBackdrop}
          />

          <div
            className={navbarStyles.mobilePanel}
            onClick={(e) => e.stopPropagation()}
          >
            <nav className={navbarStyles.mobileNav}>

              {isSignedIn && (
                <>
                  <button
                    onClick={() =>
                      handleNavigate("/dashboard")
                    }
                    className={navbarStyles.mobileNavButton}
                  >
                    <Home
                      className={navbarStyles.mobileNavIcon}
                    />

                    <div>
                      <div
                        className={
                          navbarStyles.mobileNavItemTitle
                        }
                      >
                        Dashboard
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      handleNavigate("/list")
                    }
                    className={navbarStyles.mobileNavButton}
                  >
                    <List
                      className={navbarStyles.mobileNavIcon}
                    />

                    <div>
                      <div
                        className={
                          navbarStyles.mobileNavItemTitle
                        }
                      >
                        List Quiz
                      </div>
                    </div>
                  </button>
                </>
              )}

              {!isSignedIn && (
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className={navbarStyles.mobileNavButton}
                  >
                    <User
                      className={navbarStyles.mobileNavIcon}
                    />

                    <div>
                      <div
                        className={
                          navbarStyles.mobileNavItemTitle
                        }
                      >
                        Login
                      </div>
                    </div>
                  </button>
                </SignInButton>
              )}

              {isSignedIn && (
                <div
                  className={navbarStyles.mobileNavButton}
                >
                  <UserButton />
                </div>
              )}

            </nav>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;