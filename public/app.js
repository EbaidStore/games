document.addEventListener("DOMContentLoaded", () => {
  let allGames = [];
  let uniqueHdds = [];
  let uniqueGenres = [];
  let activeHddFilter = "all";
  let activeGenreFilter = "all";
  let activeGameTypeFilter = "all";
  let activeConsoleFilter = "all";
  let activeSort = "default";
  let activeFavoritesOnly = false;
  
  // Favorites Local State
  let favoriteGameIds = [];
  try {
    favoriteGameIds = JSON.parse(localStorage.getItem("ps4_favorites")) || [];
  } catch(e) {
    favoriteGameIds = [];
  }
  
  // Salla Cart Local State
  let selectedGameIds = [];
  try {
    selectedGameIds = JSON.parse(localStorage.getItem("ps4_salla_cart")) || [];
  } catch(e) {
    selectedGameIds = [];
  }

  // HDD Capacities Local State (mapped from HDD name -> Capacity in GB)
  let hddCapacities = {};
  try {
    hddCapacities = JSON.parse(localStorage.getItem("ps4_hdd_capacities")) || {};
  } catch(e) {
    hddCapacities = {};
  }

  // Core DOM Elements
  const gamesGrid = document.getElementById("games-grid");
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("clear-search");
  const noGamesEl = document.getElementById("no-games");
  const loadingEl = document.getElementById("loading");
  const totalCountEl = document.getElementById("total-games-count");
  const totalSizeEl = document.getElementById("total-games-size");
  
  // Console Tab elements
  const consoleAllBtn = document.getElementById("console-all");
  const consolePs4Btn = document.getElementById("console-ps4");
  const consolePs5Btn = document.getElementById("console-ps5");
  const consolePs3Btn = document.getElementById("console-ps3");
  const consoleXboxBtn = document.getElementById("console-xbox");

  // Game Type Tab elements
  const tabAllBtn = document.getElementById("tab-all");
  const tabModdedBtn = document.getElementById("tab-modded");
  const tabAccountBtn = document.getElementById("tab-account");
  const tabMaintenanceBtn = document.getElementById("tab-maintenance");
  const tabDeviceBtn = document.getElementById("tab-device");
  const tabControllerBtn = document.getElementById("tab-controller");
  
  // New Filter Elements
  const filtersContainer = document.getElementById("filters-container");
  const hddFiltersContainer = document.getElementById("hdd-filters");
  const genreFiltersContainer = document.getElementById("genre-filters");

  // Client Stats Panel Elements
  const toggleStatsPanelBtn = document.getElementById("toggle-stats-panel");
  const statsPanel = document.getElementById("stats-panel");
  const statsChevron = document.getElementById("stats-chevron");
  const statsModdedCount = document.getElementById("stats-modded-count");
  const statsModdedBar = document.getElementById("stats-modded-bar");
  const statsAccountCount = document.getElementById("stats-account-count");
  const statsAccountBar = document.getElementById("stats-account-bar");
  const hddStatsList = document.getElementById("hdd-stats-list");

  // Salla Cart Drawer Elements
  const floatingCartBtn = document.getElementById("floating-cart-btn");
  const cartBadge = document.getElementById("cart-badge");
  const cartSummaryText = document.getElementById("cart-summary-text");
  const cartDrawer = document.getElementById("cart-drawer");
  const closeCartBtn = document.getElementById("close-cart-btn");
  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartTotalCount = document.getElementById("cart-total-count");
  const cartTotalSize = document.getElementById("cart-total-size");
  const cartTextPreview = document.getElementById("cart-text-preview");
  const copyCartBtn = document.getElementById("copy-cart-btn");
  const whatsappCartBtn = document.getElementById("whatsapp-cart-btn");
  const clearCartBtn = document.getElementById("clear-cart-btn");
  
  // Upgraded Salla Sim & Utilities
  const clientHddSimSizeSelect = document.getElementById("client-hdd-sim-size");
  const clientSimSpaceText = document.getElementById("client-sim-space-text");
  const clientSimBar = document.getElementById("client-sim-bar");
  const downloadCsvBtn = document.getElementById("download-csv-btn");
  const smartPackBtn = document.getElementById("smart-pack-btn");
  
  // Sorting & Favorites Elements
  const sortSelect = document.getElementById("sort-select");
  const toggleFavoritesBtn = document.getElementById("toggle-favorites-btn");
  const favCountEl = document.getElementById("fav-count");
  const favBtnIcon = document.getElementById("fav-btn-icon");

  // Sleek Client Toast Elements
  const indexToast = document.getElementById("index-toast");
  const indexToastMessage = document.getElementById("index-toast-message");
  const indexToastIcon = document.getElementById("index-toast-icon");

  // Collapsible Preview elements
  const togglePreviewAreaBtn = document.getElementById("toggle-preview-area-btn");
  const previewAreaContent = document.getElementById("preview-area-content");
  const previewChevron = document.getElementById("preview-chevron");

  // Collapsible HDD Sim elements
  const cartDrawerFooter = document.getElementById("cart-drawer-footer");
  const toggleHddSimBtn = document.getElementById("toggle-hdd-sim-btn");
  const hddSimContent = document.getElementById("hdd-sim-content");
  const hddSimChevron = document.getElementById("hdd-sim-chevron");

  // New Search & Filter helper elements
  const resultsInfoBar = document.getElementById("results-info-bar");
  const resultsCountEl = document.getElementById("results-count");
  const resetAllFiltersBtn = document.getElementById("reset-all-filters-btn");
  const toggleFiltersBtnBar = document.getElementById("toggle-filters-btn-bar");
  const activeFiltersBadge = document.getElementById("active-filters-badge");
  const filtersChevron = document.getElementById("filters-chevron");
  
  let activeFiltersContainerVisible = false; // Closed by default for clean look

  let toastTimeout = null;

  // Sleek Client Toast Helper with dynamic theme types (success, warning, error)
  function showIndexToast(message, type = "success") {
    if (!indexToast || !indexToastMessage) return;
    indexToastMessage.textContent = message;
    
    // Reset background and border styling based on status type
    indexToast.className = "fixed bottom-24 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 max-w-sm transform transition-all duration-300 border " + 
      (type === "error" || type === "danger" 
        ? "bg-rose-950/95 border-rose-500/30 text-rose-100" 
        : type === "warning" 
          ? "bg-amber-950/95 border-amber-500/30 text-amber-100" 
          : "bg-slate-900 border-ps-border text-white");

    if (indexToastIcon) {
      indexToastIcon.className = "w-6 h-6 rounded-full flex items-center justify-center shrink-0 " + 
        (type === "error" || type === "danger" 
          ? "bg-rose-500/20 text-rose-400" 
          : type === "warning" 
            ? "bg-amber-500/20 text-amber-400" 
            : "bg-ps-blue/10 text-ps-blue animate-pulse");
      
      const iconInner = indexToastIcon.querySelector("i");
      if (iconInner) {
        iconInner.className = type === "error" || type === "danger" 
          ? "fa-solid fa-circle-exclamation text-xs" 
          : type === "warning" 
            ? "fa-solid fa-triangle-exclamation text-xs" 
            : "fa-solid fa-check text-xs";
      }
    }
    
    indexToast.classList.remove("opacity-0", "pointer-events-none", "translate-y-10");
    indexToast.classList.add("opacity-100", "translate-y-0");
    
    if (toastTimeout) clearTimeout(toastTimeout);
    
    toastTimeout = setTimeout(() => {
      indexToast.classList.remove("opacity-100", "translate-y-0");
      indexToast.classList.add("opacity-0", "pointer-events-none", "translate-y-10");
    }, 4000);
  }

  // Size Parser Helper (Convert GB/MB/TB strings to float GB number)
  function parseSizeToGB(sizeStr) {
    if (!sizeStr) return 0;
    const cleaned = sizeStr.replace(/,/g, '').trim().toLowerCase();
    const num = parseFloat(cleaned);
    if (isNaN(num)) return 0;
    if (cleaned.includes("mb") || cleaned.includes("ميج") || cleaned.includes("ميجا")) {
      return num / 1024;
    }
    if (cleaned.includes("tb") || cleaned.includes("تير")) {
      return num * 1024;
    }
    return num; // Default GB
  }

  // Tab Filtering handler
  function setTabFilter(type) {
    activeGameTypeFilter = type;
    
    // Update active tab styling
    const tabs = [
      { el: tabAllBtn, type: "all" },
      { el: tabModdedBtn, type: "modded" },
      { el: tabAccountBtn, type: "account" },
      { el: tabMaintenanceBtn, type: "maintenance" },
      { el: tabDeviceBtn, type: "device" },
      { el: tabControllerBtn, type: "controller" }
    ];
    
    tabs.forEach(tab => {
      if (!tab.el) return;
      const minWidthClass = tab.type === "all" ? "min-w-[90px]" : "min-w-[110px]";
      if (tab.type === type) {
        tab.el.className = `flex-1 ${minWidthClass} py-2 px-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer bg-ps-blue text-white shadow-lg shadow-ps-blue/20`;
      } else {
        tab.el.className = `flex-1 ${minWidthClass} py-2 px-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer text-slate-400 hover:text-white`;
      }
    });
    
    applyFilters();
  }

  // Console Filtering handler
  function setConsoleFilter(consoleType) {
    activeConsoleFilter = consoleType;
    
    const consoleTabs = [
      { el: consoleAllBtn, type: "all" },
      { el: consolePs4Btn, type: "ps4" },
      { el: consolePs5Btn, type: "ps5" },
      { el: consolePs3Btn, type: "ps3" },
      { el: consoleXboxBtn, type: "xbox" }
    ];
    
    consoleTabs.forEach(tab => {
      if (!tab.el) return;
      if (tab.type === consoleType) {
        tab.el.className = "flex-1 py-2 px-2.5 rounded-xl text-[11px] md:text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer bg-ps-blue text-white shadow-lg shadow-ps-blue/20";
      } else {
        tab.el.className = "flex-1 py-2 px-2.5 rounded-xl text-[11px] md:text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer text-slate-400 hover:text-white";
      }
    });
    
    applyFilters();
  }
  
  if (tabAllBtn) tabAllBtn.addEventListener("click", () => setTabFilter("all"));
  if (tabModdedBtn) tabModdedBtn.addEventListener("click", () => setTabFilter("modded"));
  if (tabAccountBtn) tabAccountBtn.addEventListener("click", () => setTabFilter("account"));
  if (tabMaintenanceBtn) tabMaintenanceBtn.addEventListener("click", () => setTabFilter("maintenance"));
  if (tabDeviceBtn) tabDeviceBtn.addEventListener("click", () => setTabFilter("device"));
  if (tabControllerBtn) tabControllerBtn.addEventListener("click", () => setTabFilter("controller"));

  if (consoleAllBtn) consoleAllBtn.addEventListener("click", () => setConsoleFilter("all"));
  if (consolePs4Btn) consolePs4Btn.addEventListener("click", () => setConsoleFilter("ps4"));
  if (consolePs5Btn) consolePs5Btn.addEventListener("click", () => setConsoleFilter("ps5"));
  if (consolePs3Btn) consolePs3Btn.addEventListener("click", () => setConsoleFilter("ps3"));
  if (consoleXboxBtn) consoleXboxBtn.addEventListener("click", () => setConsoleFilter("xbox"));

  // Fetch games on startup
  async function fetchGames() {
    try {
      let response;
      const isGitHubPages = window.location.hostname.includes("github.io") || window.location.protocol === "file:";
      
      if (!isGitHubPages) {
        try {
          response = await fetch("/api/games");
        } catch (e) {
          // Fallback to static games.json
        }
      }
      
      if (!response || !response.ok) {
        response = await fetch("./games.json");
      }

      if (!response.ok) throw new Error("Failed to load games");
      allGames = await response.json();
      
      // Ensure relative paths for covers so they work on GitHub Pages subpaths
      allGames.forEach(g => {
        if (g.cover && g.cover.startsWith("/") && !g.cover.startsWith("//")) {
          g.cover = "." + g.cover;
        }
      });

      // Normalize and parse game hdd and genre
      allGames.forEach(parseGameHddAndGenre);
      
      // Extract categories/HDDs
      extractUniqueFilters(allGames);
      
      // Update statistics
      updateStats(allGames);
      
      // Render Filters list
      renderFiltersOnly();
      
      // Render initially
      renderGames(allGames);

      // Render Salla Cart initially
      updateCartUI();

    } catch (error) {
      console.error("Error loading games:", error);
      loadingEl.innerHTML = `
        <div class="text-rose-500 text-5xl mb-3"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <p class="text-slate-400">فشل تحميل الألعاب. يرجى إعادة المحاولة لاحقاً.</p>
      `;
    } finally {
      loadingEl.classList.add("hidden");
      gamesGrid.classList.remove("opacity-0");
    }
  }

  // Parse legacy fields if missing
  function parseGameHddAndGenre(game) {
    if (!game.hdd || !game.genre) {
      const parts = (game.path || "").split(">").map(p => p.trim());
      if (!game.hdd) {
        let hdd = parts[0] || "غير محدد";
        if (hdd === "HDD1") hdd = "HDD 1";
        if (hdd === "HDD2") hdd = "HDD 2";
        game.hdd = hdd;
      }
      if (!game.genre) {
        let genre = parts[1] || "أخرى";
        if (genre.toLowerCase() === "action") genre = "أكشن";
        if (genre.toLowerCase() === "adventure") genre = "مغامرات";
        if (genre.toLowerCase() === "sports") genre = "رياضة";
        game.genre = genre;
      }
    }
    return game;
  }

  // Extract unique filter buttons
  function extractUniqueFilters(games) {
    const hdds = new Set();
    const genres = new Set();

    games.forEach(game => {
      if (game.hdd) {
        if (typeof game.hdd === "string") {
          game.hdd.split(",").map(h => h.trim()).forEach(h => {
            if (h) hdds.add(h);
          });
        } else if (Array.isArray(game.hdd)) {
          game.hdd.forEach(h => {
            if (h) hdds.add(h);
          });
        } else {
          hdds.add(game.hdd);
        }
      }
      if (game.genre) genres.add(game.genre);
    });

    uniqueHdds = Array.from(hdds).sort();
    uniqueGenres = Array.from(genres).sort();
  }

  // Render Category and HDD Filter pills
  function renderFiltersOnly() {
    if (!filtersContainer || !hddFiltersContainer || !genreFiltersContainer) return;

    // 1. Render HDD Filters
    hddFiltersContainer.innerHTML = "";
    
    // "All" button
    const allHddBtn = document.createElement("button");
    allHddBtn.className = `px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
      activeHddFilter === "all" 
        ? "bg-ps-blue text-white shadow-md shadow-ps-blue/20" 
        : "bg-ps-cardBg border border-ps-border text-slate-400 hover:text-white hover:bg-slate-800"
    }`;
    allHddBtn.textContent = "الكل";
    allHddBtn.addEventListener("click", () => {
      activeHddFilter = "all";
      applyFilters();
    });
    hddFiltersContainer.appendChild(allHddBtn);

    // Dynamic hdd buttons
    uniqueHdds.forEach(hdd => {
      const btn = document.createElement("button");
      // Deterministic color match
      let hash = 0;
      for (let i = 0; i < hdd.length; i++) {
        hash += hdd.charCodeAt(i);
      }
      const palette = [
        { active: "bg-emerald-600/90 text-white shadow-emerald-600/20 border-emerald-500/40", border: "border-emerald-500/25 text-emerald-400/90 hover:bg-emerald-950/20" },
        { active: "bg-amber-600/90 text-white shadow-amber-600/20 border-amber-500/40", border: "border-amber-500/25 text-amber-400/90 hover:bg-amber-950/20" },
        { active: "bg-purple-600/90 text-white shadow-purple-600/20 border-purple-500/40", border: "border-purple-500/25 text-purple-400/90 hover:bg-purple-950/20" },
        { active: "bg-rose-600/90 text-white shadow-rose-600/20 border-rose-500/40", border: "border-rose-500/25 text-rose-400/90 hover:bg-rose-950/20" },
        { active: "bg-cyan-600/90 text-white shadow-cyan-600/20 border-cyan-500/40", border: "border-cyan-500/25 text-cyan-400/90 hover:bg-cyan-950/20" },
        { active: "bg-orange-600/90 text-white shadow-orange-600/20 border-orange-500/40", border: "border-orange-500/25 text-orange-400/90 hover:bg-orange-950/20" },
        { active: "bg-pink-600/90 text-white shadow-pink-600/20 border-pink-500/40", border: "border-pink-500/25 text-pink-400/90 hover:bg-pink-950/20" },
        { active: "bg-sky-600/90 text-white shadow-sky-600/20 border-sky-500/40", border: "border-sky-500/25 text-sky-400/90 hover:bg-sky-950/20" }
      ];
      const color = palette[hash % palette.length];

      btn.className = `px-4 py-2 rounded-xl text-sm font-semibold transition-all border duration-200 cursor-pointer ${
        activeHddFilter === hdd 
          ? `${color.active} shadow-md` 
          : `bg-ps-cardBg ${color.border} hover:text-white`
      }`;
      btn.textContent = hdd;
      btn.addEventListener("click", () => {
        activeHddFilter = hdd;
        applyFilters();
      });
      hddFiltersContainer.appendChild(btn);
    });

    // 2. Render Genre Filters
    genreFiltersContainer.innerHTML = "";
    
    // "All" button
    const allGenreBtn = document.createElement("button");
    allGenreBtn.className = `px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
      activeGenreFilter === "all" 
        ? "bg-ps-blue text-white shadow-md shadow-ps-blue/20" 
        : "bg-ps-cardBg border border-ps-border text-slate-400 hover:text-white hover:bg-slate-800"
    }`;
    allGenreBtn.textContent = "الكل";
    allGenreBtn.addEventListener("click", () => {
      activeGenreFilter = "all";
      applyFilters();
    });
    genreFiltersContainer.appendChild(allGenreBtn);

    // Dynamic genre buttons
    uniqueGenres.forEach(genre => {
      const btn = document.createElement("button");
      btn.className = `px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
        activeGenreFilter === genre 
          ? "bg-ps-blue text-white shadow-md shadow-ps-blue/20" 
          : "bg-ps-cardBg border border-ps-border text-slate-400 hover:text-white hover:bg-slate-800"
      }`;
      btn.textContent = genre;
      btn.addEventListener("click", () => {
        activeGenreFilter = genre;
        applyFilters();
      });
      genreFiltersContainer.appendChild(btn);
    });

    if (activeFiltersContainerVisible && allGames.length > 0) {
      filtersContainer.classList.remove("hidden");
      filtersContainer.classList.add("flex");
    } else {
      filtersContainer.classList.remove("flex");
      filtersContainer.classList.add("hidden");
    }

    // Update active filters badge & toggle button styling
    let activeFiltersCount = 0;
    if (searchInput.value.trim()) activeFiltersCount++;
    if (activeHddFilter !== "all") activeFiltersCount++;
    if (activeGenreFilter !== "all") activeFiltersCount++;
    if (activeGameTypeFilter !== "all") activeFiltersCount++;
    if (activeFavoritesOnly) activeFiltersCount++;

    if (activeFiltersBadge) {
      activeFiltersBadge.textContent = activeFiltersCount;
      if (activeFiltersCount > 0) {
        activeFiltersBadge.classList.remove("hidden");
        activeFiltersBadge.classList.add("inline-flex");
      } else {
        activeFiltersBadge.classList.add("hidden");
        activeFiltersBadge.classList.remove("inline-flex");
      }
    }

    if (toggleFiltersBtnBar) {
      if (activeFiltersContainerVisible) {
        toggleFiltersBtnBar.className = "flex-1 sm:flex-initial bg-ps-blue/15 text-ps-blue border border-ps-blue/40 px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition duration-300 font-bold cursor-pointer shrink-0";
        if (filtersChevron) {
          filtersChevron.className = "fa-solid fa-chevron-down text-[10px] duration-200 rotate-180 text-ps-blue";
        }
      } else {
        toggleFiltersBtnBar.className = "flex-1 sm:flex-initial bg-slate-900/80 hover:bg-slate-800 border border-ps-border text-slate-300 hover:text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition duration-300 font-bold cursor-pointer shrink-0";
        if (filtersChevron) {
          filtersChevron.className = "fa-solid fa-chevron-down text-[10px] text-slate-500 duration-200";
        }
      }
    }
  }

  // Combined Filters application (Search + HDD + Genre + Game Type + Favorites) + Sorting
  function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    
    if (query) {
      clearSearchBtn.classList.remove("hidden");
    } else {
      clearSearchBtn.classList.add("hidden");
    }

    const filtered = allGames.filter(game => {
      // 1. Search text match
      const nameMatch = game.name && game.name.toLowerCase().includes(query);
      const titleIdMatch = game.titleId && game.titleId.toLowerCase().includes(query);
      const descMatch = game.description && game.description.toLowerCase().includes(query);
      const textMatch = nameMatch || titleIdMatch || descMatch;

      // 2. HDD match
      const hddMatch = activeHddFilter === "all" || 
                       (Array.isArray(game.hdd) 
                         ? game.hdd.includes(activeHddFilter) 
                         : (typeof game.hdd === "string" 
                             ? game.hdd.split(",").map(h => h.trim()).includes(activeHddFilter) 
                             : game.hdd === activeHddFilter));

      // 3. Genre match
      const genreMatch = activeGenreFilter === "all" || game.genre === activeGenreFilter;

      // 4. Game Type match
      const typeMatch = activeGameTypeFilter === "all" || 
                        (game.gameType || "modded") === activeGameTypeFilter;

      // 5. Console match (defaulting to PS4 if not specified)
      const consoleMatch = activeConsoleFilter === "all" || 
                           (game.console || "PS4").toLowerCase() === activeConsoleFilter;

      // 6. Favorites filter
      const favoriteMatch = !activeFavoritesOnly || favoriteGameIds.includes(game.id);

      return textMatch && hddMatch && genreMatch && typeMatch && consoleMatch && favoriteMatch;
    });

    // Update filter buttons selected states
    renderFiltersOnly();
    
    // Update Favorites Header Count
    updateFavoritesUI();

    // 6. Apply Sorting
    let sorted = [...filtered];
    if (activeSort === "name-asc") {
      sorted.sort((a, b) => (a.name || "").localeCompare(b.name || "", "ar"));
    } else if (activeSort === "name-desc") {
      sorted.sort((a, b) => (b.name || "").localeCompare(a.name || "", "ar"));
    } else if (activeSort === "size-desc") {
      sorted.sort((a, b) => parseSizeToGB(b.size) - parseSizeToGB(a.size));
    } else if (activeSort === "size-asc") {
      sorted.sort((a, b) => parseSizeToGB(a.size) - parseSizeToGB(b.size));
    } else if (activeSort === "rating-desc") {
      sorted.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
    } else if (activeSort === "random") {
      sorted.sort(() => Math.random() - 0.5);
    }
    
    // Render sorted list of games
    renderGames(sorted);

    // Update Results Info Bar
    let activeFiltersCount = 0;
    if (searchInput.value.trim()) activeFiltersCount++;
    if (activeHddFilter !== "all") activeFiltersCount++;
    if (activeGenreFilter !== "all") activeFiltersCount++;
    if (activeGameTypeFilter !== "all") activeFiltersCount++;
    if (activeFavoritesOnly) activeFiltersCount++;

    if (resultsInfoBar && resultsCountEl) {
      if (activeFiltersCount > 0) {
        resultsInfoBar.classList.remove("hidden");
        resultsInfoBar.classList.add("flex");
        resultsCountEl.textContent = sorted.length;
      } else {
        resultsInfoBar.classList.add("hidden");
        resultsInfoBar.classList.remove("flex");
      }
    }
  }

  function updateFavoritesUI() {
    if (favCountEl) {
      favCountEl.textContent = favoriteGameIds.length;
    }
    if (toggleFavoritesBtn) {
      if (activeFavoritesOnly) {
        toggleFavoritesBtn.classList.remove("bg-slate-900/80", "text-slate-300");
        toggleFavoritesBtn.classList.add("bg-amber-500/20", "text-amber-400", "border-amber-500/40");
        if (favBtnIcon) {
          favBtnIcon.className = "fa-solid fa-star text-amber-400 text-sm";
        }
      } else {
        toggleFavoritesBtn.classList.add("bg-slate-900/80", "text-slate-300");
        toggleFavoritesBtn.classList.remove("bg-amber-500/20", "text-amber-400", "border-amber-500/40");
        if (favBtnIcon) {
          favBtnIcon.className = "fa-regular fa-star text-amber-400 text-sm";
        }
      }
    }
  }

  // Calculate and display stats & HDD Space Analyser
  function updateStats(games) {
    // 1. Overall stats
    totalCountEl.textContent = games.length;
    
    let totalGB = 0;
    let moddedCount = 0;
    let accountCount = 0;
    const hddSizes = {};

    games.forEach(game => {
      const sizeGB = parseSizeToGB(game.size);
      totalGB += sizeGB;

      // Group by HDD
      if (game.hdd) {
        const drives = typeof game.hdd === "string" 
          ? game.hdd.split(",").map(h => h.trim()) 
          : (Array.isArray(game.hdd) ? game.hdd : [game.hdd]);
        drives.forEach(hdd => {
          if (hdd) {
            hddSizes[hdd] = (hddSizes[hdd] || 0) + sizeGB;
          }
        });
      }

      // Group by Category
      if (game.gameType === "account") {
        accountCount++;
      } else if (game.gameType === "modded" || !game.gameType) {
        moddedCount++;
      }
    });
    
    if (totalGB >= 1000) {
      totalSizeEl.textContent = (totalGB / 1000).toFixed(2) + " TB";
    } else {
      totalSizeEl.textContent = Math.round(totalGB) + " GB";
    }

    // 2. Local Stats Panel updates
    const totalCategorized = moddedCount + accountCount || 1;
    const moddedPct = Math.round((moddedCount / totalCategorized) * 100);
    const accountPct = Math.round((accountCount / totalCategorized) * 100);

    if (statsModdedCount) {
      statsModdedCount.textContent = `${moddedCount} لعبة (${moddedPct}%)`;
    }
    if (statsModdedBar) {
      statsModdedBar.style.width = `${moddedPct}%`;
    }
    if (statsAccountCount) {
      statsAccountCount.textContent = `${accountCount} أكونت (${accountPct}%)`;
    }
    if (statsAccountBar) {
      statsAccountBar.style.width = `${accountPct}%`;
    }

    // 3. HDD Storage Bars rendering
    if (hddStatsList) {
      hddStatsList.innerHTML = "";
      
      const allDrives = uniqueHdds.length > 0 ? uniqueHdds : ["HDD 1", "HDD 2", "SSD"];
      
      allDrives.forEach(hdd => {
        const usedGB = hddSizes[hdd] || 0;
        const capacity = hddCapacities[hdd] || 1000; // default 1 TB
        const pctUsed = Math.min(100, (usedGB / capacity) * 100).toFixed(1);
        
        const hddRow = document.createElement("div");
        hddRow.className = "bg-slate-900/60 p-3.5 rounded-xl border border-ps-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3";
        
        // Dropdown options for capacity
        const capacities = [250, 500, 1000, 2000, 4000, 8000];
        let optionsHtml = "";
        capacities.forEach(c => {
          const text = c >= 1000 ? `${c / 1000} TB` : `${c} GB`;
          optionsHtml += `<option value="${c}" ${c === capacity ? "selected" : ""}>${text}</option>`;
        });

        const sizeLabel = usedGB >= 1000 ? `${(usedGB / 1000).toFixed(2)} TB` : `${usedGB.toFixed(0)} GB`;
        const capLabel = capacity >= 1000 ? `${capacity / 1000} TB` : `${capacity} GB`;

        hddRow.innerHTML = `
          <div class="flex-1 space-y-1.5 min-w-0">
            <div class="flex justify-between items-center text-xs">
              <span class="text-white font-bold flex items-center gap-1.5">
                <i class="fa-solid fa-database text-ps-blue text-[10px]"></i>
                <span>${hdd}</span>
              </span>
              <span class="text-slate-400 font-medium font-mono">
                المستعمل: <strong class="text-amber-400 font-bold">${sizeLabel}</strong> / <span class="text-slate-300">${capLabel}</span> (${pctUsed}%)
              </span>
            </div>
            
            <!-- Progress Bar -->
            <div class="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-900">
              <div class="h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                pctUsed > 90 ? 'from-rose-600 to-rose-500' : pctUsed > 75 ? 'from-amber-500 to-amber-400' : 'from-ps-blue to-ps-darkBlue'
              }" style="width: ${pctUsed}%"></div>
            </div>
          </div>

          <!-- Capacity Selector -->
          <div class="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
            <label class="text-[10px] text-slate-500 font-bold whitespace-nowrap">السعة:</label>
            <select 
              data-hdd="${hdd}" 
              class="hdd-cap-select bg-slate-950 text-slate-300 text-[11px] font-bold px-2 py-1 rounded border border-ps-border focus:outline-none cursor-pointer duration-150 hover:bg-slate-900"
            >
              ${optionsHtml}
            </select>
          </div>
        `;

        hddStatsList.appendChild(hddRow);
      });

      // Attach listener to capacity changes
      document.querySelectorAll(".hdd-cap-select").forEach(select => {
        select.addEventListener("change", (e) => {
          const hdd = e.target.getAttribute("data-hdd");
          const val = parseInt(e.target.value);
          if (hdd && !isNaN(val)) {
            hddCapacities[hdd] = val;
            localStorage.setItem("ps4_hdd_capacities", JSON.stringify(hddCapacities));
            updateStats(allGames);
            showIndexToast(`تم تحديث سعة هارد "${hdd}" إلى ${val >= 1000 ? (val/1000) + " TB" : val + " GB"}`);
          }
        });
      });
    }
  }

  // Toggle Stats Panel Logic
  if (toggleStatsPanelBtn && statsPanel) {
    toggleStatsPanelBtn.addEventListener("click", () => {
      const isHidden = statsPanel.classList.contains("hidden");
      if (isHidden) {
        statsPanel.classList.remove("hidden");
        statsChevron.classList.add("rotate-180");
        toggleStatsPanelBtn.classList.add("bg-slate-800", "text-white");
      } else {
        statsPanel.classList.add("hidden");
        statsChevron.classList.remove("rotate-180");
        toggleStatsPanelBtn.classList.remove("bg-slate-800", "text-white");
      }
    });
  }

  // Toggle Advanced Filters Panel Logic
  if (toggleFiltersBtnBar) {
    toggleFiltersBtnBar.addEventListener("click", () => {
      activeFiltersContainerVisible = !activeFiltersContainerVisible;
      renderFiltersOnly();
    });
  }

  // Reset all filters
  if (resetAllFiltersBtn) {
    resetAllFiltersBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      activeHddFilter = "all";
      activeGenreFilter = "all";
      activeFavoritesOnly = false;
      setConsoleFilter("all");
      setTabFilter("all"); // This resets activeGameTypeFilter and calls applyFilters()
      showIndexToast("تم إعادة تعيين كافة فلاتر البحث والفرز بنجاح.", "success");
    });
  }

  // Quick Search Tags handler
  document.querySelectorAll(".quick-search-tag").forEach(tag => {
    tag.addEventListener("click", (e) => {
      const term = e.currentTarget.getAttribute("data-term");
      if (searchInput && term) {
        searchInput.value = term;
        applyFilters();
        showIndexToast(`البحث عن: ${term}`);
      }
    });
  });

  // Salla Cart Drawer Toggle Logic
  if (floatingCartBtn) {
    floatingCartBtn.addEventListener("click", () => {
      toggleCartDrawer(true);
    });
  }

  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", () => {
      toggleCartDrawer(false);
    });
  }

  function toggleCartDrawer(isOpen) {
    if (!cartDrawer) return;
    if (isOpen) {
      cartDrawer.classList.remove("hidden");
      // Force layout reflow
      void cartDrawer.offsetWidth;
      cartDrawer.classList.remove("translate-x-full");
    } else {
      cartDrawer.classList.add("translate-x-full");
      setTimeout(() => {
        if (cartDrawer.classList.contains("translate-x-full")) {
          cartDrawer.classList.add("hidden");
        }
      }, 300);
    }
  }

  // Salla Cart Management Operations
  function animateFloatingCartButton() {
    if (!floatingCartBtn) return;
    floatingCartBtn.classList.remove("scale-100");
    floatingCartBtn.classList.add("scale-110", "animate-bounce");
    setTimeout(() => {
      floatingCartBtn.classList.remove("scale-110", "animate-bounce");
      floatingCartBtn.classList.add("scale-100");
    }, 1000);
  }

  function addToCart(gameId) {
    const id = parseInt(gameId);
    if (isNaN(id)) return;
    if (selectedGameIds.includes(id)) return;
    
    selectedGameIds.push(id);
    localStorage.setItem("ps4_salla_cart", JSON.stringify(selectedGameIds));
    
    updateCartUI();
    applyFilters(); // Redraws list to show 'In Cart' state
    animateFloatingCartButton();
    
    const game = allGames.find(g => g.id === id);
    if (game) {
      showIndexToast(`تمت إضافة "${game.name}" إلى السلة.`);
    }
  }

  function removeFromCart(gameId) {
    const id = parseInt(gameId);
    if (isNaN(id)) return;
    
    selectedGameIds = selectedGameIds.filter(cid => cid !== id);
    localStorage.setItem("ps4_salla_cart", JSON.stringify(selectedGameIds));
    
    updateCartUI();
    applyFilters(); // Redraws list
    animateFloatingCartButton();
    
    const game = allGames.find(g => g.id === id);
    if (game) {
      showIndexToast(`تم إزالة "${game.name}" من السلة.`);
    }
  }

  let clearCartConfirmTimer = null;
  let isClearCartConfirming = false;

  function handleClearCartClick() {
    if (selectedGameIds.length === 0) {
      showIndexToast("السلة فارغة بالفعل!", "warning");
      return;
    }

    if (!isClearCartConfirming) {
      isClearCartConfirming = true;
      if (clearCartBtn) {
        clearCartBtn.classList.remove("border-rose-500/30", "bg-rose-500/10", "text-rose-400");
        clearCartBtn.classList.add("border-rose-500/80", "bg-rose-600", "text-white");
        clearCartBtn.innerHTML = `
          <i class="fa-solid fa-triangle-exclamation text-white animate-bounce"></i>
          <span>تأكيد الإفراغ بالكامل؟ (اضغط مجدداً)</span>
        `;
      }

      // Reset after 3 seconds if not clicked again
      clearCartConfirmTimer = setTimeout(resetClearCartBtn, 3000);
    } else {
      // Second click! Execute clear!
      clearTimeout(clearCartConfirmTimer);
      executeClearCart();
    }
  }

  function resetClearCartBtn() {
    isClearCartConfirming = false;
    if (clearCartBtn) {
      clearCartBtn.classList.add("border-rose-500/30", "bg-rose-500/10", "text-rose-400");
      clearCartBtn.classList.remove("border-rose-500/80", "bg-rose-600", "text-white");
      clearCartBtn.innerHTML = `
        <i class="fa-solid fa-trash-can"></i>
        <span>إفراغ السلة بالكامل</span>
      `;
    }
  }

  function executeClearCart() {
    selectedGameIds = [];
    localStorage.setItem("ps4_salla_cart", JSON.stringify([]));
    
    updateCartUI();
    applyFilters();
    resetClearCartBtn();
    showIndexToast("تم إفراغ سلة الألعاب بالكامل بنجاح.", "success");
  }

  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", handleClearCartClick);
  }

  // Update Cart UI & Generate Plain Text Preview
  function updateCartUI() {
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = "";

    const cartGames = allGames.filter(game => selectedGameIds.includes(game.id));
    
    // Update Badge & summaries
    const count = cartGames.length;
    let totalGB = 0;

    cartGames.forEach(game => {
      totalGB += parseSizeToGB(game.size);
    });

    const sizeText = totalGB >= 1000 ? `${(totalGB / 1000).toFixed(2)} TB` : `${totalGB.toFixed(0)} GB`;

    if (cartBadge) {
      cartBadge.textContent = count;
      if (count > 0) {
        cartBadge.classList.remove("hidden");
      } else {
        cartBadge.classList.add("hidden");
      }
    }

    if (cartSummaryText) {
      cartSummaryText.textContent = sizeText;
    }

    if (cartTotalCount) cartTotalCount.textContent = count;
    if (cartTotalSize) cartTotalSize.textContent = sizeText;

    // Render items list inside drawer
    if (count === 0) {
      cartItemsContainer.innerHTML = `
        <div class="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
          <i class="fa-solid fa-cart-arrow-down text-4xl mb-3 text-slate-600 animate-bounce"></i>
          <p class="text-xs font-bold">السلة فارغة حالياً</p>
          <p class="text-[10px] text-slate-500 mt-1">تصفح مكتبة الألعاب واضغط على "إضافة لطلبك" لإضافة الألعاب المفضلة لديك هنا!</p>
        </div>
      `;
      if (cartTextPreview) cartTextPreview.value = "";
      if (cartDrawerFooter) {
        cartDrawerFooter.classList.add("hidden");
      }
      return;
    } else {
      if (cartDrawerFooter) {
        cartDrawerFooter.classList.remove("hidden");
      }
    }

    cartGames.forEach(game => {
      const itemRow = document.createElement("div");
      itemRow.className = "bg-slate-900/50 p-3 rounded-xl border border-ps-border/50 flex items-center justify-between gap-3 hover:bg-slate-900/80 duration-150";
      
      const coverSrc = game.cover || "";
      const coverHtml = coverSrc 
        ? `<img src="${coverSrc}" class="w-8 h-11 object-cover rounded shadow border border-ps-border/40 shrink-0" alt="${game.name}" onerror="this.src=''; this.className='hidden'" />`
        : `<div class="w-8 h-11 bg-slate-800 rounded flex items-center justify-center text-slate-500 shrink-0 border border-ps-border/40"><i class="fa-solid fa-compact-disc text-sm"></i></div>`;

      itemRow.innerHTML = `
        <div class="flex items-center gap-2.5 min-w-0">
          ${coverHtml}
          <div class="min-w-0">
            <h4 class="text-xs font-bold text-white truncate max-w-[200px]" title="${game.name}">${game.name}</h4>
            <div class="flex items-center gap-1.5 text-[9px] mt-0.5 text-slate-400">
              <span class="font-mono text-ps-blue uppercase">${game.titleId || "CUSA-N/A"}</span>
              <span>•</span>
              <span class="text-amber-400 font-bold">${game.size || "غير محدد"}</span>
            </div>
          </div>
        </div>
        <button 
          data-id="${game.id}" 
          class="remove-item-btn text-slate-500 hover:text-rose-500 w-8 h-8 rounded-full hover:bg-rose-500/10 flex items-center justify-center transition cursor-pointer"
          title="حذف اللعبة من الطلب"
        >
          <i class="fa-solid fa-trash-can text-xs"></i>
        </button>
      `;

      cartItemsContainer.appendChild(itemRow);
    });

    // Wire up remove events inside drawer
    cartItemsContainer.querySelectorAll(".remove-item-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        removeFromCart(id);
      });
    });

    // Generate Custom Plain Text template
    let textOutput = `📋 طلب تحميل ألعاب PlayStation 4:\n`;
    textOutput += `--------------------------------------\n`;
    cartGames.forEach((game, index) => {
      textOutput += `${index + 1}. ${game.name} (${game.titleId || "CUSA"}) - ${game.size || "حجم غير محدد"}\n`;
    });
    textOutput += `--------------------------------------\n`;
    textOutput += `🎮 العدد الإجمالي: ${count} ألعاب\n`;
    textOutput += `💾 المساحة المطلوبة: ${sizeText}\n`;
    textOutput += `🚀 يرجى تجهيز الهارد ديسك لتحميل هذه الألعاب!`;

    if (cartTextPreview) {
      cartTextPreview.value = textOutput;
    }

    // Configure WhatsApp URL Link
    if (whatsappCartBtn) {
      const encodedText = encodeURIComponent(textOutput);
      whatsappCartBtn.href = `https://wa.me/?text=${encodedText}`;
    }

    // Live Client HDD Simulation update
    updateClientSimUI();
  }

  // Copy Plain Text to Clipboard
  if (copyCartBtn) {
    copyCartBtn.addEventListener("click", () => {
      if (cartTextPreview && cartTextPreview.value) {
        navigator.clipboard.writeText(cartTextPreview.value)
          .then(() => {
            showIndexToast("تم نسخ قائمة طلبات الألعاب بنجاح إلى الحافظة! يمكنك الآن لصقها في أي مكان.");
          })
          .catch(err => {
            console.error("Failed to copy text:", err);
            showIndexToast("عذراً، فشل نسخ الطلب تلقائياً.", "error");
          });
      }
    });
  }

  // Video Trailer Modal DOM Elements
  const trailerModal = document.getElementById("trailer-modal");
  const modalGameTitle = document.getElementById("modal-game-title");
  const trailerIframe = document.getElementById("trailer-iframe");
  const closeModalBtn = document.getElementById("close-modal-btn");

  // YouTube Video ID Extractor Helper
  function getYouTubeId(url) {
    if (!url) return null;
    if (url.length === 11 && !url.includes("/") && !url.includes(".")) {
      return url;
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  // DVD Bouncing Watermark Logic for Ebaid Store
  let dvdAnimationId = null;

  function startDvdWatermark() {
    const watermark = document.getElementById("dvd-watermark");
    if (!watermark) return;
    const parent = watermark.parentElement;
    if (!parent) return;

    // Reset watermark design to initial state
    watermark.style.borderColor = "";
    watermark.style.boxShadow = "";
    const psIcon = watermark.querySelector(".fa-playstation");
    if (psIcon) {
      psIcon.style.color = "";
      psIcon.className = "fa-brands fa-playstation text-ps-blue text-sm transition-colors duration-250";
    }

    // Wait for modal transitions to finish and sizes to resolve
    setTimeout(() => {
      const parentWidth = parent.clientWidth;
      const parentHeight = parent.clientHeight;
      const watermarkWidth = watermark.offsetWidth || 155;
      const watermarkHeight = watermark.offsetHeight || 42;

      // Start at random coordinates inside safety margins
      let x = Math.floor(Math.random() * Math.max(parentWidth - watermarkWidth - 40, 20)) + 10;
      let y = Math.floor(Math.random() * Math.max(parentHeight - watermarkHeight - 40, 20)) + 10;

      // Smooth Delta-Time Speeds (pixel-per-second, around 95px/s is buttery and consistent across all screens)
      const speed = 95;
      let dirX = Math.random() > 0.5 ? 1 : -1;
      let dirY = Math.random() > 0.5 ? 1 : -1;
      let dx = dirX * speed;
      let dy = dirY * speed;

      const colors = [
        { border: "#0072CE", glow: "rgba(0, 114, 206, 0.45)" },       // PS Blue
        { border: "#10b981", glow: "rgba(16, 185, 129, 0.45)" },     // Emerald
        { border: "#f43f5e", glow: "rgba(244, 63, 94, 0.45)" },      // Rose
        { border: "#f59e0b", glow: "rgba(245, 158, 11, 0.45)" },      // Amber
        { border: "#a855f7", glow: "rgba(168, 85, 247, 0.45)" }      // Purple
      ];
      let colorIndex = 0;
      let lastTime = null;

      function update(timestamp) {
        if (!lastTime) lastTime = timestamp;
        let dt = (timestamp - lastTime) / 1000; // time elapsed in seconds
        if (dt > 0.1) dt = 0.1; // cap frame gaps
        lastTime = timestamp;

        const w = watermark.offsetWidth || watermarkWidth;
        const h = watermark.offsetHeight || watermarkHeight;
        const pW = parent.clientWidth;
        const pH = parent.clientHeight;

        if (!pW || !pH) {
          dvdAnimationId = requestAnimationFrame(update);
          return;
        }

        x += dx * dt;
        y += dy * dt;

        let bounced = false;

        // Horizontal bounce check
        if (x <= 0) {
          x = 0;
          dx = Math.abs(dx);
          bounced = true;
        } else if (x + w >= pW) {
          x = pW - w;
          dx = -Math.abs(dx);
          bounced = true;
        }

        // Vertical bounce check
        if (y <= 0) {
          y = 0;
          dy = Math.abs(dy);
          bounced = true;
        } else if (y + h >= pH) {
          y = pH - h;
          dy = -Math.abs(dy);
          bounced = true;
        }

        // Using fractional GPU-accelerated coordinate translate
        watermark.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;

        if (bounced) {
          colorIndex = (colorIndex + 1) % colors.length;
          const col = colors[colorIndex];
          
          // Color shift with soft glowing neon effects on bounce
          watermark.style.borderColor = col.border;
          watermark.style.boxShadow = `0 10px 25px -3px ${col.glow}, 0 0 15px ${col.glow}`;
          
          if (psIcon) {
            psIcon.style.color = col.border;
          }
        }

        dvdAnimationId = requestAnimationFrame(update);
      }

      watermark.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      
      if (dvdAnimationId) cancelAnimationFrame(dvdAnimationId);
      dvdAnimationId = requestAnimationFrame(update);
    }, 200);
  }

  function stopDvdWatermark() {
    if (dvdAnimationId) {
      cancelAnimationFrame(dvdAnimationId);
      dvdAnimationId = null;
    }
  }

  // Open and Close Video Modal
  function openTrailer(gameName, url) {
    const videoId = getYouTubeId(url);
    if (!videoId) {
      showIndexToast("عذراً، رابط فيديو اليوتيوب غير صالح.", "error");
      return;
    }
    
    modalGameTitle.textContent = `عرض تريلر: ${gameName}`;
    trailerIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    
    trailerModal.classList.remove("hidden");
    // Force reflow
    void trailerModal.offsetWidth;
    trailerModal.classList.remove("opacity-0");
    trailerModal.classList.add("opacity-100");
    
    const innerBox = trailerModal.querySelector("div");
    if (innerBox) {
      innerBox.classList.remove("scale-95");
      innerBox.classList.add("scale-100");
    }

    startDvdWatermark();
  }

  function closeTrailer() {
    stopDvdWatermark();
    trailerModal.classList.remove("opacity-100");
    trailerModal.classList.add("opacity-0");
    
    const innerBox = trailerModal.querySelector("div");
    if (innerBox) {
      innerBox.classList.remove("scale-100");
      innerBox.classList.add("scale-95");
    }
    
    setTimeout(() => {
      trailerModal.classList.add("hidden");
      trailerIframe.src = ""; // Stop audio/video playing in background
    }, 300);
  }

  // Event listeners for modal closure
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeTrailer);
  if (trailerModal) {
    trailerModal.addEventListener("click", (e) => {
      if (e.target === trailerModal) {
        closeTrailer();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && trailerModal && !trailerModal.classList.contains("hidden")) {
      closeTrailer();
    }
  });

  // Deterministic color helper for HDD names
  function getHddBadgesHtml(hddValue) {
    if (!hddValue) return `<span class="bg-slate-800/80 text-slate-400 border border-slate-700/50 text-[10px] px-1.5 py-0.5 rounded-md">غير محدد</span>`;
    const hdds = typeof hddValue === "string" 
      ? hddValue.split(",").map(h => h.trim()) 
      : (Array.isArray(hddValue) ? hddValue : [hddValue]);
    
    // A palette of beautiful classes for each HDD
    const palette = [
      { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/20" },
      { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/20" },
      { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/20" },
      { bg: "bg-rose-500/15", text: "text-rose-400", border: "border-rose-500/20" },
      { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/20" },
      { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/20" },
      { bg: "bg-pink-500/15", text: "text-pink-400", border: "border-pink-500/20" },
      { bg: "bg-sky-500/15", text: "text-sky-400", border: "border-sky-500/20" }
    ];

    return hdds.map(hdd => {
      if (!hdd) return "";
      // Deterministic hash based on hdd name characters
      let hash = 0;
      for (let i = 0; i < hdd.length; i++) {
        hash += hdd.charCodeAt(i);
      }
      const color = palette[hash % palette.length];
      return `<span class="${color.bg} ${color.text} ${color.border} border text-[9.5px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0" title="هارد ديسك: ${hdd}">
        <i class="fa-solid fa-database text-[8px]"></i>
        <span>${hdd}</span>
      </span>`;
    }).join(" ");
  }

  // Render game cards dynamically
  function renderGames(gamesToRender) {
    gamesGrid.innerHTML = "";
    
    if (gamesToRender.length === 0) {
      noGamesEl.classList.remove("hidden");
      return;
    }
    
    noGamesEl.classList.add("hidden");
    
    gamesToRender.forEach(game => {
      const card = document.createElement("div");
      let specialCardBorderClass = "";
      if (game.gameType === "maintenance") {
        specialCardBorderClass = " ring-1 ring-amber-500/40 shadow-lg shadow-amber-500/5";
      } else if (game.gameType === "device") {
        specialCardBorderClass = " ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-500/5";
      } else if (game.gameType === "controller") {
        specialCardBorderClass = " ring-1 ring-rose-500/40 shadow-lg shadow-rose-500/5";
      }
      card.className = "ps-card rounded-2xl flex flex-col h-full" + specialCardBorderClass;
      card.setAttribute("id", `game-card-${game.id}`);
      
      // Check for cover image, use placeholder if empty or fails
      const coverSrc = game.cover || "";
      const isFav = favoriteGameIds.includes(game.id);
      
      card.innerHTML = `
        <div class="ps-card-img-container rounded-t-2xl relative overflow-hidden group">
          ${
            coverSrc 
              ? `<img src="${coverSrc}" class="ps-card-img transition-all duration-500 group-hover:scale-105" alt="${game.name}" onerror="handleImageError(this)" />`
              : `<div class="w-full h-full bg-slate-800 flex flex-col justify-center items-center p-4 text-center">
                   <div class="text-4xl text-slate-600 mb-2"><i class="fa-solid fa-compact-disc"></i></div>
                   <span class="text-xs text-slate-400 font-bold leading-tight line-clamp-3">${game.name}</span>
                 </div>`
          }
          <!-- Disk Slot Tag -->
          <div class="absolute top-2 right-2 bg-ps-bgDark/80 backdrop-blur-sm border border-ps-border text-[10px] text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1 z-10">
            <i class="${(game.console || 'PS4').toLowerCase() === 'xbox' ? 'fa-brands fa-xbox text-emerald-400' : 'fa-brands fa-playstation text-ps-blue'} text-[11px]"></i>
            <span>${(game.console || "PS4").toUpperCase()}</span>
          </div>

          <!-- Favorite Star Button (Top-Left) -->
          <button 
            class="favorite-toggle-btn absolute top-2 left-2 w-7.5 h-7.5 rounded-lg bg-ps-bgDark/85 backdrop-blur-sm border border-ps-border/80 text-slate-400 hover:text-amber-400 flex items-center justify-center transition duration-200 z-30 cursor-pointer"
            data-id="${game.id}"
            title="${isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}"
          >
            <i class="${isFav ? 'fa-solid fa-star text-amber-400 text-[11px]' : 'fa-regular fa-star text-[11px]'}"></i>
          </button>

          <!-- Play Trailer Hover Overlay -->
          ${
            game.trailerUrl 
              ? `<div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 z-20">
                   <button 
                     class="watch-trailer-btn w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transform scale-75 group-hover:scale-100 transition-all duration-300 cursor-pointer"
                     data-url="${game.trailerUrl}"
                     data-name="${game.name}"
                     title="عرض العرض الترويجي (تريلر)"
                   >
                     <i class="fa-solid fa-play text-lg translate-x-[1.5px]"></i>
                   </button>
                 </div>`
              : ""
          }

          <!-- Game Size Indicator -->
          ${
            game.size 
              ? `<div class="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md z-10 font-mono">
                   ${game.size}
                 </div>`
              : ""
          }

          <!-- Game Rating Indicator -->
          ${
            game.rating 
              ? `<div class="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-sm text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 z-10 font-mono">
                   <i class="fa-solid fa-star text-amber-400 text-[9px]"></i>
                   <span>${game.rating}</span>
                 </div>`
              : ""
          }
        </div>
        <div class="p-4 flex flex-col flex-grow text-right">
          <!-- Title ID & Category Tag -->
          <div class="flex justify-between items-center mb-1.5 min-h-[20px]">
            <span class="text-[10px] text-ps-blue font-bold font-mono tracking-wider uppercase">
              ${game.titleId || "N/A"}
            </span>
            ${
              (() => {
                if (game.gameType === "account") {
                  return `<span class="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 leading-none"><i class="fa-solid fa-user-check text-[8px]"></i>أكونت</span>`;
                } else if (game.gameType === "maintenance") {
                  return `<span class="bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 leading-none"><i class="fa-solid fa-screwdriver-wrench text-[8px]"></i>شغل صيانة</span>`;
                } else if (game.gameType === "device") {
                  return `<span class="bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 leading-none"><i class="fa-solid fa-laptop text-[8px]"></i>جهاز للبيع</span>`;
                } else if (game.gameType === "controller") {
                  return `<span class="bg-rose-500/15 text-rose-400 border border-rose-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 leading-none"><i class="fa-solid fa-gamepad text-[8px]"></i>ذراع / إكسسوار</span>`;
                } else {
                  return `<span class="bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 leading-none"><i class="fa-solid fa-code-compare text-[8px]"></i>معدلة</span>`;
                }
              })()
            }
          </div>
          <!-- Game Name -->
          <h3 class="text-sm font-bold text-white mb-1.5 line-clamp-1 hover:text-ps-blue duration-200" title="${game.name}">
            ${game.name}
          </h3>
          <!-- Game Description -->
          ${
            game.description 
              ? `<p class="text-[11px] text-slate-400 line-clamp-2 mb-3 leading-relaxed" title="${game.description}">
                   ${game.description}
                 </p>`
              : ""
          }

          <!-- Add to Order Button -->
          <div class="mb-3">
            ${
              selectedGameIds.includes(game.id)
                ? `<button 
                     class="cart-toggle-btn w-full bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer"
                     data-id="${game.id}"
                   >
                     <i class="fa-solid fa-check"></i>
                     <span>مضاف في الطلب</span>
                   </button>`
                : `<button 
                     class="cart-toggle-btn w-full bg-ps-blue/10 hover:bg-ps-blue text-ps-blue hover:text-white border border-ps-blue/20 hover:border-transparent font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer"
                     data-id="${game.id}"
                   >
                     <i class="fa-solid fa-plus text-[9px]"></i>
                     <span>إضافة لطلبك</span>
                   </button>`
            }
          </div>

          <!-- Path / Storage Location (Bottom of Card) -->
          <div class="mt-auto pt-3 border-t border-slate-800/60 flex items-center justify-between gap-1.5 text-[11px]">
            <div class="flex flex-wrap gap-1 items-center min-w-0">
              ${getHddBadgesHtml(game.hdd)}
              <span class="truncate text-[10px] text-slate-400 hover:text-slate-300 transition duration-150 font-medium" title="مسار التخزين: ${game.path || ""}">${game.path ? game.path.split(">").pop().trim() : "غير محدد"}</span>
            </div>
            ${
              game.trailerUrl 
                ? `<button 
                     class="watch-trailer-btn shrink-0 text-red-500 hover:text-white hover:bg-red-600 border border-red-500/30 hover:border-red-600 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                     data-url="${game.trailerUrl}"
                     data-name="${game.name}"
                   >
                     <i class="fa-brands fa-youtube text-xs"></i>
                     <span>تريلر</span>
                   </button>`
                : ""
            }
          </div>
        </div>
      `;
      
      gamesGrid.appendChild(card);
    });

    // Wire up dynamic click events on all trailer play buttons
    document.querySelectorAll(".watch-trailer-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = e.currentTarget.getAttribute("data-url");
        const name = e.currentTarget.getAttribute("data-name");
        openTrailer(name, url);
      });
    });

    // Wire up dynamic Salla Cart toggle clicks
    document.querySelectorAll(".cart-toggle-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const gameId = btn.getAttribute("data-id");
        if (selectedGameIds.includes(parseInt(gameId))) {
          removeFromCart(gameId);
        } else {
          addToCart(gameId);
        }
      });
    });

    // Wire up favorite stars toggle clicks
    document.querySelectorAll(".favorite-toggle-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const gameId = parseInt(btn.getAttribute("data-id"));
        if (isNaN(gameId)) return;

        const index = favoriteGameIds.indexOf(gameId);
        const game = allGames.find(g => g.id === gameId);
        if (index > -1) {
          favoriteGameIds.splice(index, 1);
          if (game) showIndexToast(`تمت إزالة "${game.name}" من المفضلة.`);
        } else {
          favoriteGameIds.push(gameId);
          if (game) showIndexToast(`تمت إضافة "${game.name}" إلى المفضلة.`);
        }
        
        localStorage.setItem("ps4_favorites", JSON.stringify(favoriteGameIds));
        
        // Refresh UI
        applyFilters();
      });
    });
  }

  // Handle Search input
  searchInput.addEventListener("input", applyFilters);
  
  // Clear search input
  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearSearchBtn.classList.add("hidden");
    applyFilters();
    searchInput.focus();
  });

  // --- Upgraded Salla Sim & Utilities (100% Free & Local) ---

  // Live Client HDD Simulation update helper
  function updateClientSimUI() {
    if (!clientHddSimSizeSelect || !clientSimSpaceText || !clientSimBar) return;
    
    const targetSize = parseFloat(clientHddSimSizeSelect.value) || 500;
    
    // Calculate total size of cart games
    const cartGames = allGames.filter(game => selectedGameIds.includes(game.id));
    let totalGB = 0;
    cartGames.forEach(game => {
      totalGB += parseSizeToGB(game.size);
    });
    
    const remainingSpace = targetSize - totalGB;
    const pctUsed = Math.min(100, (totalGB / targetSize) * 100);
    
    // Update Text
    if (remainingSpace >= 0) {
      clientSimSpaceText.innerHTML = `متبقي <strong class="text-emerald-400 font-bold font-mono">${remainingSpace.toFixed(0)} GB</strong> من <span class="font-mono">${targetSize} GB</span> (${(100 - pctUsed).toFixed(0)}% فارغ)`;
      clientSimBar.style.width = `${pctUsed}%`;
      clientSimBar.className = "h-full duration-300 rounded-full bg-ps-blue";
    } else {
      const over = Math.abs(remainingSpace);
      clientSimSpaceText.innerHTML = `تجاوز الحد بـ <strong class="text-rose-500 font-bold font-mono">${over.toFixed(0)} GB</strong> (السعة غير كافية!)`;
      clientSimBar.style.width = "100%";
      clientSimBar.className = "h-full duration-300 rounded-full bg-rose-500 animate-pulse";
    }
  }

  // Knapsack 0-1 Packing Solver
  function knapsackPack(favorites, targetCapacity) {
    // favorites: array of {id, sizeGB}
    // targetCapacity: number (GB)
    // Sort by size ascending to fit MAXIMUM number of games!
    const sortedFavs = [...favorites].sort((a, b) => a.sizeGB - b.sizeGB);
    let packed = [];
    let currentSize = 0;
    
    for (const item of sortedFavs) {
      if (currentSize + item.sizeGB <= targetCapacity) {
        packed.push(item.id);
        currentSize += item.sizeGB;
      }
    }
    return packed;
  }

  // Listener to simulated HDD size change
  if (clientHddSimSizeSelect) {
    clientHddSimSizeSelect.addEventListener("change", () => {
      updateClientSimUI();
    });
  }

  // Listener to Excel / CSV Export
  if (downloadCsvBtn) {
    downloadCsvBtn.addEventListener("click", () => {
      const cartGames = allGames.filter(game => selectedGameIds.includes(game.id));
      if (cartGames.length === 0) {
        showIndexToast("السلة فارغة! يرجى إضافة بعض الألعاب أولاً لتتمكن من تنزيل ملف Excel CSV الخاص بها.", "warning");
        return;
      }
      
      // UTF-8 BOM for correct Arabic characters representation in Microsoft Excel
      let csvContent = "\uFEFF";
      csvContent += "الرقم,اسم اللعبة,الجهاز,تايتل كود (Title ID),الحجم,الهارد ديسك الحالي,فئة اللعبة,التقييم\n";
      
      cartGames.forEach((game, index) => {
        const name = `"${(game.name || '').replace(/"/g, '""')}"`;
        const consoleVal = `"${(game.console || 'PS4').toUpperCase()}"`;
        const titleId = `"${(game.titleId || '')}"`;
        const size = `"${(game.size || '')}"`;
        const hdd = `"${(game.hdd || '')}"`;
        let type = "ألعاب معدلة";
        if (game.gameType === "account") {
          type = "ألعاب أكونتات";
        } else if (game.gameType === "maintenance") {
          type = "شغل صيانة وإصلاحات";
        } else if (game.gameType === "device") {
          type = "أجهزة ألعاب للبيع/شراء";
        } else if (game.gameType === "controller") {
          type = "ذراعات وإكسسوارات";
        }
        const rating = `"${(game.rating || '')}"`;
        
        csvContent += `${index + 1},${name},${consoleVal},${titleId},${size},${hdd},${type},${rating}\n`;
      });
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `طلب_ألعاب_المحل_${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showIndexToast("تم تصدير وتحميل ملف الطلب كـ Excel CSV بنجاح!", "success");
    });
  }

  // Safe In-Place Confirmation logic for Smart Pack Button (Zero-alert, IFrame-safe)
  let smartPackConfirmTimer = null;
  let isSmartPackConfirming = false;

  function handleSmartPackClick() {
    if (favoriteGameIds.length === 0) {
      showIndexToast("تنبيه: قائمة المفضلة فارغة! يرجى إضافة ألعابك المفضلة أولاً بالضغط على النجمة ⭐️ في بطاقة اللعبة.", "warning");
      return;
    }

    const targetSize = parseFloat(clientHddSimSizeSelect ? clientHddSimSizeSelect.value : 500) || 500;

    if (!isSmartPackConfirming) {
      isSmartPackConfirming = true;
      if (smartPackBtn) {
        smartPackBtn.classList.remove("bg-amber-600/20", "text-amber-400", "border-amber-500/20");
        smartPackBtn.classList.add("bg-amber-600", "text-white", "border-amber-500/80");
        smartPackBtn.innerHTML = `
          <i class="fa-solid fa-circle-question text-white animate-bounce"></i>
          <span>اضغط لتأكيد تعبئة ${targetSize}GB تلقائياً؟</span>
        `;
      }
      smartPackConfirmTimer = setTimeout(resetSmartPackBtn, 3000);
    } else {
      clearTimeout(smartPackConfirmTimer);
      executeSmartPack(targetSize);
    }
  }

  function resetSmartPackBtn() {
    isSmartPackConfirming = false;
    if (smartPackBtn) {
      smartPackBtn.classList.add("bg-amber-600/20", "text-amber-400", "border-amber-500/20");
      smartPackBtn.classList.remove("bg-amber-600", "text-white", "border-amber-500/80");
      smartPackBtn.innerHTML = `
        <i class="fa-solid fa-wand-magic-sparkles text-sm animate-pulse"></i>
        <span>تعبئة ذكية للهارد</span>
      `;
    }
  }

  function executeSmartPack(targetSize) {
    // Map favorite game IDs to full objects
    const favGames = allGames
      .filter(g => favoriteGameIds.includes(g.id))
      .map(g => ({
        id: g.id,
        sizeGB: parseSizeToGB(g.size)
      }));
      
    // Pack
    const packedIds = knapsackPack(favGames, targetSize);
    
    if (packedIds.length === 0) {
      showIndexToast("تنبيه: جميع الألعاب في المفضلة حجمها أكبر من مساحة الهارد ديسك المحدد!", "warning");
      resetSmartPackBtn();
      return;
    }
    
    selectedGameIds = packedIds;
    localStorage.setItem("ps4_salla_cart", JSON.stringify(selectedGameIds));
    
    updateCartUI();
    applyFilters();
    resetSmartPackBtn();
    
    const packedCount = packedIds.length;
    let packedSizeGB = 0;
    allGames.filter(g => packedIds.includes(g.id)).forEach(g => {
      packedSizeGB += parseSizeToGB(g.size);
    });
    
    showIndexToast(`نجاح التعبئة الذكية! تم اختيار ${packedCount} ألعاب بمساحة إجمالية ${packedSizeGB.toFixed(0)} GB لتعبئة الهارد.`, "success");
  }

  if (smartPackBtn) {
    smartPackBtn.addEventListener("click", handleSmartPackClick);
  }

  // Collapsible Preview Area Listener
  if (togglePreviewAreaBtn && previewAreaContent) {
    togglePreviewAreaBtn.addEventListener("click", () => {
      const isHidden = previewAreaContent.classList.contains("hidden");
      if (isHidden) {
        previewAreaContent.classList.remove("hidden");
        if (previewChevron) previewChevron.classList.add("rotate-180");
      } else {
        previewAreaContent.classList.add("hidden");
        if (previewChevron) previewChevron.classList.remove("rotate-180");
      }
    });
  }

  // Collapsible HDD Simulator Listener
  if (toggleHddSimBtn && hddSimContent) {
    toggleHddSimBtn.addEventListener("click", () => {
      const isHidden = hddSimContent.classList.contains("hidden");
      if (isHidden) {
        hddSimContent.classList.remove("hidden");
        if (hddSimChevron) hddSimChevron.classList.add("rotate-180");
      } else {
        hddSimContent.classList.add("hidden");
        if (hddSimChevron) hddSimChevron.classList.remove("rotate-180");
      }
    });
  }

  // --- Store Services & Maintenance Panel ---
  const toggleServicesBtn = document.getElementById("toggle-services-btn");
  const servicesPanel = document.getElementById("services-panel");
  const closeServicesBtn = document.getElementById("close-services-btn");

  if (toggleServicesBtn && servicesPanel) {
    toggleServicesBtn.addEventListener("click", () => {
      const isHidden = servicesPanel.classList.contains("hidden");
      if (isHidden) {
        servicesPanel.classList.remove("hidden");
        toggleServicesBtn.classList.add("bg-amber-500/15", "text-amber-300", "border-amber-500/40");
        servicesPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        servicesPanel.classList.add("hidden");
        toggleServicesBtn.classList.remove("bg-amber-500/15", "text-amber-300", "border-amber-500/40");
      }
    });
  }

  if (closeServicesBtn && servicesPanel && toggleServicesBtn) {
    closeServicesBtn.addEventListener("click", () => {
      servicesPanel.classList.add("hidden");
      toggleServicesBtn.classList.remove("bg-amber-500/15", "text-amber-300", "border-amber-500/40");
    });
  }

  // --- Sort & Favorites UI Controls ---

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      activeSort = e.target.value;
      applyFilters();
    });
  }

  if (toggleFavoritesBtn) {
    toggleFavoritesBtn.addEventListener("click", () => {
      activeFavoritesOnly = !activeFavoritesOnly;
      applyFilters();
    });
  }

  // --- Simplified View Implementation ---
  let isSimpleViewActive = false;
  const toggleSimpleViewBtn = document.getElementById("toggle-simple-view-btn");
  const simpleViewText = document.getElementById("simple-view-text");
  const quickSearchSuggestions = document.getElementById("quick-search-suggestions");
  const heroDescription = document.querySelector("header p"); // Subtitle

  if (toggleSimpleViewBtn) {
    toggleSimpleViewBtn.addEventListener("click", () => {
      isSimpleViewActive = !isSimpleViewActive;
      
      if (isSimpleViewActive) {
        // Hide things
        if (quickSearchSuggestions) quickSearchSuggestions.classList.add("hidden");
        if (toggleStatsPanelBtn) toggleStatsPanelBtn.classList.add("hidden");
        if (statsPanel) statsPanel.classList.add("hidden");
        if (heroDescription) heroDescription.classList.add("hidden");
        
        // Update button appearance
        toggleSimpleViewBtn.className = "px-5 py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 border border-emerald-500/40 cursor-pointer";
        if (simpleViewText) simpleViewText.textContent = "الوضع المبسط (نشط) - انقر للإلغاء";
        
        showIndexToast("تم تفعيل وضع التصفح المبسط السريع للزبائن.", "success");
      } else {
        // Show things back
        if (quickSearchSuggestions) quickSearchSuggestions.classList.remove("hidden");
        if (toggleStatsPanelBtn) toggleStatsPanelBtn.classList.remove("hidden");
        if (heroDescription) heroDescription.classList.remove("hidden");
        
        // Reset button appearance
        toggleSimpleViewBtn.className = "px-5 py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-ps-border/80 text-slate-300 hover:text-white cursor-pointer";
        if (simpleViewText) simpleViewText.textContent = "تفعيل وضع التصفح المبسط والسريع للزبون";
        
        showIndexToast("تم إلغاء وضع التصفح المبسط.", "warning");
      }
    });
  }

  // --- Fullscreen Showcase Slideshow Mode Implementation ---
  let isShowcaseActive = false;
  let showcaseIntervalId = null;
  let showcaseProgressIntervalId = null;
  let showcaseGames = [];
  let showcaseCurrentIndex = 0;
  let showcaseSpeed = 7000; // default to 7s
  let showcaseIsPlaying = true;

  const startShowcaseBtn = document.getElementById("start-showcase-btn");
  const showcaseOverlay = document.getElementById("showcase-overlay");
  const showcaseBgBlur = document.getElementById("showcase-bg-blur");
  const showcaseCover = document.getElementById("showcase-cover");
  const showcaseConsole = document.getElementById("showcase-console");
  const showcaseGenre = document.getElementById("showcase-genre");
  const showcaseSize = document.getElementById("showcase-size");
  const showcaseHdd = document.getElementById("showcase-hdd");
  const showcaseType = document.getElementById("showcase-type");
  const showcaseTitle = document.getElementById("showcase-title");
  const showcaseDesc = document.getElementById("showcase-desc");
  const showcaseRatingStars = document.getElementById("showcase-rating-stars");
  const showcaseRatingText = document.getElementById("showcase-rating-text");
  const showcaseTotal = document.getElementById("showcase-total");
  const showcaseActiveIndex = document.getElementById("showcase-active-index");
  const closeShowcaseBtn = document.getElementById("close-showcase-btn");

  const showcasePrevBtn = document.getElementById("showcase-prev-btn");
  const showcasePlayBtn = document.getElementById("showcase-play-btn");
  const showcasePlayIcon = document.getElementById("showcase-play-icon");
  const showcasePlayText = document.getElementById("showcase-play-text");
  const showcaseNextBtn = document.getElementById("showcase-next-btn");
  const showcaseProgress = document.getElementById("showcase-progress");
  const showcaseSpeedSelect = document.getElementById("showcase-speed");

  function getCurrentlyFilteredGames() {
    if (!allGames || allGames.length === 0) return [];
    return allGames.filter(game => {
      // Apply exact same filters as standard applyFilters
      const text = (searchInput ? searchInput.value : "").trim().toLowerCase();
      const textMatch = !text || 
                        (game.name || "").toLowerCase().includes(text) || 
                        (game.titleId || "").toLowerCase().includes(text) ||
                        (game.genre || "").toLowerCase().includes(text);

      const hddMatch = activeHddFilter === "all" || 
                       (game.hdd || "").includes(activeHddFilter);

      const genreMatch = activeGenreFilter === "all" || 
                         (game.genre || "") === activeGenreFilter;

      const typeMatch = activeGameTypeFilter === "all" || 
                        (game.gameType || "modded") === activeGameTypeFilter;

      const consoleMatch = activeConsoleFilter === "all" || 
                           (game.console || "PS4").toLowerCase() === activeConsoleFilter;

      const favoriteMatch = !activeFavoritesOnly || favoriteGameIds.includes(game.id);

      return textMatch && hddMatch && genreMatch && typeMatch && consoleMatch && favoriteMatch;
    });
  }

  function startShowcase() {
    showcaseGames = getCurrentlyFilteredGames();
    if (showcaseGames.length === 0) {
      showIndexToast("عذراً، لا توجد ألعاب لعرضها في نظام العرض التلقائي! يرجى مسح فلاتر البحث أولاً.", "error");
      return;
    }

    isShowcaseActive = true;
    showcaseCurrentIndex = 0;
    showcaseIsPlaying = true;
    
    if (showcaseOverlay) {
      showcaseOverlay.classList.remove("hidden");
    }

    // Attempt Fullscreen
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.log("Fullscreen requested but not permitted:", e);
    }

    renderActiveShowcaseGame();
    startShowcaseTimers();
  }

  function closeShowcase() {
    isShowcaseActive = false;
    stopShowcaseTimers();
    if (showcaseOverlay) {
      showcaseOverlay.classList.add("hidden");
    }
    
    // Exit Fullscreen
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    } catch (e) {
      console.log("Exit fullscreen errored:", e);
    }
  }

  function renderActiveShowcaseGame() {
    if (showcaseGames.length === 0) return;
    const game = showcaseGames[showcaseCurrentIndex];
    if (!game) return;

    if (showcaseProgress) {
      showcaseProgress.style.width = "0%";
    }

    if (showcaseTitle) showcaseTitle.textContent = game.name || "";
    if (showcaseDesc) showcaseDesc.textContent = game.description || "لا يوجد وصف متوفر لهذه اللعبة حالياً.";
    
    if (showcaseCover) {
      showcaseCover.src = game.cover || "";
      showcaseCover.alt = game.name || "";
      if (!game.cover) showcaseCover.classList.add("hidden");
      else showcaseCover.classList.remove("hidden");
    }
    if (showcaseBgBlur) {
      showcaseBgBlur.style.backgroundImage = game.cover ? `url('${game.cover}')` : "none";
    }

    if (showcaseConsole) {
      showcaseConsole.textContent = (game.console || "PS4").toUpperCase();
      const consoleLower = (game.console || "PS4").toLowerCase();
      if (consoleLower === "ps5") {
        showcaseConsole.className = "px-3.5 py-1 rounded-lg text-xs font-black bg-cyan-500 text-white shadow-md shadow-cyan-500/20";
      } else if (consoleLower === "ps3") {
        showcaseConsole.className = "px-3.5 py-1 rounded-lg text-xs font-black bg-red-600 text-white shadow-md shadow-red-500/20";
      } else if (consoleLower === "xbox") {
        showcaseConsole.className = "px-3.5 py-1 rounded-lg text-xs font-black bg-emerald-600 text-white shadow-md shadow-emerald-500/20";
      } else {
        showcaseConsole.className = "px-3.5 py-1 rounded-lg text-xs font-black bg-ps-blue text-white shadow-md shadow-ps-blue/20";
      }
    }
    if (showcaseGenre) showcaseGenre.textContent = game.genre || "منوعات";
    if (showcaseSize) showcaseSize.textContent = game.size || "0 GB";
    if (showcaseHdd) showcaseHdd.textContent = game.hdd || "غير محدد";
    
    if (showcaseType) {
      if (game.gameType === "account") {
        showcaseType.textContent = "ألعاب حسابات";
        showcaseType.className = "px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400";
      } else if (game.gameType === "maintenance") {
        showcaseType.textContent = "صيانة وإصلاح";
        showcaseType.className = "px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400";
      } else if (game.gameType === "device") {
        showcaseType.textContent = "أجهزة ألعاب";
        showcaseType.className = "px-3 py-1 rounded-lg text-xs font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400";
      } else if (game.gameType === "controller") {
        showcaseType.textContent = "ذراعات وإكسسوار";
        showcaseType.className = "px-3 py-1 rounded-lg text-xs font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400";
      } else {
        showcaseType.textContent = "ألعاب معدلة";
        showcaseType.className = "px-3 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400";
      }
    }

    if (showcaseTotal) showcaseTotal.textContent = showcaseGames.length;
    if (showcaseActiveIndex) {
      showcaseActiveIndex.textContent = `الترتيب: ${showcaseCurrentIndex + 1} / ${showcaseGames.length}`;
    }

    if (showcaseRatingStars) {
      showcaseRatingStars.innerHTML = "";
      const score = parseFloat(game.rating) || 5;
      const fullStars = Math.floor(score);
      const halfStar = score % 1 >= 0.5;
      
      for (let i = 0; i < 5; i++) {
        const star = document.createElement("i");
        if (i < fullStars) {
          star.className = "fa-solid fa-star";
        } else if (i === fullStars && halfStar) {
          star.className = "fa-solid fa-star-half-stroke";
        } else {
          star.className = "fa-regular fa-star text-slate-600";
        }
        showcaseRatingStars.appendChild(star);
      }
    }
    if (showcaseRatingText) {
      showcaseRatingText.textContent = `${game.rating || '5.0'} / 5`;
    }

    // Trigger animations
    if (showcaseCover) {
      showcaseCover.classList.remove("showcase-slide-in");
      void showcaseCover.offsetWidth; 
      showcaseCover.classList.add("showcase-slide-in");
    }
    if (showcaseTitle) {
      showcaseTitle.classList.remove("showcase-slide-in");
      void showcaseTitle.offsetWidth; 
      showcaseTitle.classList.add("showcase-slide-in");
    }
  }

  function startShowcaseTimers() {
    stopShowcaseTimers();
    if (!showcaseIsPlaying) return;

    let elapsed = 0;
    const intervalMs = 100;
    
    showcaseProgressIntervalId = setInterval(() => {
      if (!showcaseIsPlaying) return;
      elapsed += intervalMs;
      const percentage = Math.min((elapsed / showcaseSpeed) * 100, 100);
      if (showcaseProgress) {
        showcaseProgress.style.width = `${percentage}%`;
      }

      if (elapsed >= showcaseSpeed) {
        nextShowcaseGame();
      }
    }, intervalMs);
  }

  function stopShowcaseTimers() {
    if (showcaseProgressIntervalId) {
      clearInterval(showcaseProgressIntervalId);
      showcaseProgressIntervalId = null;
    }
  }

  let showcaseShuffleActive = false;

  function nextShowcaseGame() {
    if (showcaseGames.length === 0) return;
    if (showcaseShuffleActive && showcaseGames.length > 1) {
      let nextIndex = showcaseCurrentIndex;
      while (nextIndex === showcaseCurrentIndex) {
        nextIndex = Math.floor(Math.random() * showcaseGames.length);
      }
      showcaseCurrentIndex = nextIndex;
    } else {
      showcaseCurrentIndex = (showcaseCurrentIndex + 1) % showcaseGames.length;
    }
    renderActiveShowcaseGame();
    startShowcaseTimers();
  }

  function prevShowcaseGame() {
    if (showcaseGames.length === 0) return;
    if (showcaseShuffleActive && showcaseGames.length > 1) {
      let prevIndex = showcaseCurrentIndex;
      while (prevIndex === showcaseCurrentIndex) {
        prevIndex = Math.floor(Math.random() * showcaseGames.length);
      }
      showcaseCurrentIndex = prevIndex;
    } else {
      showcaseCurrentIndex = (showcaseCurrentIndex - 1 + showcaseGames.length) % showcaseGames.length;
    }
    renderActiveShowcaseGame();
    startShowcaseTimers();
  }

  function toggleShowcasePlay() {
    showcaseIsPlaying = !showcaseIsPlaying;
    if (showcaseIsPlaying) {
      if (showcasePlayIcon) showcasePlayIcon.className = "fa-solid fa-pause";
      if (showcasePlayText) showcasePlayText.textContent = "إيقاف مؤقت";
      startShowcaseTimers();
    } else {
      if (showcasePlayIcon) showcasePlayIcon.className = "fa-solid fa-play";
      if (showcasePlayText) showcasePlayText.textContent = "تشغيل تلقائي";
      stopShowcaseTimers();
    }
  }

  const showcaseShuffleBtn = document.getElementById("showcase-shuffle-btn");
  const showcaseShuffleStatus = document.getElementById("showcase-shuffle-status");

  if (showcaseShuffleBtn) {
    showcaseShuffleBtn.addEventListener("click", () => {
      showcaseShuffleActive = !showcaseShuffleActive;
      if (showcaseShuffleActive) {
        if (showcaseShuffleStatus) {
          showcaseShuffleStatus.textContent = "مفعل 🎲";
          showcaseShuffleStatus.className = "text-emerald-400";
        }
        showcaseShuffleBtn.classList.add("bg-emerald-500/10", "border-emerald-500/30", "text-emerald-300");
        showcaseShuffleBtn.classList.remove("bg-slate-800", "border-white/5", "text-slate-300");
        showIndexToast("تم تفعيل التشغيل العشوائي للألعاب في وضع العرض التلقائي.");
      } else {
        if (showcaseShuffleStatus) {
          showcaseShuffleStatus.textContent = "مغلق";
          showcaseShuffleStatus.className = "text-rose-400";
        }
        showcaseShuffleBtn.classList.remove("bg-emerald-500/10", "border-emerald-500/30", "text-emerald-300");
        showcaseShuffleBtn.classList.add("bg-slate-800", "border-white/5", "text-slate-300");
        showIndexToast("تم إيقاف التشغيل العشوائي. سيتم التنقل بالترتيب الافتراضي.");
      }
    });
  }

  if (startShowcaseBtn) startShowcaseBtn.addEventListener("click", startShowcase);
  if (closeShowcaseBtn) closeShowcaseBtn.addEventListener("click", closeShowcase);
  if (showcaseNextBtn) showcaseNextBtn.addEventListener("click", nextShowcaseGame);
  if (showcasePrevBtn) showcasePrevBtn.addEventListener("click", prevShowcaseGame);
  if (showcasePlayBtn) showcasePlayBtn.addEventListener("click", toggleShowcasePlay);
  
  if (showcaseSpeedSelect) {
    showcaseSpeedSelect.addEventListener("change", (e) => {
      showcaseSpeed = parseInt(e.target.value) || 7000;
      startShowcaseTimers();
    });
  }

  // Escape key support
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isShowcaseActive) {
      closeShowcase();
    }
  });

  // Fetch data on boot
  fetchGames();
});

// Fallback image handler
function handleImageError(image) {
  const gameName = image.getAttribute("alt") || "";
  image.onerror = null; // Prevent infinite loop
  const parent = image.parentElement;
  if (parent) {
    parent.innerHTML = `
      <div class="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col justify-center items-center p-4 text-center">
        <div class="text-4xl text-ps-blue/60 mb-2"><i class="fa-solid fa-compact-disc animate-pulse"></i></div>
        <span class="text-xs text-slate-300 font-bold leading-tight line-clamp-3">${gameName}</span>
      </div>
    `;
  }
}
