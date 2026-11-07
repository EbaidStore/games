document.addEventListener("DOMContentLoaded", () => {
  let allGames = [];
  let isEditing = false;
  let activeHddFilter = null;
  let activeCategoryFilter = "all";

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

  // DOM Elements
  const gameForm = document.getElementById("game-form");
  const formTitle = document.getElementById("form-title");
  const submitBtn = document.getElementById("submit-btn");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  
  const gameIdInput = document.getElementById("game-id");
  const nameInput = document.getElementById("name");
  const titleIdInput = document.getElementById("titleId");
  const sizeInput = document.getElementById("size");
  
  // New HDD & Genre Elements
  const hddDropdownToggle = document.getElementById("hdd-dropdown-toggle");
  const hddDropdownMenu = document.getElementById("hdd-dropdown-menu");
  const selectedHddsText = document.getElementById("selected-hdds-text");
  const hddCheckboxesContainer = document.getElementById("hdd-checkboxes-container");
  const hddCustom = document.getElementById("hdd-custom");
  const genreSelect = document.getElementById("genre");
  const genreCustom = document.getElementById("genre-custom");
  const gameTypeSelect = document.getElementById("gameType");
  const formTabModded = document.getElementById("form-tab-modded");
  const formTabAccount = document.getElementById("form-tab-account");
  const formTabMaintenance = document.getElementById("form-tab-maintenance");
  const formTabDevice = document.getElementById("form-tab-device");
  const formTabController = document.getElementById("form-tab-controller");

  const formTabs = [
    { el: formTabModded, value: "modded" },
    { el: formTabAccount, value: "account" },
    { el: formTabMaintenance, value: "maintenance" },
    { el: formTabDevice, value: "device" },
    { el: formTabController, value: "controller" }
  ];
  const consoleSelect = document.getElementById("console");
  const pathInput = document.getElementById("path");
  const trailerUrlInput = document.getElementById("trailer-url");
  const ratingInput = document.getElementById("rating");
  const descriptionInput = document.getElementById("description");

  // HDD Manager Elements & Variables
  const newHddNameInput = document.getElementById("new-hdd-name");
  const addHddBtn = document.getElementById("add-hdd-btn");
  const hddsBadgesContainer = document.getElementById("hdds-badges-container");
  let loadedHdds = [];

  // Rename HDD Modal Elements
  const renameHddModal = document.getElementById("rename-hdd-modal");
  const closeRenameModal = document.getElementById("close-rename-modal");
  const cancelRenameBtn = document.getElementById("cancel-rename-btn");
  const saveRenameBtn = document.getElementById("save-rename-btn");
  const renameHddOldName = document.getElementById("rename-hdd-old-name");
  const renameHddNewName = document.getElementById("rename-hdd-new-name");

  // Delete HDD Modal Elements
  const deleteHddModal = document.getElementById("delete-hdd-modal");
  const closeDeleteHddModal = document.getElementById("close-delete-hdd-modal");
  const cancelDeleteHddBtn = document.getElementById("cancel-delete-hdd-btn");
  const confirmDeleteHddBtn = document.getElementById("confirm-delete-hdd-btn");
  const deleteHddNameInput = document.getElementById("delete-hdd-name");
  const deleteHddText = document.getElementById("delete-hdd-text");

  // Delete Game Modal Elements
  const deleteGameModal = document.getElementById("delete-game-modal");
  const closeDeleteGameModal = document.getElementById("close-delete-game-modal");
  const cancelDeleteGameBtn = document.getElementById("cancel-delete-game-btn");
  const confirmDeleteGameBtn = document.getElementById("confirm-delete-game-btn");
  const deleteGameIdInput = document.getElementById("delete-game-id");
  const deleteGameText = document.getElementById("delete-game-text");

  // Reminder Elements & Variables
  const showAddReminderBtn = document.getElementById("show-add-reminder-btn");
  const addReminderSection = document.getElementById("add-reminder-section");
  const remNameInput = document.getElementById("rem-name");
  const remTypeSelect = document.getElementById("rem-type");
  const remTitleIdInput = document.getElementById("rem-titleId");
  const remHddSelect = document.getElementById("rem-hdd");
  const remPathInput = document.getElementById("rem-path");
  const remNotesInput = document.getElementById("rem-notes");
  const cancelReminderBtn = document.getElementById("cancel-reminder-btn");
  const saveReminderBtn = document.getElementById("save-reminder-btn");
  const remindersListContainer = document.getElementById("reminders-list-container");
  let loadedReminders = [];

  // Google Search Elements
  const googleSearchBtn = document.getElementById("google-search-btn");
  
  const dropzone = document.getElementById("dropzone");
  const coverFileInput = document.getElementById("cover-file");
  const coverUrlInput = document.getElementById("cover-url");
  const uploadPrompt = document.getElementById("upload-prompt");
  const uploadLoading = document.getElementById("upload-loading");
  const previewContainer = document.getElementById("upload-preview-container");
  const previewImg = document.getElementById("upload-preview");
  const removeCoverBtn = document.getElementById("remove-cover");
  
  const adminGamesList = document.getElementById("admin-games-list");
  const noAdminGames = document.getElementById("no-admin-games");
  const adminSearch = document.getElementById("admin-search");
  
  // Layout views and buttons
  const adminTableView = document.getElementById("admin-table-view");
  const adminGridView = document.getElementById("admin-grid-view");
  const btnViewGrid = document.getElementById("btn-view-grid");
  const btnViewTable = document.getElementById("btn-view-table");
  let currentLayout = localStorage.getItem("adminLayout") || "grid"; // default to grid for easier browsing

  function updateLayoutToggleUI() {
    if (currentLayout === "grid") {
      if (adminTableView) adminTableView.classList.add("hidden");
      if (adminGridView) adminGridView.classList.remove("hidden");
      
      if (btnViewGrid) {
        btnViewGrid.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition text-white bg-ps-blue shadow cursor-pointer";
      }
      if (btnViewTable) {
        btnViewTable.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition text-slate-400 hover:text-white cursor-pointer";
      }
    } else {
      if (adminTableView) adminTableView.classList.remove("hidden");
      if (adminGridView) adminGridView.classList.add("hidden");
      
      if (btnViewGrid) {
        btnViewGrid.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition text-slate-400 hover:text-white cursor-pointer";
      }
      if (btnViewTable) {
        btnViewTable.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition text-white bg-ps-blue shadow cursor-pointer";
      }
    }
  }

  if (btnViewGrid) {
    btnViewGrid.addEventListener("click", () => {
      currentLayout = "grid";
      localStorage.setItem("adminLayout", "grid");
      updateLayoutToggleUI();
    });
  }

  if (btnViewTable) {
    btnViewTable.addEventListener("click", () => {
      currentLayout = "table";
      localStorage.setItem("adminLayout", "table");
      updateLayoutToggleUI();
    });
  }

  // Initialize layout selection
  updateLayoutToggleUI();
  
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  const toastIcon = document.getElementById("toast-icon");

  // Dynamic Path Generator Helper
  function updatePathFromSelections() {
    const customCb = document.getElementById("hdd-checkbox-custom");
    if (customCb && customCb.checked) {
      hddCustom.classList.remove("hidden");
    } else {
      hddCustom.classList.add("hidden");
    }

    // Genre selection handling
    if (genreSelect.value === "custom") {
      genreCustom.classList.remove("hidden");
    } else {
      genreCustom.classList.add("hidden");
    }

    // Get checked HDDs
    const selectedHdds = [];
    document.querySelectorAll(".hdd-checkbox:checked").forEach(cb => {
      selectedHdds.push(cb.value);
    });
    
    if (customCb && customCb.checked) {
      const customVal = hddCustom.value.trim();
      if (customVal) {
        selectedHdds.push(customVal);
      }
    }

    const hddVal = selectedHdds.join(", ");
    
    // Update Dropdown button text
    if (selectedHddsText) {
      if (selectedHdds.length > 0) {
        selectedHddsText.textContent = hddVal;
        selectedHddsText.className = "text-white font-semibold text-sm truncate";
      } else {
        selectedHddsText.textContent = "اختر الهارد...";
        selectedHddsText.className = "text-slate-400 font-semibold text-sm truncate";
      }
    }

    const genreVal = genreSelect.value === "custom" ? genreCustom.value.trim() : genreSelect.value;

    if (hddVal && genreVal) {
      pathInput.value = `${hddVal} > ${genreVal}`;
    } else {
      pathInput.value = hddVal || genreVal || "";
    }
  }

  // Toggle HDD Dropdown Menu
  if (hddDropdownToggle && hddDropdownMenu) {
    hddDropdownToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      hddDropdownMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!hddDropdownMenu.classList.contains("hidden") && !hddDropdownMenu.contains(e.target) && e.target !== hddDropdownToggle) {
        hddDropdownMenu.classList.add("hidden");
      }
    });
  }

  // Event Listeners for selectors
  genreSelect.addEventListener("change", updatePathFromSelections);
  hddCustom.addEventListener("input", updatePathFromSelections);
  genreCustom.addEventListener("input", updatePathFromSelections);

  // HDD Manager Logic & UI Rendering
  async function fetchHdds() {
    try {
      let response;
      const isGitHubPages = window.location.hostname.includes("github.io") || window.location.protocol === "file:";
      if (!isGitHubPages) {
        try { response = await fetch("/api/hdds"); } catch (e) {}
      }
      if (!response || !response.ok) {
        response = await fetch("./hdds.json");
      }
      if (!response.ok) throw new Error("Failed to load HDDs");
      loadedHdds = await response.json();
      populateHddCheckboxes([]);
      renderHddsBadges();
      populateRemHddDropdown();
    } catch (error) {
      console.error(error);
      showToast("فشل في تحميل قائمة الهارد ديسك من السيرفر", "error");
    }
  }

  function populateHddCheckboxes(selectedHdds = []) {
    if (!hddCheckboxesContainer) return;
    
    hddCheckboxesContainer.innerHTML = "";
    
    let hasCustomValue = false;
    let customValue = "";
    
    // Detect custom value
    selectedHdds.forEach(h => {
      if (h && h !== "custom" && !loadedHdds.includes(h)) {
        hasCustomValue = true;
        customValue = h;
      }
    });
    
    loadedHdds.forEach(hdd => {
      const div = document.createElement("div");
      div.className = "flex items-center gap-2 cursor-pointer py-1 select-none border-b border-slate-900/40 last:border-0";
      
      const isChecked = selectedHdds.includes(hdd);
      
      div.innerHTML = `
        <input 
          type="checkbox" 
          value="${hdd}" 
          class="hdd-checkbox w-4 h-4 text-ps-blue bg-slate-900 border-slate-700 rounded focus:ring-ps-blue focus:ring-2 cursor-pointer"
          ${isChecked ? "checked" : ""}
        />
        <span class="text-xs text-slate-300 font-medium">${hdd}</span>
      `;
      
      div.addEventListener("click", (e) => {
        if (e.target.tagName !== "INPUT") {
          const cb = div.querySelector("input");
          cb.checked = !cb.checked;
          updatePathFromSelections();
        }
      });
      
      div.querySelector("input").addEventListener("change", updatePathFromSelections);
      
      hddCheckboxesContainer.appendChild(div);
    });
    
    // Custom checkbox option
    const customDiv = document.createElement("div");
    customDiv.className = "flex items-center gap-2 cursor-pointer py-1.5 select-none pt-1.5 border-t border-ps-border/20 mt-1.5";
    
    const isCustomChecked = selectedHdds.includes("custom") || hasCustomValue;
    
    customDiv.innerHTML = `
      <input 
        type="checkbox" 
        id="hdd-checkbox-custom" 
        value="custom" 
        class="w-4 h-4 text-ps-blue bg-slate-900 border-slate-700 rounded focus:ring-ps-blue focus:ring-2 cursor-pointer"
        ${isCustomChecked ? "checked" : ""}
      />
      <span class="text-xs text-slate-400 font-medium italic">أخرى (كتابة يدوي)...</span>
    `;
    
    customDiv.addEventListener("click", (e) => {
      if (e.target.tagName !== "INPUT") {
        const cb = customDiv.querySelector("input");
        cb.checked = !cb.checked;
        updatePathFromSelections();
      }
    });
    
    customDiv.querySelector("input").addEventListener("change", updatePathFromSelections);
    
    hddCheckboxesContainer.appendChild(customDiv);
    
    if (isCustomChecked) {
      hddCustom.value = customValue;
      hddCustom.classList.remove("hidden");
    } else {
      hddCustom.value = "";
      hddCustom.classList.add("hidden");
    }
    
    updatePathFromSelections();
  }

  function renderHddsBadges() {
    if (!hddsBadgesContainer) return;
    hddsBadgesContainer.innerHTML = "";
    
    if (loadedHdds.length === 0) {
      hddsBadgesContainer.innerHTML = `
        <div class="col-span-full text-center py-6 text-slate-500 text-xs italic bg-slate-900/40 rounded-xl border border-dashed border-ps-border">
          <i class="fa-solid fa-hard-drive text-lg mb-1 block text-slate-600"></i>
          لا توجد هاردات مضافة حالياً.
        </div>
      `;
      return;
    }
    
    // Load current capacities from localStorage
    let hddCapacities = {};
    try {
      hddCapacities = JSON.parse(localStorage.getItem("ps4_hdd_capacities")) || {};
    } catch(e) {
      hddCapacities = {};
    }

    loadedHdds.forEach(hdd => {
      // Find games associated with this hdd
      const hddGames = allGames.filter(game => {
        if (!game.hdd) return false;
        return game.hdd.split(",").map(h => h.trim()).includes(hdd);
      });
      
      const gamesCount = hddGames.length;
      const totalSizeGB = hddGames.reduce((sum, game) => sum + parseSizeToGB(game.size), 0);
      const capacity = hddCapacities[hdd] ? parseInt(hddCapacities[hdd]) : 0;

      const card = document.createElement("div");
      card.dataset.hdd = hdd;
      
      const isSelected = activeHddFilter === hdd;
      if (isSelected) {
        card.className = "hdd-card-container bg-slate-900 border-2 border-ps-blue rounded-xl p-3 shadow-md transition duration-200 cursor-pointer flex flex-col justify-between gap-2.5 relative shadow-[0_0_15px_rgba(0,114,206,0.25)] scale-[1.02]";
      } else {
        card.className = "hdd-card-container bg-slate-900 border border-ps-border hover:border-slate-700/60 rounded-xl p-3 shadow-sm hover:shadow transition duration-200 cursor-pointer flex flex-col justify-between gap-2.5 relative";
      }

      // Progress calculation
      let progressHtml = "";
      if (capacity > 0) {
        const percent = Math.min((totalSizeGB / capacity) * 100, 100);
        const remainingGB = Math.max(capacity - totalSizeGB, 0);
        
        let progressColor = "bg-ps-blue";
        if (percent > 95) {
          progressColor = "bg-rose-600 animate-pulse";
        } else if (percent > 85) {
          progressColor = "bg-amber-500";
        }

        progressHtml = `
          <div class="space-y-1 w-full">
            <div class="flex justify-between items-center text-[10px]">
              <span class="text-slate-400">مستعمل: <strong class="text-white">${totalSizeGB.toFixed(0)} GB</strong> (${percent.toFixed(0)}%)</span>
              <span class="text-amber-400 font-mono font-semibold">متبقي: ${remainingGB.toFixed(0)} GB</span>
            </div>
            <div class="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div class="${progressColor} h-full rounded-full transition-all duration-500" style="width: ${percent}%"></div>
            </div>
          </div>
        `;
      } else {
        progressHtml = `
          <div class="space-y-1 w-full">
            <div class="flex justify-between items-center text-[10px]">
              <span class="text-slate-400">مستعمل: <strong class="text-white">${totalSizeGB.toFixed(0)} GB</strong></span>
              <span class="text-slate-500 italic">اضبط السعة لحساب المتبقي</span>
            </div>
            <div class="w-full bg-slate-950/40 rounded-full h-1 border-dashed border border-slate-800"></div>
          </div>
        `;
      }

      card.innerHTML = `
        <!-- Active Filter indicator -->
        <span class="active-indicator absolute top-2 left-2 text-ps-blue ${isSelected ? "" : "hidden"}" title="تصفية نشطة">
          <i class="fa-solid fa-circle-check text-sm"></i>
        </span>

        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <h4 class="font-bold text-white text-sm truncate flex items-center gap-1.5">
              <i class="fa-solid fa-hard-drive ${isSelected ? "text-ps-blue" : "text-slate-400"}"></i>
              <span>${hdd}</span>
            </h4>
            <div class="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-semibold">
              <span class="bg-ps-blue/10 text-ps-blue border border-ps-blue/25 px-1.5 py-0.5 rounded flex items-center gap-1">
                <i class="fa-solid fa-compact-disc text-[9px]"></i> ${gamesCount} لعبة
              </span>
            </div>
          </div>
        </div>

        ${progressHtml}

        <!-- Card bottom controls -->
        <div class="flex items-center justify-between border-t border-slate-800/60 pt-2 mt-1 gap-1.5">
          <!-- Capacity setup -->
          <div class="flex items-center gap-1 shrink-0" onclick="event.stopPropagation()">
            <label class="text-[9px] text-slate-500">السعة:</label>
            <select class="capacity-selector bg-slate-950 text-[10px] text-slate-300 rounded border border-ps-border px-1 py-0.5 focus:outline-none focus:border-ps-blue cursor-pointer font-semibold">
              <option value="0" ${capacity === 0 ? "selected" : ""}>غير محدد</option>
              <option value="500" ${capacity === 500 ? "selected" : ""}>500 GB</option>
              <option value="1000" ${capacity === 1000 ? "selected" : ""}>1 TB</option>
              <option value="2000" ${capacity === 2000 ? "selected" : ""}>2 TB</option>
              <option value="4000" ${capacity === 4000 ? "selected" : ""}>4 TB</option>
              <option value="8000" ${capacity === 8000 ? "selected" : ""}>8 TB</option>
            </select>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1" onclick="event.stopPropagation()">
            <button type="button" class="rename-hdd-btn text-slate-400 hover:text-amber-400 p-1 rounded-md hover:bg-amber-400/10 transition duration-150 text-[10px]" title="تعديل اسم الهارد">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button type="button" class="delete-hdd-btn text-slate-400 hover:text-rose-500 p-1 rounded-md hover:bg-rose-500/10 transition duration-150 text-[10px]" title="حذف الهارد">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;

      // Card click event -> toggle filter
      card.addEventListener("click", () => {
        if (activeHddFilter === hdd) {
          activeHddFilter = null; // deselect
        } else {
          activeHddFilter = hdd; // select
        }
        applyAdminFilters();
      });

      // Actions event listeners inside card controls
      const capacitySelector = card.querySelector(".capacity-selector");
      capacitySelector.addEventListener("change", (e) => {
        const val = parseInt(e.target.value);
        let currentCaps = {};
        try {
          currentCaps = JSON.parse(localStorage.getItem("ps4_hdd_capacities")) || {};
        } catch(err) {
          currentCaps = {};
        }
        if (val > 0) {
          currentCaps[hdd] = val;
        } else {
          delete currentCaps[hdd];
        }
        localStorage.setItem("ps4_hdd_capacities", JSON.stringify(currentCaps));
        renderHddsBadges();
        showToast(`تم تحديث سعة الهارد "${hdd}" بنجاح!`);
      });

      const renameBtn = card.querySelector(".rename-hdd-btn");
      renameBtn.addEventListener("click", () => openRenameModal(hdd));

      const deleteBtn = card.querySelector(".delete-hdd-btn");
      deleteBtn.addEventListener("click", () => deleteHdd(hdd));

      hddsBadgesContainer.appendChild(card);
    });
  }

  async function addHdd() {
    const hddName = newHddNameInput.value.trim();
    if (!hddName) {
      showToast("يرجى كتابة اسم الهارد ديسك أولاً", "warning");
      return;
    }
    
    try {
      const response = await fetch("/api/hdds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: hddName })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to add HDD");
      }
      
      newHddNameInput.value = "";
      loadedHdds = data;
      populateHddCheckboxes([]);
      renderHddsBadges();
      showToast(`تمت إضافة الهارد "${hddName}" بنجاح!`);
    } catch (error) {
      console.error(error);
      showToast(error.message || "فشل إضافة الهارد ديسك الجديد", "error");
    }
  }

  function deleteHdd(hddName) {
    if (!deleteHddModal) return;
    deleteHddNameInput.value = hddName;
    deleteHddText.textContent = `هل أنت متأكد من حذف الهارد ديسك "${hddName}"؟ لن يتم حذف الألعاب المرتبطة به، لكن لن يظهر في القائمة المنسدلة.`;
    deleteHddModal.classList.remove("hidden");
    deleteHddModal.classList.add("flex");
  }

  function closeDeleteHddModalFunc() {
    if (!deleteHddModal) return;
    deleteHddModal.classList.remove("flex");
    deleteHddModal.classList.add("hidden");
  }

  async function executeDeleteHdd() {
    const hddName = deleteHddNameInput.value.trim();
    if (!hddName) return;
    
    try {
      const response = await fetch("/api/hdds", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: hddName })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete HDD");
      }
      
      loadedHdds = data;
      populateHddCheckboxes([]);
      renderHddsBadges();
      showToast(`تم حذف الهارد "${hddName}" بنجاح.`);
      closeDeleteHddModalFunc();
    } catch (error) {
      console.error(error);
      showToast(error.message || "فشل حذف الهارد ديسك", "error");
    }
  }

  function openRenameModal(oldName) {
    if (!renameHddModal) return;
    renameHddOldName.value = oldName;
    renameHddNewName.value = oldName;
    renameHddModal.classList.remove("hidden");
    renameHddModal.classList.add("flex");
    setTimeout(() => renameHddNewName.focus(), 100);
  }

  function closeRenameModalFunc() {
    if (!renameHddModal) return;
    renameHddModal.classList.remove("flex");
    renameHddModal.classList.add("hidden");
  }

  async function saveRenameHdd() {
    const oldName = renameHddOldName.value.trim();
    const newName = renameHddNewName.value.trim();
    
    if (!newName) {
      showToast("اسم الهارد ديسك الجديد لا يمكن أن يكون فارغاً", "warning");
      return;
    }
    
    if (newName.toLowerCase() === oldName.toLowerCase()) {
      closeRenameModalFunc();
      return; // No change
    }
    
    try {
      const response = await fetch("/api/hdds", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldName, newName })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to rename HDD");
      }
      
      loadedHdds = data;
      populateHddCheckboxes([]);
      renderHddsBadges();
      fetchGames(); // Refetch games since some associated games might have their HDD names updated!
      showToast(`تم تغيير اسم الهارد من "${oldName}" إلى "${newName}" بنجاح!`);
      closeRenameModalFunc();
    } catch (error) {
      console.error(error);
      showToast(error.message || "فشل في تعديل اسم الهارد ديسك", "error");
    }
  }

  // HDD Manager Listeners
  if (addHddBtn) {
    addHddBtn.addEventListener("click", addHdd);
  }
  if (newHddNameInput) {
    newHddNameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addHdd();
      }
    });
  }

  // Rename HDD Modal Listeners
  if (closeRenameModal) {
    closeRenameModal.addEventListener("click", closeRenameModalFunc);
  }
  if (cancelRenameBtn) {
    cancelRenameBtn.addEventListener("click", closeRenameModalFunc);
  }
  if (saveRenameBtn) {
    saveRenameBtn.addEventListener("click", saveRenameHdd);
  }
  if (renameHddNewName) {
    renameHddNewName.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveRenameHdd();
      }
    });
  }

  // Delete HDD Modal Listeners
  if (closeDeleteHddModal) {
    closeDeleteHddModal.addEventListener("click", closeDeleteHddModalFunc);
  }
  if (cancelDeleteHddBtn) {
    cancelDeleteHddBtn.addEventListener("click", closeDeleteHddModalFunc);
  }
  if (confirmDeleteHddBtn) {
    confirmDeleteHddBtn.addEventListener("click", executeDeleteHdd);
  }

  // Delete Game Modal Listeners
  if (closeDeleteGameModal) {
    closeDeleteGameModal.addEventListener("click", closeDeleteGameModalFunc);
  }
  if (cancelDeleteGameBtn) {
    cancelDeleteGameBtn.addEventListener("click", closeDeleteGameModalFunc);
  }
  if (confirmDeleteGameBtn) {
    confirmDeleteGameBtn.addEventListener("click", executeDeleteGame);
  }

  // Populate genre dropdown dynamically based on standard genres and user-defined custom ones
  function populateGenreDropdown() {
    if (!genreSelect) return;
    
    const currentValue = genreSelect.value;
    
    const standardGenres = [
      "أكشن", 
      "مغامرات", 
      "رياضة", 
      "رعب", 
      "سباق", 
      "شوتر", 
      "عائلي", 
      "قتال", 
      "عالم مفتوح", 
      "أطفال", 
      "ألغاز", 
      "محاكاة", 
      "RPG", 
      "تحديث وإضافات"
    ];
    
    const uniqueGenres = new Set(standardGenres);
    if (Array.isArray(allGames)) {
      allGames.forEach(game => {
        if (game.genre) {
          const trimmed = game.genre.trim();
          if (trimmed && trimmed.toLowerCase() !== "custom") {
            uniqueGenres.add(trimmed);
          }
        }
      });
    }
    
    genreSelect.innerHTML = "";
    
    uniqueGenres.forEach(genre => {
      const option = document.createElement("option");
      option.value = genre;
      option.textContent = genre;
      genreSelect.appendChild(option);
    });
    
    const customOption = document.createElement("option");
    customOption.value = "custom";
    customOption.textContent = "أخرى (كتابة يدوي مخصص)...";
    genreSelect.appendChild(customOption);
    
    if (currentValue && Array.from(genreSelect.options).some(opt => opt.value === currentValue)) {
      genreSelect.value = currentValue;
    } else {
      genreSelect.value = "أكشن";
    }
  }

  // Fetch games initially
  async function fetchGames() {
    try {
      let response;
      const isGitHubPages = window.location.hostname.includes("github.io") || window.location.protocol === "file:";
      if (!isGitHubPages) {
        try { response = await fetch("/api/games"); } catch (e) {}
      }
      if (!response || !response.ok) {
        response = await fetch("./games.json");
      }
      if (!response.ok) throw new Error("Failed to load games");
      allGames = await response.json();
      allGames.forEach(g => {
        if (g.cover && g.cover.startsWith("/") && !g.cover.startsWith("//")) {
          g.cover = "." + g.cover;
        }
      });
      populateGenreDropdown();
      applyAdminFilters();
      renderHddsBadges();
    } catch (error) {
      console.error(error);
      showToast("فشل في تحميل قائمة الألعاب", "error");
    }
  }

  // Render games table and grid views
  function renderAdminTable(gamesToRender) {
    adminGamesList.innerHTML = "";
    if (adminGridView) adminGridView.innerHTML = "";
    
    if (gamesToRender.length === 0) {
      noAdminGames.classList.remove("hidden");
      return;
    }
    
    noAdminGames.classList.add("hidden");
    
    gamesToRender.forEach(game => {
      // --- Render Table Row ---
      const tr = document.createElement("tr");
      tr.className = "hover:bg-slate-800/20 border-b border-ps-border transition duration-200";
      
      const coverHtml = game.cover 
        ? `<img src="${game.cover}" class="w-10 h-14 object-cover rounded-md border border-ps-border shadow" alt="${game.name}" />`
        : `<div class="w-10 h-14 bg-slate-800 rounded-md border border-ps-border flex items-center justify-center text-slate-500 text-xs"><i class="fa-solid fa-compact-disc"></i></div>`;
      
      let typeBadgeHtml = "";
      if (game.gameType === "account") {
        typeBadgeHtml = `<span class="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold px-1.5 py-0.5 rounded ml-2"><i class="fa-solid fa-user-check text-[8px]"></i>أكونت</span>`;
      } else if (game.gameType === "maintenance") {
        typeBadgeHtml = `<span class="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-extrabold px-1.5 py-0.5 rounded ml-2"><i class="fa-solid fa-screwdriver-wrench text-[8px]"></i>صيانة</span>`;
      } else if (game.gameType === "device") {
        typeBadgeHtml = `<span class="inline-flex items-center gap-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-extrabold px-1.5 py-0.5 rounded ml-2"><i class="fa-solid fa-laptop text-[8px]"></i>جهاز</span>`;
      } else if (game.gameType === "controller") {
        typeBadgeHtml = `<span class="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-extrabold px-1.5 py-0.5 rounded ml-2"><i class="fa-solid fa-gamepad text-[8px]"></i>ذراع</span>`;
      } else {
        typeBadgeHtml = `<span class="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-extrabold px-1.5 py-0.5 rounded ml-2"><i class="fa-solid fa-code-compare text-[8px]"></i>معدلة</span>`;
      }

      const consoleVal = (game.console || "PS4").toUpperCase();
      const consoleBadgeHtml = `<span class="inline-flex items-center gap-1 bg-ps-blue/10 text-ps-blue border border-ps-blue/20 text-[10px] font-extrabold px-1.5 py-0.5 rounded ml-2"><i class="fa-solid fa-gamepad text-[8px]"></i>${consoleVal}</span>`;

      tr.innerHTML = `
        <td class="py-3 px-5">
          <div class="flex items-center gap-3">
            ${coverHtml}
            <div class="min-w-0">
              <div class="font-bold text-white truncate max-w-xs sm:max-w-md flex items-center gap-1.5">
                <span>${game.name}</span>
                ${game.trailerUrl ? `<i class="fa-brands fa-youtube text-red-500 text-sm" title="يوجد تريلر"></i>` : ""}
              </div>
              <div class="text-xs text-ps-blue font-mono uppercase tracking-wider flex items-center gap-2">
                <span>${game.titleId || "N/A"}</span>
                ${typeBadgeHtml}
                ${consoleBadgeHtml}
              </div>
            </div>
          </div>
        </td>
        <td class="py-3 px-5 text-slate-300 font-semibold">${game.path || "غير مححدد"}</td>
        <td class="py-3 px-5 text-amber-400 font-mono text-xs">${game.size || "غير محدد"}</td>
        <td class="py-3 px-5">
          <div class="flex justify-center items-center gap-2">
            <!-- Edit Button -->
            <button 
              class="edit-btn text-xs bg-slate-800 hover:bg-ps-blue text-slate-300 hover:text-white px-3 py-2 rounded-lg border border-slate-700 hover:border-ps-blue transition duration-200 flex items-center gap-1.5 cursor-pointer"
              data-id="${game.id}"
            >
              <i class="fa-solid fa-pen-to-square"></i>
              <span>تعديل</span>
            </button>
            <!-- Delete Button -->
            <button 
              class="delete-btn text-xs bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white px-3 py-2 rounded-lg border border-slate-700 hover:border-rose-600 transition duration-200 flex items-center gap-1.5 cursor-pointer"
              data-id="${game.id}"
              data-name="${game.name}"
            >
              <i class="fa-solid fa-trash-can"></i>
              <span>حذف</span>
            </button>
          </div>
        </td>
      `;
      adminGamesList.appendChild(tr);

      // --- Render Grid Card ---
      if (adminGridView) {
        const card = document.createElement("div");
        card.className = "bg-slate-800/40 border border-ps-border rounded-xl overflow-hidden flex flex-col hover:border-ps-blue transition-all duration-300 shadow group relative hover:-translate-y-1";
        
        const cardCoverHtml = game.cover 
          ? `<img src="${game.cover}" class="w-full aspect-[3/4] object-cover rounded-t-xl group-hover:scale-105 transition duration-300" alt="${game.name}" referrerpolicy="no-referrer" />`
          : `<div class="w-full aspect-[3/4] bg-slate-800/80 flex flex-col items-center justify-center text-slate-500 gap-2"><i class="fa-solid fa-compact-disc text-3xl"></i><span class="text-xs">بدون غلاف</span></div>`;
        
        let cardTypeBadge = "";
        if (game.gameType === "account") {
          cardTypeBadge = `<span class="absolute top-2 right-2 bg-emerald-500/90 backdrop-blur text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-md flex items-center gap-1"><i class="fa-solid fa-user-check text-[7px]"></i>حساب</span>`;
        } else if (game.gameType === "maintenance") {
          cardTypeBadge = `<span class="absolute top-2 right-2 bg-amber-500/95 backdrop-blur text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-md flex items-center gap-1"><i class="fa-solid fa-screwdriver-wrench text-[7px]"></i>صيانة</span>`;
        } else if (game.gameType === "device") {
          cardTypeBadge = `<span class="absolute top-2 right-2 bg-cyan-500/95 backdrop-blur text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-md flex items-center gap-1"><i class="fa-solid fa-laptop text-[7px]"></i>جهاز</span>`;
        } else if (game.gameType === "controller") {
          cardTypeBadge = `<span class="absolute top-2 right-2 bg-rose-500/95 backdrop-blur text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-md flex items-center gap-1"><i class="fa-solid fa-gamepad text-[7px]"></i>ذراع</span>`;
        } else {
          cardTypeBadge = `<span class="absolute top-2 right-2 bg-indigo-500/90 backdrop-blur text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-md flex items-center gap-1"><i class="fa-solid fa-code-compare text-[7px]"></i>معدلة</span>`;
        }

        const cardSizeBadge = game.size
          ? `<span class="absolute top-2 left-2 bg-slate-900/90 backdrop-blur text-amber-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-md flex items-center gap-1"><i class="fa-solid fa-weight-hanging text-[7px]"></i>${game.size}</span>`
          : "";

        card.innerHTML = `
          <div class="relative overflow-hidden aspect-[3/4] bg-slate-900">
            ${cardCoverHtml}
            ${cardTypeBadge}
            ${cardSizeBadge}
          </div>
          
          <div class="p-3 flex-1 flex flex-col min-w-0">
            <div class="font-bold text-white text-xs truncate mb-1 group-hover:text-ps-blue transition duration-200 flex items-center gap-1">
              <span class="truncate">${game.name}</span>
              ${game.trailerUrl ? `<i class="fa-brands fa-youtube text-red-500 text-sm shrink-0" title="يوجد تريلر"></i>` : ""}
            </div>
            
            <div class="text-[10px] text-ps-blue font-mono uppercase tracking-wider mb-2 flex justify-between items-center">
              <span>${game.titleId || "N/A"}</span>
              <span class="bg-ps-blue/20 text-ps-blue border border-ps-blue/30 px-1.5 py-0.5 rounded text-[9px] font-extrabold">${(game.console || "PS4").toUpperCase()}</span>
            </div>

            <div class="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1 mt-auto bg-slate-900/40 p-1.5 rounded border border-ps-border/20">
              <i class="fa-solid fa-hdd text-ps-blue text-[9px] shrink-0"></i>
              <span class="truncate" title="${game.path || "غير محدد"}">${game.path || "غير محدد"}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-1.5 p-2 border-t border-ps-border bg-slate-900/40">
            <button 
              class="edit-btn text-[10px] bg-slate-800 hover:bg-ps-blue text-slate-300 hover:text-white px-2 py-1.5 rounded-lg border border-slate-700 hover:border-ps-blue transition duration-200 flex items-center justify-center gap-1 cursor-pointer"
              data-id="${game.id}"
            >
              <i class="fa-solid fa-pen-to-square"></i>
              <span>تعديل</span>
            </button>
            <button 
              class="delete-btn text-[10px] bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white px-2 py-1.5 rounded-lg border border-slate-700 hover:border-rose-600 transition duration-200 flex items-center justify-center gap-1 cursor-pointer"
              data-id="${game.id}"
              data-name="${game.name}"
            >
              <i class="fa-solid fa-trash-can"></i>
              <span>حذف</span>
            </button>
          </div>
        `;
        adminGridView.appendChild(card);
      }
    });

    // Wire up events
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.currentTarget.getAttribute("data-id"));
        const game = allGames.find(g => g.id === id);
        if (game) enterEditMode(game);
      });
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.currentTarget.getAttribute("data-id"));
        const name = e.currentTarget.getAttribute("data-name");
        confirmAndDeleteGame(id, name);
      });
    });
  }

  // Toast notifications helper
  function showToast(message, type = "success") {
    toastMessage.textContent = message;
    
    if (type === "success") {
      toast.querySelector("div").className = "bg-slate-800 border-r-4 border-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3";
      toastIcon.className = "text-emerald-500 text-xl";
      toastIcon.innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
    } else {
      toast.querySelector("div").className = "bg-slate-800 border-r-4 border-rose-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3";
      toastIcon.className = "text-rose-500 text-xl";
      toastIcon.innerHTML = `<i class="fa-solid fa-circle-xmark"></i>`;
    }
    
    toast.classList.remove("opacity-0", "translate-y-20");
    
    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-20");
    }, 4000);
  }

  // Drag and Drop Cover events
  dropzone.addEventListener("click", () => coverFileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    
    if (e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  coverFileInput.addEventListener("change", () => {
    if (coverFileInput.files.length > 0) {
      handleFileSelected(coverFileInput.files[0]);
    }
  });

  // Handle file upload
  async function handleFileSelected(file) {
    if (!file.type.startsWith("image/")) {
      showToast("يرجى اختيار ملف صورة صالح", "error");
      return;
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append("cover", file);

    // Show loading
    uploadPrompt.classList.add("hidden");
    uploadLoading.classList.remove("hidden");
    previewContainer.classList.add("hidden");

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Upload failed");
      
      const result = await response.json();
      
      // Save cover URL
      coverUrlInput.value = result.cover;
      
      // Update preview
      previewImg.src = result.cover;
      uploadLoading.classList.add("hidden");
      previewContainer.classList.remove("hidden");
      showToast("تم رفع صورة الغلاف بنجاح!");
    } catch (error) {
      console.error(error);
      uploadLoading.classList.add("hidden");
      uploadPrompt.classList.remove("hidden");
      showToast("فشل رفع صورة الغلاف", "error");
    }
  }

  // Remove Cover action
  removeCoverBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Avoid triggering file selection
    coverFileInput.value = "";
    coverUrlInput.value = "";
    previewContainer.classList.add("hidden");
    uploadPrompt.classList.remove("hidden");
  });

  // Edit Mode
  function enterEditMode(game) {
    isEditing = true;
    
    // Fill out form
    gameIdInput.value = game.id;
    nameInput.value = game.name;
    titleIdInput.value = game.titleId || "";
    sizeInput.value = game.size || "";
    pathInput.value = game.path || "";
    coverUrlInput.value = game.cover || "";
    trailerUrlInput.value = game.trailerUrl || "";
    ratingInput.value = game.rating || "";
    descriptionInput.value = game.description || "";
    gameTypeSelect.value = game.gameType || "modded";
    consoleSelect.value = game.console || "PS4";

    // Check associated HDDs
    const selectedHdds = typeof game.hdd === "string" 
      ? game.hdd.split(",").map(h => h.trim()) 
      : (Array.isArray(game.hdd) ? game.hdd : [game.hdd]);
    populateHddCheckboxes(selectedHdds);

    // Select Genre dropdown option
    const genreVal = game.genre || "";
    const optionExists = Array.from(genreSelect.options).some(opt => opt.value === genreVal);
    if (optionExists && genreVal) {
      genreSelect.value = genreVal;
      genreCustom.classList.add("hidden");
      genreCustom.value = "";
    } else if (genreVal) {
      genreSelect.value = "custom";
      genreCustom.value = genreVal;
      genreCustom.classList.remove("hidden");
    } else {
      const parts = (game.path || "").split(">").map(p => p.trim());
      if (parts[1]) {
        let matchedGenre = parts[1];
        if (matchedGenre.toLowerCase() === "action") matchedGenre = "أكشن";
        if (matchedGenre.toLowerCase() === "adventure") matchedGenre = "مغامرات";
        if (matchedGenre.toLowerCase() === "sports") matchedGenre = "رياضة";
        
        const matchedOptionExists = Array.from(genreSelect.options).some(opt => opt.value === matchedGenre);
        if (matchedOptionExists) {
          genreSelect.value = matchedGenre;
          genreCustom.classList.add("hidden");
        } else {
          genreSelect.value = "custom";
          genreCustom.value = matchedGenre;
          genreCustom.classList.remove("hidden");
        }
      } else {
        genreSelect.value = "أكشن";
        genreCustom.classList.add("hidden");
      }
    }

    // Show current cover preview
    if (game.cover) {
      previewImg.src = game.cover;
      uploadPrompt.classList.add("hidden");
      previewContainer.classList.remove("hidden");
    } else {
      previewContainer.classList.add("hidden");
      uploadPrompt.classList.remove("hidden");
    }

    // Visual updates to form styling
    updateFormLabelsAndPlaceholders();
    cancelEditBtn.classList.remove("hidden");
    
    // Scroll form into view for mobile devices
    gameForm.scrollIntoView({ behavior: "smooth" });
  }

  // Dynamically update form labels and placeholders based on selected type
  function updateFormLabelsAndPlaceholders() {
    const type = gameTypeSelect.value;
    const nameLabelText = document.getElementById("name-label-text");
    const coverLabelText = document.getElementById("cover-label-text");
    const uploadPromptText = document.getElementById("upload-prompt-text");

    const rowHddGenre = document.getElementById("row-hdd-genre");
    const containerTitleId = document.getElementById("container-titleId");
    const containerConsole = document.getElementById("container-console");
    const rowTypeConsole = document.getElementById("row-type-console");
    const containerPath = document.getElementById("container-path");
    const containerTrailer = document.getElementById("container-trailer");
    const containerRating = document.getElementById("container-rating");
    const containerDescription = document.getElementById("container-description");
    const rowRatingDescription = document.getElementById("row-rating-description");
    const sizeLabelText = document.getElementById("size-label-text");
    const sizeInput = document.getElementById("size");
    const sizeIcon = document.getElementById("size-icon");

    const isGame = (type === "modded" || type === "account");

    if (isGame) {
      if (rowHddGenre) rowHddGenre.classList.remove("hidden");
      if (containerTitleId) containerTitleId.classList.remove("hidden");
      if (containerConsole) containerConsole.classList.remove("hidden");
      if (rowTypeConsole) {
        rowTypeConsole.className = "grid grid-cols-2 gap-4";
      }
      if (containerPath) containerPath.classList.remove("hidden");
      if (containerTrailer) containerTrailer.classList.remove("hidden");
      if (containerRating) containerRating.classList.remove("hidden");
      if (containerDescription) {
        containerDescription.className = "col-span-1";
      }
      if (rowRatingDescription) {
        rowRatingDescription.className = "grid grid-cols-2 gap-4";
      }

      if (sizeLabelText) sizeLabelText.textContent = "الحجم";
      if (sizeInput) sizeInput.placeholder = "مثال: 45 GB";
      if (sizeIcon) sizeIcon.innerHTML = `<i class="fa-solid fa-weight-hanging"></i>`;
    } else {
      if (rowHddGenre) rowHddGenre.classList.add("hidden");
      if (containerTitleId) containerTitleId.classList.add("hidden");
      if (containerConsole) containerConsole.classList.add("hidden");
      if (rowTypeConsole) {
        rowTypeConsole.className = "grid grid-cols-1 gap-4";
      }
      if (containerPath) containerPath.classList.add("hidden");
      if (containerTrailer) containerTrailer.classList.add("hidden");
      if (containerRating) containerRating.classList.add("hidden");
      if (containerDescription) {
        containerDescription.className = "col-span-2";
      }
      if (rowRatingDescription) {
        rowRatingDescription.className = "grid grid-cols-1 gap-4";
      }

      if (type === "maintenance") {
        if (sizeLabelText) sizeLabelText.textContent = "تكلفة الخدمة / السعر";
        if (sizeInput) sizeInput.placeholder = "مثال: 150 جنيه / حسب العطل";
        if (sizeIcon) sizeIcon.innerHTML = `<i class="fa-solid fa-file-invoice-dollar text-emerald-400"></i>`;
      } else if (type === "device") {
        if (sizeLabelText) sizeLabelText.textContent = "السعر";
        if (sizeInput) sizeInput.placeholder = "مثال: 5500 جنيه";
        if (sizeIcon) sizeIcon.innerHTML = `<i class="fa-solid fa-dollar-sign text-emerald-400"></i>`;
      } else if (type === "controller") {
        if (sizeLabelText) sizeLabelText.textContent = "سعر المنتج";
        if (sizeInput) sizeInput.placeholder = "مثال: 850 جنيه";
        if (sizeIcon) sizeIcon.innerHTML = `<i class="fa-solid fa-tag text-emerald-400"></i>`;
      }
    }

    let typeWord = "اللعبة";
    let namePlaceholder = "مثال: Resident Evil 4 Remake";
    let coverWord = "الغلاف (Cover)";
    let uploadWord = "صورة الغلاف هنا";

    if (type === "maintenance") {
      typeWord = "خدمة الصيانة";
      namePlaceholder = "مثال: صيانة جهاز PS4 تنظيف وتغيير معجون حراري";
      coverWord = "الصورة التوضيحية";
      uploadWord = "صورة الصيانة هنا";
    } else if (type === "device") {
      typeWord = "جهاز الألعاب";
      namePlaceholder = "مثال: PlayStation 4 Slim 1TB معدل سوفت 9.00";
      coverWord = "الصورة (Cover)";
      uploadWord = "صورة الجهاز هنا";
    } else if (type === "controller") {
      typeWord = "الذراع / الإكسسوار";
      namePlaceholder = "مثال: ذراع تحكم PS4 DualShock 4 أصلي لون مموه";
      coverWord = "صورة المنتج (Cover)";
      uploadWord = "صورة المنتج هنا";
    } else if (type === "account") {
      typeWord = "لعبة الحساب المشترك";
      namePlaceholder = "Resident Evil 4 Remake";
      coverWord = "الغلاف (Cover)";
      uploadWord = "صورة الغلاف هنا";
    }

    if (nameLabelText) nameLabelText.textContent = type === "maintenance" ? "اسم وموضوع الصيانة / الإصلاح" : (type === "device" ? "اسم ومواصفات جهاز الألعاب" : (type === "controller" ? "اسم الذراع أو الإكسسوار" : "اسم اللعبة"));
    if (nameInput) nameInput.placeholder = namePlaceholder;
    if (coverLabelText) coverLabelText.textContent = `صورة ${coverWord}`;
    if (uploadPromptText) uploadPromptText.textContent = `اضغط أو اسحب ${uploadWord}`;

    if (isEditing) {
      formTitle.innerHTML = `
        <i class="fa-solid fa-pen-to-square text-amber-500"></i>
        <span>تعديل ${typeWord}: ${nameInput.value}</span>
      `;
      submitBtn.innerHTML = `
        <i class="fa-solid fa-file-pen"></i>
        <span>تحديث البيانات</span>
      `;
      submitBtn.className = "w-full py-4.5 rounded-xl text-white font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2 text-base transition-all";
    } else {
      formTitle.innerHTML = `
        <i class="fa-solid fa-circle-plus text-ps-blue"></i>
        <span>إضافة ${typeWord} جديدة</span>
      `;
      submitBtn.innerHTML = `
        <i class="fa-solid fa-floppy-disk"></i>
        <span>حفظ ${typeWord}</span>
      `;
      submitBtn.className = "w-full py-4.5 rounded-xl text-white font-bold glow-btn cursor-pointer flex items-center justify-center gap-2 text-base";
    }

    // Dynamic visual update of form tabs
    updateFormTabsUI();
  }

  // Dynamic visual updater for Form category tabs
  function updateFormTabsUI() {
    const activeValue = gameTypeSelect.value || "modded";
    formTabs.forEach(tab => {
      if (tab.el) {
        if (tab.value === activeValue) {
          tab.el.className = "py-2 px-0.5 rounded-lg text-[9px] sm:text-[10px] font-bold transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer bg-ps-blue text-white shadow-md border border-ps-blue/20";
        } else {
          tab.el.className = "py-2 px-0.5 rounded-lg text-[9px] sm:text-[10px] font-bold transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-400 hover:text-white";
        }
      }
    });
  }

  // Bind Form Mode Tabs click listeners
  formTabs.forEach(tab => {
    if (tab.el) {
      tab.el.addEventListener("click", () => {
        gameTypeSelect.value = tab.value;
        // Trigger standard change handler to rebuild placeholders & show/hide fields
        gameTypeSelect.dispatchEvent(new Event("change"));
      });
    }
  });

  // Cancel Edit Mode
  function exitEditMode() {
    isEditing = false;
    gameForm.reset();
    gameIdInput.value = "";
    coverUrlInput.value = "";
    coverFileInput.value = "";
    trailerUrlInput.value = "";
    ratingInput.value = "";
    descriptionInput.value = "";
    gameTypeSelect.value = "modded";
    consoleSelect.value = "PS4";
    
    populateHddCheckboxes([]);
    hddCustom.classList.add("hidden");
    hddCustom.value = "";
    genreCustom.classList.add("hidden");
    genreCustom.value = "";
    
    previewContainer.classList.add("hidden");
    uploadPrompt.classList.remove("hidden");
    
    updateFormLabelsAndPlaceholders();
    cancelEditBtn.classList.add("hidden");
  }

  cancelEditBtn.addEventListener("click", exitEditMode);
  gameTypeSelect.addEventListener("change", updateFormLabelsAndPlaceholders);

  // Form Submit Handler (Create/Update)
  gameForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const id = gameIdInput.value;
    
    // Get checked HDDs
    const selectedHdds = [];
    document.querySelectorAll(".hdd-checkbox:checked").forEach(cb => {
      selectedHdds.push(cb.value);
    });
    
    const customCb = document.getElementById("hdd-checkbox-custom");
    if (customCb && customCb.checked) {
      const customVal = hddCustom.value.trim();
      if (customVal) {
        selectedHdds.push(customVal);
      }
    }

    const hddVal = selectedHdds.join(", ");
    
    const isGame = gameTypeSelect.value === "modded" || gameTypeSelect.value === "account";
    if (isGame && !hddVal) {
      showToast("يرجى اختيار هارد ديسك واحد على الأقل للعبة!", "warning");
      return;
    }

    const genreVal = genreSelect.value === "custom" ? genreCustom.value.trim() : genreSelect.value;

    const gamePayload = {
      name: nameInput.value.trim(),
      titleId: titleIdInput.value.trim().toUpperCase(),
      size: sizeInput.value.trim(),
      path: pathInput.value.trim(),
      cover: coverUrlInput.value,
      hdd: hddVal,
      genre: genreVal,
      gameType: gameTypeSelect.value,
      console: consoleSelect.value,
      trailerUrl: trailerUrlInput.value.trim(),
      rating: ratingInput.value.trim(),
      description: descriptionInput.value.trim()
    };

    const url = isEditing ? `/api/games/${id}` : "/api/games";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gamePayload)
      });

      if (!response.ok) throw new Error("Failed to save game");
      
      let itemTypeWord = "البيانات";
      const typeVal = gameTypeSelect.value;
      if (typeVal === "maintenance") itemTypeWord = "خدمة الصيانة";
      else if (typeVal === "device") itemTypeWord = "جهاز الألعاب";
      else if (typeVal === "controller") itemTypeWord = "المنتج/الإكسسوار";
      else itemTypeWord = "اللعبة";

      showToast(isEditing ? `تم تحديث ${itemTypeWord} بنجاح!` : `تم إضافة ${itemTypeWord} بنجاح!`);
      
      // Auto-delete associated reminder on success
      if (gameForm.dataset.associatedReminderId) {
        const remId = gameForm.dataset.associatedReminderId;
        try {
          await fetch(`/api/reminders/${remId}`, { method: "DELETE" });
          delete gameForm.dataset.associatedReminderId;
          fetchReminders();
        } catch (err) {
          console.error("Failed to auto-delete associated reminder:", err);
        }
      }

      exitEditMode();
      fetchGames();
    } catch (error) {
      console.error(error);
      showToast("فشل في حفظ بيانات اللعبة", "error");
    }
  });

  // Delete Handler
  function confirmAndDeleteGame(id, name) {
    if (!deleteGameModal) return;
    deleteGameIdInput.value = id;
    deleteGameText.textContent = `هل أنت متأكد من حذف لعبة "${name}" نهائياً من المكتبة؟`;
    deleteGameModal.classList.remove("hidden");
    deleteGameModal.classList.add("flex");
  }

  function closeDeleteGameModalFunc() {
    if (!deleteGameModal) return;
    deleteGameModal.classList.remove("flex");
    deleteGameModal.classList.add("hidden");
  }

  async function executeDeleteGame() {
    const id = deleteGameIdInput.value;
    if (!id) return;
    
    try {
      const response = await fetch(`/api/games/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Delete failed");
      
      showToast("تم حذف اللعبة بنجاح!");
      closeDeleteGameModalFunc();
      fetchGames();
      
      // If the game currently being edited is deleted, cancel edit mode
      if (isEditing && gameIdInput.value == id) {
        exitEditMode();
      }
    } catch (error) {
      console.error(error);
      showToast("فشل في حذف اللعبة من المكتبة", "error");
    }
  }

  // Unified filter function (Text Search + HDD Filter + Category Tabs)
  function applyAdminFilters() {
    const term = adminSearch.value.trim().toLowerCase();
    const filtered = allGames.filter(game => {
      // 1. Text Search matching
      const nameMatch = game.name ? game.name.toLowerCase().includes(term) : false;
      const idMatch = game.titleId ? game.titleId.toLowerCase().includes(term) : false;
      const pathMatch = game.path ? game.path.toLowerCase().includes(term) : false;
      const textMatch = nameMatch || idMatch || pathMatch;

      // 2. HDD matching
      let hddMatch = true;
      if (activeHddFilter) {
        hddMatch = game.hdd && game.hdd.split(",").map(h => h.trim()).includes(activeHddFilter);
      }

      // 3. Category matching
      let categoryMatch = true;
      if (activeCategoryFilter !== "all") {
        if (activeCategoryFilter === "games") {
          categoryMatch = (game.gameType === "modded" || game.gameType === "account" || !game.gameType);
        } else {
          categoryMatch = (game.gameType === activeCategoryFilter);
        }
      }

      return textMatch && hddMatch && categoryMatch;
    });

    renderAdminTable(filtered);
    
    // Dynamically highlight or update indicators on HDD cards
    const badges = document.querySelectorAll(".hdd-card-container");
    badges.forEach(badge => {
      const hddName = badge.dataset.hdd;
      if (activeHddFilter === hddName) {
        badge.className = "hdd-card-container bg-slate-900 border-2 border-ps-blue rounded-xl p-3 shadow-md transition duration-200 cursor-pointer flex flex-col justify-between gap-2.5 relative shadow-[0_0_15px_rgba(0,114,206,0.25)] scale-[1.02]";
        const indicator = badge.querySelector(".active-indicator");
        if (indicator) indicator.classList.remove("hidden");
      } else {
        badge.className = "hdd-card-container bg-slate-900 border border-ps-border hover:border-slate-700/60 rounded-xl p-3 shadow-sm hover:shadow transition duration-200 cursor-pointer flex flex-col justify-between gap-2.5 relative";
        const indicator = badge.querySelector(".active-indicator");
        if (indicator) indicator.classList.add("hidden");
      }
    });
  }

  // Admin Search feature (filters the table rows dynamically)
  adminSearch.addEventListener("input", applyAdminFilters);

  // Admin Category Tabs Switcher Event Listeners
  const adminTabAll = document.getElementById("admin-tab-all");
  const adminTabGames = document.getElementById("admin-tab-games");
  const adminTabMaintenance = document.getElementById("admin-tab-maintenance");
  const adminTabDevice = document.getElementById("admin-tab-device");
  const adminTabController = document.getElementById("admin-tab-controller");

  const adminTabs = [
    { el: adminTabAll, category: "all" },
    { el: adminTabGames, category: "games" },
    { el: adminTabMaintenance, category: "maintenance" },
    { el: adminTabDevice, category: "device" },
    { el: adminTabController, category: "controller" }
  ];

  adminTabs.forEach(tab => {
    if (tab.el) {
      tab.el.addEventListener("click", () => {
        activeCategoryFilter = tab.category;
        
        // Update tabs styling
        adminTabs.forEach(t => {
          if (t.el) {
            if (t.category === activeCategoryFilter) {
              t.el.className = "flex-1 min-w-[80px] py-2 px-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer bg-ps-blue text-white shadow-md";
            } else {
              t.el.className = "flex-1 min-w-[100px] py-2 px-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer text-slate-400 hover:text-white";
            }
          }
        });

        // Trigger filters
        applyAdminFilters();
      });
    }
  });

  // Google Search Event Listener
  if (googleSearchBtn) {
    googleSearchBtn.addEventListener("click", (e) => {
      const query = nameInput.value.trim();
      if (!query) {
        e.preventDefault();
        showToast("يرجى إدخال اسم اللعبة أولاً للبحث في جوجل", "warning");
        return;
      }
      googleSearchBtn.href = `https://www.google.com/search?q=ps4+${encodeURIComponent(query)}`;
    });
  }

  // --- Reminders System Functions ---

  // Show/Hide Add Reminder section
  if (showAddReminderBtn) {
    showAddReminderBtn.addEventListener("click", () => {
      if (addReminderSection.classList.contains("hidden")) {
        addReminderSection.classList.remove("hidden");
        populateRemHddDropdown();
        remNameInput.focus();
      } else {
        addReminderSection.classList.add("hidden");
      }
    });
  }

  if (cancelReminderBtn) {
    cancelReminderBtn.addEventListener("click", () => {
      addReminderSection.classList.add("hidden");
      resetReminderForm();
    });
  }

  function resetReminderForm() {
    remNameInput.value = "";
    remTypeSelect.value = "game";
    remTitleIdInput.value = "";
    remHddSelect.value = "";
    remPathInput.value = "";
    remNotesInput.value = "";
  }

  function populateRemHddDropdown() {
    if (!remHddSelect) return;
    const currentVal = remHddSelect.value;
    remHddSelect.innerHTML = '<option value="">بدون تحديد (No HDD Selected)</option>';
    loadedHdds.forEach(hdd => {
      const opt = document.createElement("option");
      opt.value = hdd;
      opt.textContent = hdd;
      remHddSelect.appendChild(opt);
    });
    if (currentVal && loadedHdds.includes(currentVal)) {
      remHddSelect.value = currentVal;
    }
  }

  // Save Reminder Handler
  if (saveReminderBtn) {
    saveReminderBtn.addEventListener("click", async () => {
      const name = remNameInput.value.trim();
      if (!name) {
        showToast("يرجى إدخال اسم اللعبة أو التحديث للتذكير!", "warning");
        return;
      }

      const payload = {
        name,
        type: remTypeSelect.value,
        titleId: remTitleIdInput.value.trim().toUpperCase(),
        hdd: remHddSelect.value,
        path: remPathInput.value.trim(),
        notes: remNotesInput.value.trim(),
        status: "pending"
      };

      try {
        const response = await fetch("/api/reminders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Failed to save reminder");

        showToast("تم إضافة التذكير بنجاح!");
        resetReminderForm();
        addReminderSection.classList.add("hidden");
        fetchReminders();
      } catch (error) {
        console.error(error);
        showToast("فشل في إضافة التذكير", "error");
      }
    });
  }

  // Fetch Reminders
  async function fetchReminders() {
    try {
      const response = await fetch("/api/reminders");
      if (!response.ok) throw new Error("Failed to load reminders");
      loadedReminders = await response.json();
      renderReminders();
    } catch (error) {
      console.error(error);
    }
  }

  // Prepare game form with details from reminder
  function prepareFormFromReminder(reminder) {
    if (isEditing) {
      exitEditMode();
    }
    
    // Fill basic fields
    nameInput.value = reminder.name;
    titleIdInput.value = reminder.titleId || "";
    
    // Select HDD
    if (reminder.hdd) {
      populateHddCheckboxes([reminder.hdd]);
    } else {
      populateHddCheckboxes([]);
    }
    
    // Set custom/specific path
    if (reminder.path) {
      const parts = reminder.path.split(">").map(p => p.trim());
      const possibleGenre = parts[parts.length - 1];
      const standardGenres = ["أكشن", "مغامرات", "رياضة", "رعب", "سباق", "شوتر", "عائلي"];
      if (standardGenres.includes(possibleGenre)) {
        genreSelect.value = possibleGenre;
        genreCustom.classList.add("hidden");
        genreCustom.value = "";
      } else if (possibleGenre) {
        genreSelect.value = "custom";
        genreCustom.value = possibleGenre;
        genreCustom.classList.remove("hidden");
      }
    }
    
    // If it's an update, let's pre-populate notes in description
    if (reminder.type === "update") {
      gameTypeSelect.value = "modded";
      consoleSelect.value = "PS4";
      descriptionInput.value = reminder.notes ? `تحديث: ${reminder.notes}` : "تحديث للعبة";
    } else {
      if (reminder.notes) {
        descriptionInput.value = reminder.notes;
      }
    }
    
    // Compute/Update path dynamically
    updatePathFromSelections();
    
    // Scroll the form into view smoothly
    gameForm.scrollIntoView({ behavior: "smooth" });
    
    // Automatically open google search in a new tab to find game info easily!
    if (reminder.name) {
      const searchUrl = `https://www.google.com/search?q=ps4+${encodeURIComponent(reminder.name)}`;
      window.open(searchUrl, "_blank");
    }
    
    // Set associated reminder ID for auto-deletion on save success
    gameForm.dataset.associatedReminderId = reminder.id;
    
    showToast("تم تحضير نموذج اللعبة! وتم فتح بحث جوجل في نافذة جديدة لمساعدتك في العثور على التفاصيل والغلاف.");
  }

  // Render Reminders
  function renderReminders() {
    if (!remindersListContainer) return;
    
    if (loadedReminders.length === 0) {
      remindersListContainer.innerHTML = `
        <div class="text-center py-8 text-slate-500 text-xs">
          <i class="fa-solid fa-bell-slash text-2xl mb-1 text-slate-600 block"></i>
          لا توجد تذكيرات حالياً. اضغط "إضافة تذكير" للبدء!
        </div>
      `;
      return;
    }

    remindersListContainer.innerHTML = "";
    
    const sorted = [...loadedReminders].sort((a, b) => {
      if (a.status === "pending" && b.status === "completed") return -1;
      if (a.status === "completed" && b.status === "pending") return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    sorted.forEach(rem => {
      const div = document.createElement("div");
      
      const isPending = rem.status === "pending";
      const badgeColor = rem.type === "update" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-ps-blue/10 text-ps-blue border-ps-blue/20";
      const badgeText = rem.type === "update" ? "تحديث / إضافة" : "لعبة كاملة";
      
      div.className = `p-4 rounded-xl border transition-all duration-200 ${
        isPending 
          ? "bg-slate-900/50 border-ps-border hover:border-slate-700" 
          : "bg-slate-950/20 border-ps-border/40 opacity-60"
      }`;

      div.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div class="space-y-1.5 flex-1">
            <div class="flex items-center flex-wrap gap-2">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}">${badgeText}</span>
              <h4 class="text-sm font-bold text-white leading-snug">${rem.name}</h4>
              ${rem.titleId ? `<span class="text-[10px] font-mono font-semibold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">${rem.titleId}</span>` : ""}
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
              ${rem.hdd ? `
                <div class="flex items-center gap-1.5">
                  <i class="fa-solid fa-hard-drive text-[10px] text-slate-500"></i>
                  <span>الهارد: <strong class="text-slate-300 font-semibold">${rem.hdd}</strong></span>
                </div>
              ` : ""}
              ${rem.path ? `
                <div class="flex items-center gap-1.5">
                  <i class="fa-solid fa-folder text-[10px] text-slate-500"></i>
                  <span>المسار المستهدف: <strong class="text-slate-300 font-semibold">${rem.path}</strong></span>
                </div>
              ` : ""}
              ${rem.notes ? `
                <div class="col-span-1 sm:col-span-2 flex items-start gap-1.5 mt-0.5 bg-slate-950/40 p-2 rounded-lg border border-slate-900/60">
                  <i class="fa-solid fa-info text-[10px] text-amber-500 mt-0.5"></i>
                  <span class="leading-relaxed text-[11px] text-slate-300">${rem.notes}</span>
                </div>
              ` : ""}
            </div>
          </div>
          
          <div class="flex items-center sm:self-center gap-2 self-end sm:self-auto shrink-0">
            ${isPending ? `
              <button type="button" class="add-to-lib-btn bg-ps-blue hover:bg-ps-blueLight text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer" title="تنزيل اللعبة وإضافتها للمكتبة مباشرة!">
                <i class="fa-solid fa-cloud-arrow-down"></i>
                <span>إضافة للمكتبة</span>
              </button>
            ` : ""}
            
            <button type="button" class="toggle-status-btn bg-slate-800 hover:bg-slate-700 text-slate-300 w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer" title="${isPending ? "تحديد كمكتمل" : "تحديد كقيد الانتظار"}">
              <i class="fa-solid ${isPending ? "fa-circle-check hover:text-emerald-500" : "fa-circle-xmark text-emerald-500 hover:text-amber-500"}"></i>
            </button>
            
            <button type="button" class="delete-rem-btn bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white w-8 h-8 rounded-lg flex items-center justify-center border border-rose-500/20 hover:border-transparent transition cursor-pointer" title="حذف التذكير">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `;

      // Event listeners
      const addBtn = div.querySelector(".add-to-lib-btn");
      if (addBtn) {
        addBtn.addEventListener("click", () => {
          prepareFormFromReminder(rem);
        });
      }

      const toggleBtn = div.querySelector(".toggle-status-btn");
      if (toggleBtn) {
        toggleBtn.addEventListener("click", async () => {
          const newStatus = rem.status === "pending" ? "completed" : "pending";
          try {
            const response = await fetch(`/api/reminders/${rem.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: newStatus })
            });
            if (!response.ok) throw new Error("Failed to update status");
            showToast(newStatus === "completed" ? "تم تحديد التنزيل كمكتمل!" : "تم إعادة التنزيل إلى قيد الانتظار");
            fetchReminders();
          } catch (err) {
            console.error(err);
            showToast("فشل في تحديث حالة التذكير", "error");
          }
        });
      }

      const delBtn = div.querySelector(".delete-rem-btn");
      if (delBtn) {
        delBtn.addEventListener("click", async () => {
          if (confirm(`هل أنت متأكد من حذف تذكير "${rem.name}"؟`)) {
            try {
              const response = await fetch(`/api/reminders/${rem.id}`, {
                method: "DELETE"
              });
              if (!response.ok) throw new Error("Failed to delete");
              showToast("تم حذف التذكير بنجاح");
              fetchReminders();
            } catch (err) {
              console.error(err);
              showToast("فشل في حذف التذكير", "error");
            }
          }
        });
      }

      remindersListContainer.appendChild(div);
    });
  }

  // Startup
  if (window.location.hostname.includes("github.io") || window.location.protocol === "file:") {
    const banner = document.createElement("div");
    banner.className = "bg-amber-500/20 border-b border-amber-500/40 text-amber-300 px-4 py-2.5 text-center text-xs font-bold";
    banner.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1.5 ml-1.5"></i> وضع العرض فقط (GitHub Pages): لوحة التحكم هنا للعرض فقط لأن الموقع ثابت (Static). لإضافة ألعاب جديدة أو تعديل الصور والبيانات، شغّل المشروع على جهازك عبر السيرفر المحلي ثم ارفع ملف games.json ومجلد uploads إلى GitHub.`;
    document.body.prepend(banner);
  }
  fetchHdds();
  fetchGames();
  fetchReminders();
});
