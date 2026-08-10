(function () {
  const IS_MARKING_PAGE =
    window.location.pathname.toLowerCase().endsWith("/marking.html") ||
    window.location.pathname.toLowerCase().endsWith("marking.html");

  const AI_URLS = {
    chatgpt: "https://chat.openai.com/",
    claude: "https://claude.ai/",
    gemini: "https://gemini.google.com/app"
  };

  function buildStemInteractPrompt(questionLabel, pdfUrl) {
    return [
      `This is an SQA Higher (Scottish Qualifications Authority) past-paper exam question.`,
      ``,
      `Question: ${questionLabel}`,
      `PDF: ${pdfUrl}`,
      ``,
      `Please use the PDF above as the source of the question, including any diagram, graph, table, formula or data shown there.`,
      ``,
      `Task: Give strategy hints first.`,
      `Do NOT give the full worked solution unless I explicitly ask for it.`,
      ``,
      `What I want:`,
      `- A short strategy for each part of the question.`,
      `- The key idea needed to start each part.`,
      `- Common traps to avoid.`,
      `- The minimum working needed to earn method marks.`,
      `- Clear reference to any relevant diagram or information in the PDF.`,
      ``,
      `Style: concise, student-friendly, and exam-focused.`
    ].join("\n");
  }

  async function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  function toAbsoluteUrl(href) {
    return new URL(href, window.location.origin).toString();
  }

  function closeAllDropdowns() {
    document.querySelectorAll(".ai-dd.open").forEach((d) => d.classList.remove("open"));
  }

  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  function showCopyToast() {
    let toast = document.getElementById("copyToast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "copyToast";
      toast.className = "copy-toast";
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <strong>Prompt copied.</strong><br>
      Now paste it into your chosen AI.
    `;

    toast.classList.add("show");

    clearTimeout(toast.hideTimeout);
    toast.hideTimeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 5000);
  }

  function makeDropdown(label, pdfUrl) {
    const wrap = document.createElement("span");
    wrap.className = "ai-dd";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "button ai-dd-btn";
    btn.textContent = "Ask AI ▾";

    const menu = document.createElement("div");
    menu.className = "ai-dd-menu";

    function makeItem(name, key) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "ai-dd-item";
      item.textContent = name;

      item.addEventListener("click", async () => {
        try {
          closeAllDropdowns();

          const prompt = buildStemInteractPrompt(label, pdfUrl);
          await copyTextToClipboard(prompt);

          
			
			showCopyToast();

const url = AI_URLS[key];

if (isIOS()) {
  setTimeout(() => {
    window.location.href = url;
  }, 1200);
} else {
  setTimeout(() => {
    window.open(url, "_blank", "noopener");
  }, 800);
}
			
			
        } catch (e) {
          alert("Sorry - copying failed on this browser. Please copy manually.");
        }
      });

      return item;
    }

    menu.appendChild(makeItem("ChatGPT", "chatgpt"));
    menu.appendChild(makeItem("Claude", "claude"));
    menu.appendChild(makeItem("Gemini", "gemini"));

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const willOpen = !wrap.classList.contains("open");
      closeAllDropdowns();
      if (willOpen) wrap.classList.add("open");
    });

    wrap.appendChild(btn);
    wrap.appendChild(menu);
    return wrap;
  }

  function injectDropdowns() {
    const lists = document.querySelectorAll(".button-row ul.actions");

    lists.forEach((ul) => {
      if (ul.dataset.aiInjected === "1") return;

      const qLink = ul.querySelector("a.button.big");
      if (!qLink) return;

      const label = (qLink.textContent || "").trim();
      const href = qLink.getAttribute("href") || "";
      const pdfUrl = toAbsoluteUrl(href);

      if (!pdfUrl.toLowerCase().endsWith(".pdf")) return;

      const li = document.createElement("li");
li.appendChild(makeDropdown(label, pdfUrl));

const questionItem = qLink.closest("li");

if (questionItem) {
  questionItem.insertAdjacentElement("afterend", li);
} else {
  ul.prepend(li);
}

      ul.dataset.aiInjected = "1";
    });
  }

  function injectMarkingInstructionsButton() {
    const MARKING_PAGE = "/marking.html";

    const noteLinks = Array.from(document.querySelectorAll("a.button")).filter(
      (a) => (a.textContent || "").trim().toLowerCase() === "notes"
    );

    noteLinks.forEach((notesBtn) => {
      const parent = notesBtn.parentElement;
      if (!parent) return;

      if (parent.querySelector('[data-si-marking-btn="1"]')) return;

      const mi = document.createElement("a");
      mi.className = notesBtn.className;
      mi.href = MARKING_PAGE;
      mi.target = "_blank";
      mi.rel = "noopener noreferrer";
      mi.setAttribute("data-si-marking-btn", "1");
      mi.style.marginLeft = "0.8em";
      mi.textContent = "Marking Instructions";

      notesBtn.insertAdjacentElement("afterend", mi);
    });
  }

  if (!IS_MARKING_PAGE) {
    document.addEventListener("click", closeAllDropdowns);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAllDropdowns();
    });
  }

  function init() {
    if (IS_MARKING_PAGE) return;
    injectDropdowns();
    injectMarkingInstructionsButton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();