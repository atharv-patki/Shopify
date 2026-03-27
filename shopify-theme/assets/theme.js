"use strict";
(() => {
  // src/theme.ts
  var root = document.documentElement;
  root.classList.add("js-enabled");
  var qs = (selector, parent = document) => {
    return parent.querySelector(selector);
  };
  var qsa = (selector, parent = document) => {
    return Array.from(parent.querySelectorAll(selector));
  };
  var normalizePath = (path) => {
    const trimmed = path.replace(/\/+$/, "");
    return trimmed.length ? trimmed : "/";
  };
  var normalizeHash = (hash) => {
    return hash.trim().toLowerCase();
  };
  var initHeaderBehavior = () => {
    const header = qs(".site-header");
    if (!header) {
      return;
    }
    const syncHeader = () => {
      header.classList.toggle("scrolled", window.scrollY > 12);
    };
    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
  };
  var initActiveNavigation = () => {
    const currentPath = normalizePath(window.location.pathname);
    const currentHash = normalizeHash(window.location.hash);
    const navLinks = qsa(".main-nav a");
    navLinks.forEach((link) => {
      try {
        const href = link.getAttribute("href");
        if (!href || href.startsWith("#")) {
          return;
        }
        const linkUrl = new URL(href, window.location.origin);
        const linkPath = normalizePath(linkUrl.pathname);
        const linkHash = normalizeHash(linkUrl.hash);
        if (linkHash.length > 0) {
          if (linkPath === currentPath && linkHash === currentHash) {
            link.classList.add("is-active");
            link.setAttribute("aria-current", "page");
          }
          return;
        }
        const isExact = linkPath === currentPath;
        const isCollectionMatch = linkPath === "/collections" && (currentPath.startsWith("/collections") || currentPath === "/search");
        if (isExact || isCollectionMatch) {
          link.classList.add("is-active");
          link.setAttribute("aria-current", "page");
        }
      } catch (e) {
      }
    });
  };
  var initMobileMenu = () => {
    const menuToggle = qs("[data-mobile-toggle]");
    const menuDrawer = qs("[data-mobile-drawer]");
    if (!menuToggle || !menuDrawer) {
      return;
    }
    const closeDrawer = () => {
      menuDrawer.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    };
    const openDrawer = () => {
      menuDrawer.classList.add("open");
      menuToggle.setAttribute("aria-expanded", "true");
    };
    menuToggle.addEventListener("click", () => {
      const isOpen = menuDrawer.classList.contains("open");
      if (isOpen) {
        closeDrawer();
        return;
      }
      openDrawer();
    });
    qsa("a", menuDrawer).forEach((link) => {
      link.addEventListener("click", closeDrawer);
    });
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!target) {
        return;
      }
      if (!menuDrawer.contains(target) && !menuToggle.contains(target)) {
        closeDrawer();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    });
  };
  var initHeroVisualEffects = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const heroVisual = qs("[data-hero-visual]");
    if (!heroVisual) {
      return;
    }
    const maxTilt = 5;
    heroVisual.addEventListener("mousemove", (event) => {
      const rect = heroVisual.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / rect.width;
      const relY = (event.clientY - rect.top) / rect.height;
      const rotateY = (relX - 0.5) * (maxTilt * 2);
      const rotateX = (0.5 - relY) * (maxTilt * 2);
      heroVisual.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    });
    heroVisual.addEventListener("mouseleave", () => {
      heroVisual.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
    });
  };
  var initFAQ = () => {
    const faqItems = qsa(".faq-item");
    if (!faqItems.length) {
      return;
    }
    const syncIcon = (item) => {
      const icon = qs("[data-faq-icon]", item);
      if (icon) {
        icon.textContent = item.open ? "-" : "+";
      }
    };
    faqItems.forEach((item) => {
      syncIcon(item);
      item.addEventListener("toggle", () => {
        if (item.open) {
          faqItems.forEach((other) => {
            if (other !== item) {
              other.open = false;
              syncIcon(other);
            }
          });
        }
        syncIcon(item);
      });
    });
  };
  var initRevealEffects = () => {
    const targets = [...qsa(".section-shell"), ...qsa(".cta-banner")];
    if (!targets.length) {
      return;
    }
    targets.forEach((element) => {
      element.classList.add("reveal-section");
    });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((element) => {
        element.classList.add("in-view");
      });
      return;
    }
    if (!("IntersectionObserver" in window)) {
      targets.forEach((element) => {
        element.classList.add("in-view");
      });
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -6% 0px"
      }
    );
    targets.forEach((target) => {
      observer.observe(target);
    });
  };
  var initFormExperience = () => {
    const forms = qsa('form[action*="/contact"], form[action*="/account/contact"]');
    forms.forEach((form) => {
      form.addEventListener("submit", () => {
        root.style.scrollBehavior = "smooth";
      });
    });
  };
  var initSmartAnchorRouting = () => {
    const actionLinks = qsa(".button, .header-action-link, .main-nav a, .mobile-drawer__content a");
    actionLinks.forEach((link) => {
      const rawHref = (link.getAttribute("href") || "").trim();
      if (!rawHref.length || rawHref === "#") {
        return;
      }
      try {
        const resolved = new URL(rawHref, window.location.origin);
        if (!resolved.hash) {
          return;
        }
        const targetPath = normalizePath(resolved.pathname);
        const currentPath = normalizePath(window.location.pathname);
        if (targetPath !== currentPath) {
          return;
        }
        link.addEventListener("click", (event) => {
          const target = document.querySelector(resolved.hash);
          if (!target) {
            return;
          }
          event.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          if (window.history && window.history.pushState) {
            window.history.pushState(null, "", resolved.hash);
          }
        });
      } catch (e) {
      }
    });
  };
  var bootstrap = () => {
    initHeaderBehavior();
    initActiveNavigation();
    initMobileMenu();
    initHeroVisualEffects();
    initFAQ();
    initRevealEffects();
    initFormExperience();
    initSmartAnchorRouting();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();
