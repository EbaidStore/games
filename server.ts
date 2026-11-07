import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

// Gemini client lazy initializer
let aiInstance: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiInstance;
}

app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure games.json exists
const gamesFilePath = path.join(process.cwd(), "games.json");
if (!fs.existsSync(gamesFilePath)) {
  fs.writeFileSync(gamesFilePath, JSON.stringify([], null, 2), "utf8");
}

// Ensure hdds.json exists
const hddsFilePath = path.join(process.cwd(), "hdds.json");
if (!fs.existsSync(hddsFilePath)) {
  fs.writeFileSync(hddsFilePath, JSON.stringify(["HDD 1", "HDD 2", "SSD"], null, 2), "utf8");
}

// Ensure reminders.json exists
const remindersFilePath = path.join(process.cwd(), "reminders.json");
if (!fs.existsSync(remindersFilePath)) {
  fs.writeFileSync(remindersFilePath, JSON.stringify([], null, 2), "utf8");
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "cover-" + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// Serve uploads directory
app.use("/uploads", express.static(uploadsDir));

// API: Get all games
app.get("/api/games", (req, res) => {
  try {
    const data = fs.readFileSync(gamesFilePath, "utf8");
    const games = JSON.parse(data);
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: "Failed to read games data" });
  }
});

// API: Get all HDDs
app.get("/api/hdds", (req, res) => {
  try {
    const data = fs.readFileSync(hddsFilePath, "utf8");
    const hdds = JSON.parse(data);
    res.json(hdds);
  } catch (error) {
    res.status(500).json({ error: "Failed to read HDDs data" });
  }
});

// API: Add a HDD
app.post("/api/hdds", (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "اسم الهارد مطلوب" });
    }
    const cleanName = name.trim();
    const data = fs.readFileSync(hddsFilePath, "utf8");
    const hdds = JSON.parse(data);
    if (hdds.map((h: string) => h.toLowerCase()).includes(cleanName.toLowerCase())) {
      return res.status(400).json({ error: "اسم الهارد هذا موجود بالفعل" });
    }
    hdds.push(cleanName);
    fs.writeFileSync(hddsFilePath, JSON.stringify(hdds, null, 2), "utf8");
    res.status(201).json(hdds);
  } catch (error) {
    res.status(500).json({ error: "Failed to save hard drive" });
  }
});

// API: Delete a HDD
app.delete("/api/hdds", (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "اسم الهارد مطلوب لحذفه" });
    }
    const cleanName = name.trim();
    const data = fs.readFileSync(hddsFilePath, "utf8");
    let hdds = JSON.parse(data);
    
    if (!hdds.map((h: string) => h.toLowerCase()).includes(cleanName.toLowerCase())) {
      return res.status(404).json({ error: "اسم الهارد غير موجود" });
    }
    
    hdds = hdds.filter((h: string) => h.toLowerCase() !== cleanName.toLowerCase());
    fs.writeFileSync(hddsFilePath, JSON.stringify(hdds, null, 2), "utf8");
    res.json(hdds);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete hard drive" });
  }
});

// API: Rename a HDD
app.put("/api/hdds", (req, res) => {
  try {
    const { oldName, newName } = req.body;
    if (!oldName || !oldName.trim() || !newName || !newName.trim()) {
      return res.status(400).json({ error: "الاسم القديم والجديد مطلوبان" });
    }
    const cleanOldName = oldName.trim();
    const cleanNewName = newName.trim();

    const data = fs.readFileSync(hddsFilePath, "utf8");
    let hdds = JSON.parse(data);
    
    const oldIndex = hdds.findIndex((h: string) => h.toLowerCase() === cleanOldName.toLowerCase());
    if (oldIndex === -1) {
      return res.status(404).json({ error: "اسم الهارد القديم غير موجود" });
    }
    
    if (cleanOldName.toLowerCase() !== cleanNewName.toLowerCase() && hdds.map((h: string) => h.toLowerCase()).includes(cleanNewName.toLowerCase())) {
      return res.status(400).json({ error: "اسم الهارد الجديد موجود بالفعل" });
    }
    
    hdds[oldIndex] = cleanNewName;
    fs.writeFileSync(hddsFilePath, JSON.stringify(hdds, null, 2), "utf8");
    
    // Also update all games associated with this HDD
    try {
      const gamesData = fs.readFileSync(gamesFilePath, "utf8");
      const games = JSON.parse(gamesData);
      let updatedAny = false;
      
      const updatedGames = games.map((game: any) => {
        if (!game.hdd) return game;
        
        if (typeof game.hdd === "string") {
          const drives = game.hdd.split(",").map((h: string) => h.trim());
          const driveIndex = drives.findIndex((h: string) => h.toLowerCase() === cleanOldName.toLowerCase());
          if (driveIndex !== -1) {
            drives[driveIndex] = cleanNewName;
            game.hdd = drives.join(", ");
            updatedAny = true;
          }
        } else if (Array.isArray(game.hdd)) {
          const driveIndex = game.hdd.findIndex((h: string) => h.toLowerCase() === cleanOldName.toLowerCase());
          if (driveIndex !== -1) {
            game.hdd[driveIndex] = cleanNewName;
            updatedAny = true;
          }
        } else if (String(game.hdd).toLowerCase() === cleanOldName.toLowerCase()) {
          game.hdd = cleanNewName;
          updatedAny = true;
        }
        
        // Also update path if it starts with the old hdd name
        if (game.path) {
          const parts = game.path.split(">").map((p: string) => p.trim());
          if (parts[0] && parts[0].toLowerCase() === cleanOldName.toLowerCase()) {
            parts[0] = cleanNewName;
            game.path = parts.join(" > ");
            updatedAny = true;
          }
        }
        
        return game;
      });
      
      if (updatedAny) {
        fs.writeFileSync(gamesFilePath, JSON.stringify(updatedGames, null, 2), "utf8");
      }
    } catch (err) {
      console.error("Failed to update games for renamed HDD:", err);
    }
    
    res.json(hdds);
  } catch (error) {
    res.status(500).json({ error: "Failed to rename hard drive" });
  }
});

// API: Get all reminders
app.get("/api/reminders", (req, res) => {
  try {
    const data = fs.readFileSync(remindersFilePath, "utf8");
    const reminders = JSON.parse(data);
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: "Failed to read reminders data" });
  }
});

// API: Add a reminder
app.post("/api/reminders", (req, res) => {
  try {
    const { name, type, titleId, notes, hdd, path: targetPath, status } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "اسم اللعبة أو التذكير مطلوب" });
    }
    
    const data = fs.readFileSync(remindersFilePath, "utf8");
    const reminders = JSON.parse(data);
    
    const newId = reminders.length > 0 ? Math.max(...reminders.map((r: any) => r.id)) + 1 : 1;
    const newReminder = {
      id: newId,
      name: name.trim(),
      type: type || "game",
      titleId: titleId || "",
      notes: notes || "",
      hdd: hdd || "",
      path: targetPath || "",
      status: status || "pending",
      createdAt: new Date().toISOString()
    };
    
    reminders.push(newReminder);
    fs.writeFileSync(remindersFilePath, JSON.stringify(reminders, null, 2), "utf8");
    res.status(201).json(newReminder);
  } catch (error) {
    res.status(500).json({ error: "Failed to save reminder" });
  }
});

// API: Update a reminder
app.put("/api/reminders/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, type, titleId, notes, hdd, path: targetPath, status } = req.body;
    
    const data = fs.readFileSync(remindersFilePath, "utf8");
    const reminders = JSON.parse(data);
    const index = reminders.findIndex((r: any) => r.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: "Reminder not found" });
    }
    
    reminders[index] = {
      ...reminders[index],
      name: name !== undefined ? name.trim() : reminders[index].name,
      type: type !== undefined ? type : reminders[index].type,
      titleId: titleId !== undefined ? titleId : reminders[index].titleId,
      notes: notes !== undefined ? notes : reminders[index].notes,
      hdd: hdd !== undefined ? hdd : reminders[index].hdd,
      path: targetPath !== undefined ? targetPath : reminders[index].path,
      status: status !== undefined ? status : reminders[index].status
    };
    
    fs.writeFileSync(remindersFilePath, JSON.stringify(reminders, null, 2), "utf8");
    res.json(reminders[index]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update reminder" });
  }
});

// API: Delete a reminder
app.delete("/api/reminders/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = fs.readFileSync(remindersFilePath, "utf8");
    let reminders = JSON.parse(data);
    
    const exists = reminders.some((r: any) => r.id === id);
    if (!exists) {
      return res.status(404).json({ error: "Reminder not found" });
    }
    
    reminders = reminders.filter((r: any) => r.id !== id);
    fs.writeFileSync(remindersFilePath, JSON.stringify(reminders, null, 2), "utf8");
    res.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete reminder" });
  }
});

// API: Add a game
app.post("/api/games", (req, res) => {
  try {
    const { name, titleId, path: gamePath, size, cover, hdd, genre, trailerUrl, rating, description, gameType, console: gameConsole } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Game name is required" });
    }
    const data = fs.readFileSync(gamesFilePath, "utf8");
    const games = JSON.parse(data);
    
    const newId = games.length > 0 ? Math.max(...games.map((g: any) => g.id)) + 1 : 1;
    const newGame = {
      id: newId,
      name,
      titleId: titleId || "",
      path: gamePath || "",
      size: size || "",
      cover: cover || "",
      hdd: hdd || "",
      genre: genre || "",
      trailerUrl: trailerUrl || "",
      rating: rating || "",
      description: description || "",
      gameType: gameType || "modded",
      console: gameConsole || "PS4"
    };
    
    games.push(newGame);
    fs.writeFileSync(gamesFilePath, JSON.stringify(games, null, 2), "utf8");
    res.status(201).json(newGame);
  } catch (error) {
    res.status(500).json({ error: "Failed to save game" });
  }
});

// API: Update a game
app.put("/api/games/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, titleId, path: gamePath, size, cover, hdd, genre, trailerUrl, rating, description, gameType, console: gameConsole } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Game name is required" });
    }
    
    const data = fs.readFileSync(gamesFilePath, "utf8");
    const games = JSON.parse(data);
    const gameIndex = games.findIndex((g: any) => g.id === id);
    
    if (gameIndex === -1) {
      return res.status(404).json({ error: "Game not found" });
    }
    
    const updatedGame = {
      ...games[gameIndex],
      name,
      titleId: titleId || "",
      path: gamePath || "",
      size: size || "",
      cover: cover !== undefined ? cover : games[gameIndex].cover,
      hdd: hdd !== undefined ? hdd : games[gameIndex].hdd,
      genre: genre !== undefined ? genre : games[gameIndex].genre,
      trailerUrl: trailerUrl !== undefined ? trailerUrl : games[gameIndex].trailerUrl,
      rating: rating !== undefined ? rating : games[gameIndex].rating,
      description: description !== undefined ? description : games[gameIndex].description,
      gameType: gameType !== undefined ? gameType : (games[gameIndex].gameType || "modded"),
      console: gameConsole !== undefined ? gameConsole : (games[gameIndex].console || "PS4")
    };
    
    games[gameIndex] = updatedGame;
    fs.writeFileSync(gamesFilePath, JSON.stringify(games, null, 2), "utf8");
    res.json(updatedGame);
  } catch (error) {
    res.status(500).json({ error: "Failed to update game" });
  }
});

// API: Delete a game
app.delete("/api/games/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = fs.readFileSync(gamesFilePath, "utf8");
    let games = JSON.parse(data);
    
    const gameExists = games.some((g: any) => g.id === id);
    if (!gameExists) {
      return res.status(404).json({ error: "Game not found" });
    }
    
    games = games.filter((g: any) => g.id !== id);
    fs.writeFileSync(gamesFilePath, JSON.stringify(games, null, 2), "utf8");
    res.json({ message: "Game deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete game" });
  }
});

// API: Smart AI Game Lookup using Gemini
app.post("/api/ai/game-lookup", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: "الرجاء إدخال اسم اللعبة أو كود Title ID للبحث." });
    }

    const ai = getGemini();

    const prompt = `You are an expert PlayStation 4 database.
Search and look up detailed game information for the PS4 game: "${query.trim()}".
You MUST return a valid JSON object matching the requested schema. If the exact game is unknown, provide information for the closest matching popular PS4 game.

Fields must be populated as follows:
1. "name": The Arabic title of the game followed by the English title in parenthesis. E.g. "إله الحرب (God of War)" or "فيفا 23 (FIFA 23)" or "سبايدر مان (Marvel's Spider-Man)".
2. "titleId": The exact PlayStation 4 Title ID (e.g., "CUSA07408", "CUSA03041", etc.). Must be formatted as uppercase "CUSA" followed by digits, with no hyphens or spaces. If you don't know it, provide the standard real one.
3. "size": Standard PS4 installation size. E.g., "45 GB", "105 GB", "40 GB".
4. "genre": Categorize the game using EXACTLY one of these values in Arabic: "أكشن", "مغامرات", "رياضة", "رعب", "سباق", "شوتر", "عائلي", "قتال", "RPG".
5. "cover": A high-quality, loadable, public direct vertical cover art image URL for the game. You should use a reliable public image URL (e.g. from PlayStation CDN, Steam Header/Cover static URLs, RAWG, or standard direct IGDB cover image CDN links like "https://images.igdb.com/igdb/image/upload/t_cover_big/..."). Make sure the image URL is direct and valid.
6. "trailerUrl": A valid, real YouTube video URL of the official game trailer, e.g., "https://www.youtube.com/watch?v=..." or "https://youtu.be/...".
7. "rating": A high-quality critics/users evaluation string, e.g. "9.5/10" or "4.8/5" or "90%".
8. "description": A beautiful, compelling 1 to 2 sentence summary of the game's story, setting or gameplay in Arabic.

Return ONLY the JSON object. Do not wrap it in markdown codeblocks.`;

    // Robust retry and fallback logic to handle transient errors like 503 Service Unavailable
    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
    let response = null;
    let lastError: any = null;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        titleId: { type: Type.STRING },
        size: { type: Type.STRING },
        genre: { type: Type.STRING },
        cover: { type: Type.STRING },
        trailerUrl: { type: Type.STRING },
        rating: { type: Type.STRING },
        description: { type: Type.STRING }
      },
      required: ["name", "titleId", "size", "genre", "cover", "trailerUrl", "rating", "description"]
    };

    for (const modelName of modelsToTry) {
      let attempts = 3;
      let delay = 1000;

      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          console.log(`Attempting AI lookup with model: ${modelName} (attempt ${attempt}/${attempts})`);
          response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: responseSchema,
            }
          });
          break; // Succeeded! Break out of attempts
        } catch (error: any) {
          lastError = error;
          console.error(`Error on model ${modelName}, attempt ${attempt}:`, error.message || error);

          // Check if error is transient (e.g., 503, 500, or rate limits)
          const isTransient = 
            error.status === 503 || 
            error.status === 500 || 
            error.status === 429 ||
            (error.message && (
              error.message.includes("503") || 
              error.message.includes("500") || 
              error.message.includes("429") || 
              error.message.includes("high demand") || 
              error.message.includes("UNAVAILABLE") ||
              error.message.includes("rate limit")
            ));

          if (isTransient && attempt < attempts) {
            console.log(`Waiting ${delay}ms before retrying...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2; // exponential backoff
          } else {
            break; // Break out of attempts to try the fallback model
          }
        }
      }

      if (response) {
        break; // Succeeded! Break out of models loop
      }
    }

    if (!response) {
      throw lastError || new Error("Failed to generate content with all attempted models.");
    }

    const text = response.text;
    if (!text) {
      return res.status(500).json({ error: "لم يتمكن الذكاء الاصطناعي من استرجاع البيانات." });
    }

    const parsedData = JSON.parse(text.trim());
    res.json(parsedData);
  } catch (error: any) {
    console.error("AI Lookup Error:", error);
    let errorMsg = "حدث خطأ أثناء البحث الذكي.";
    if (error.message && (error.message.includes("GEMINI_API_KEY") || error.message.includes("api_key") || error.message.includes("apiKey"))) {
      errorMsg = "مفتاح Gemini API غير متوفر أو غير صالح. يرجى إضافته من قائمة Settings > Secrets.";
    }
    res.status(500).json({ error: errorMsg, details: error.message });
  }
});

// API: Upload image
app.post("/upload", upload.single("cover"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ cover: imageUrl });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Serve frontend static files
const staticPath = process.env.NODE_ENV === "production" 
  ? path.join(process.cwd(), "dist") 
  : (fs.existsSync(path.join(process.cwd(), "public", "index.html"))
      ? path.join(process.cwd(), "public")
      : process.cwd());

app.use(express.static(staticPath));
app.use(express.static(process.cwd()));

// Specific HTML page routing
app.get("/admin", (req, res) => {
  const adminFile = path.join(staticPath, "admin.html");
  if (fs.existsSync(adminFile)) {
    return res.sendFile(adminFile);
  }
  res.sendFile(path.join(process.cwd(), "admin.html"));
});

app.get("/", (req, res) => {
  const indexFile = path.join(staticPath, "index.html");
  if (fs.existsSync(indexFile)) {
    return res.sendFile(indexFile);
  }
  res.sendFile(path.join(process.cwd(), "index.html"));
});

// Fallback to index.html
app.get("*", (req, res) => {
  const indexFile = path.join(staticPath, "index.html");
  if (fs.existsSync(indexFile)) {
    return res.sendFile(indexFile);
  }
  res.sendFile(path.join(process.cwd(), "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
