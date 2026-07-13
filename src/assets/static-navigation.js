document.addEventListener("DOMContentLoaded", () => {
  const uniqueLinks = (root) => {
    const used = new Set();
    return [...root.querySelectorAll("a[href]")].filter((link) => {
      const href = link.getAttribute("href");
      const label = link.textContent.trim();
      if (!href || !label || href.startsWith("#") || used.has(href)) return false;
      used.add(href);
      return true;
    });
  };

  document
    .querySelectorAll('button[aria-label*="menu" i], button[aria-label*="navigation" i]')
    .forEach((button) => {
      const container = button.closest("header") || button.closest("nav") || button.parentElement;
      const nav = container?.querySelector("nav") || button.closest("nav");
      if (!container || !nav) return;

      button.setAttribute("aria-expanded", "false");
      button.addEventListener("click", () => {
        let panel = container.querySelector("[data-static-mobile-nav]");
        if (!panel) {
          panel = document.createElement("div");
          panel.dataset.staticMobileNav = "";
          panel.className = "lg:hidden border-t px-6 py-5 flex flex-col gap-4 bg-inherit";
          panel.hidden = true;
          for (const link of uniqueLinks(nav)) {
            const clone = link.cloneNode(true);
            clone.className = "block py-2 font-semibold";
            panel.appendChild(clone);
          }
          container.appendChild(panel);
        }
        panel.hidden = !panel.hidden;
        button.setAttribute("aria-expanded", String(!panel.hidden));
      });
    });

  document.querySelectorAll("nav button:not([aria-label])").forEach((button) => {
    const label = button.textContent.trim().toLowerCase();
    if (!label) return;
    button.setAttribute("aria-expanded", "false");
    button.addEventListener("click", () => {
      let panel = button.parentElement?.querySelector("[data-static-dropdown]");
      if (!panel) {
        const footerGroups = [...document.querySelectorAll("footer div, footer section")];
        const group = footerGroups.find((item) => {
          const heading = item.querySelector(":scope > h2, :scope > h3, :scope > h4");
          return heading && heading.textContent.trim().toLowerCase().includes(label);
        });
        const links = group ? uniqueLinks(group) : [];
        const fallback = label.includes("service")
          ? "/services/"
          : label.includes("shop") || label.includes("tienda") || label.includes("categor")
            ? "/shop/"
            : "/";
        panel = document.createElement("div");
        panel.dataset.staticDropdown = "";
        panel.style.cssText =
          "position:absolute;top:calc(100% + .75rem);left:0;z-index:60;min-width:15rem;padding:.75rem;background:white;color:#1f2937;border:1px solid rgba(0,0,0,.12);box-shadow:0 12px 30px rgba(0,0,0,.14)";
        const choices = links.length
          ? links
          : [Object.assign(document.createElement("a"), { href: fallback, textContent: button.textContent.trim() })];
        for (const link of choices.slice(0, 10)) {
          const clone = link.cloneNode(true);
          clone.style.cssText = "display:block;padding:.65rem .75rem;color:inherit;text-decoration:none";
          panel.appendChild(clone);
        }
        button.parentElement.style.position = "relative";
        button.parentElement.appendChild(panel);
        panel.hidden = true;
      }
      panel.hidden = !panel.hidden;
      button.setAttribute("aria-expanded", String(!panel.hidden));
    });
  });

  document.querySelectorAll("form:not([action])").forEach((form) => {
    const submit = form.querySelector('button[type="submit"], input[type="submit"]');
    if (!submit) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const emailLink = form.querySelector('a[href^="mailto:"]') || document.querySelector('a[href^="mailto:"]');
      if (emailLink) {
        const values = [...new FormData(form)]
          .filter(([, value]) => String(value).trim())
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n");
        const address = emailLink.getAttribute("href").slice(7).split("?")[0];
        location.href = `mailto:${address}?subject=${encodeURIComponent(`${document.title} form request`)}&body=${encodeURIComponent(values)}`;
        return;
      }
      let note = form.querySelector("[data-static-form-note]");
      if (!note) {
        note = document.createElement("p");
        note.dataset.staticFormNote = "";
        note.setAttribute("role", "status");
        note.style.marginTop = "1rem";
        form.appendChild(note);
      }
      note.textContent =
        "This form is not connected yet. Please use the contact page or the contact details shown on this website.";
    });
  });
});
