// Configuración de la API
const API_KEY = "1894262f72f44857a06ea4350d651480";
const API_BASE_URL = "https://api.rawg.io/api";

// Variables globales
let yourGame = null;
let theirGame = null;
let recommendedGames = [];
let usedGameIds = new Set(); // Para evitar recomendaciones repetitivas
let previousGenres = []; // Para rastrear géneros de recomendaciones anteriores

// Elementos DOM
document.addEventListener("DOMContentLoaded", () => {
  // Botones principales
  const randomComboBtn = document.getElementById("random-combo");

  // Contenedores
  const searchContainer = document.getElementById("search-container");
  const recommendationsContainer = document.getElementById(
    "recommendations-container"
  );
  const gameDetails = document.getElementById("game-details");

  // Elementos de búsqueda
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  // Elementos de recomendación
  const recommendationsGrid = document.getElementById("recommendations-grid");

  // Elementos de detalle
  const backToRecommendationsBtn = document.getElementById(
    "back-to-recommendations"
  );
  const startOverBtn = document.getElementById("start-over");

  // Posters de juegos seleccionados
  const yourGamePoster = document.getElementById("your-game-poster");
  const theirGamePoster = document.getElementById("their-game-poster");

  // Event Listeners para los cuadrados de selección
  yourGamePoster.addEventListener("click", () => showSearch("your"));
  theirGamePoster.addEventListener("click", () => {
    if (yourGame) {
      showSearch("their");
    } else {
      showNotification("¡Primero selecciona tu juego!", "error");
    }
  });

  randomComboBtn.addEventListener("click", getRandomCombo);

  searchInput.addEventListener("input", debounce(handleSearch, 300));

  backToRecommendationsBtn.addEventListener("click", () => {
    gameDetails.style.display = "none";
    recommendationsGrid.style.display = "grid";
  });

  startOverBtn.addEventListener("click", resetSelections);

  // Crear logo animado
  createLogo();

  // Añadir elementos animados al fondo
  createGameElements();

  // Asegurar que el fondo animado esté presente
  createAnimatedBackground();

  // Mostrar notificación de bienvenida
  setTimeout(() => {
    showNotification(
      "¡Bienvenido a Game Night! Selecciona dos juegos para obtener recomendaciones personalizadas.",
      "info"
    );
  }, 1000);
});

// Función para crear el fondo animado
function createAnimatedBackground() {
  // Verificar si ya existe el elemento de fondo
  let gameBackground = document.getElementById("game-background");
  if (!gameBackground) {
    gameBackground = document.createElement("div");
    gameBackground.id = "game-background";
    document.body.appendChild(gameBackground);
  }

  // Verificar si existe el contenedor de animación de fondo
  let backgroundAnimation = document.querySelector(".background-animation");
  if (!backgroundAnimation) {
    backgroundAnimation = document.createElement("div");
    backgroundAnimation.className = "background-animation";
    document.body.appendChild(backgroundAnimation);
  }
}

// Función para crear el logo
function createLogo() {
  const logoImg = document.getElementById("logo");
  if (!logoImg.src || logoImg.src.includes("logo.png")) {
    // Crear un canvas para el logo
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 200;
    canvas.height = 80;

    // Fondo del logo
    ctx.fillStyle = "#4a1942";
    ctx.beginPath();
    ctx.roundRect(0, 0, 200, 80, 10);
    ctx.fill();

    // Borde del logo
    ctx.strokeStyle = "#e91e63";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(0, 0, 200, 80, 10);
    ctx.stroke();

    // Dibujar un controlador estilizado
    ctx.fillStyle = "#e91e63";
    ctx.beginPath();
    ctx.arc(40, 40, 20, 0, Math.PI * 2);
    ctx.fill();

    // Dibujar botones del controlador
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(160, 30, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(180, 40, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(160, 50, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(140, 40, 8, 0, Math.PI * 2);
    ctx.fill();

    // Texto "GAME NIGHT"
    ctx.font = "bold 24px Orbitron";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("GAME", 100, 35);
    ctx.fillText("NIGHT", 100, 60);

    // Convertir a imagen
    const dataURL = canvas.toDataURL("image/png");
    logoImg.src = dataURL;
  }
}

// Función para crear elementos de videojuegos animados en el fondo
function createGameElements() {
  // Verificar si existe el contenedor de animación de fondo
  let backgroundAnimation = document.querySelector(".background-animation");
  if (!backgroundAnimation) {
    backgroundAnimation = document.createElement("div");
    backgroundAnimation.className = "background-animation";
    document.body.appendChild(backgroundAnimation);
  }

  // Limpiar elementos existentes para evitar duplicados
  backgroundAnimation.innerHTML = "";

  // Crear elementos de videojuegos flotantes
  const gameIcons = [
    "controller",
    "joystick",
    "console",
    "arcade",
    "pixel-heart",
    "pixel-star",
    "pixel-coin",
    "pixel-ghost",
    "pixel-mushroom",
  ];

  // Crear 30 elementos aleatorios para un fondo más dinámico
  for (let i = 0; i < 30; i++) {
    const element = document.createElement("div");
    element.className = "game-element";

    // Seleccionar un icono aleatorio
    const iconType = gameIcons[Math.floor(Math.random() * gameIcons.length)];
    element.classList.add(iconType);

    // Posición aleatoria
    element.style.left = `${Math.random() * 100}%`;

    // Tamaño aleatorio
    const size = 20 + Math.random() * 40;
    element.style.width = `${size}px`;
    element.style.height = `${size}px`;

    // Animación aleatoria
    const duration = 15 + Math.random() * 30;
    element.style.animation = `float ${duration}s infinite linear`;
    element.style.animationDelay = `-${Math.random() * duration}s`;

    // Añadir al fondo
    backgroundAnimation.appendChild(element);
  }
}

// Función para mostrar la búsqueda
function showSearch(type) {
  const searchContainer = document.getElementById("search-container");
  const searchInput = document.getElementById("search-input");

  searchContainer.style.display = "block";
  searchInput.focus();
  searchInput.dataset.type = type;

  // Limpiar resultados anteriores
  document.getElementById("search-results").innerHTML = "";

  // Mostrar mensaje de instrucción
  const searchResults = document.getElementById("search-results");
  searchResults.innerHTML =
    '<li class="search-instruction">Escribe el nombre de un videojuego para buscar...</li>';

  // Mostrar notificación
  showNotification(
    `Buscando ${
      type === "your" ? "tu" : "su"
    } juego. Escribe al menos 3 caracteres.`,
    "info"
  );
}

// Función para mostrar notificación
function showNotification(message, type = "success") {
  // Verificar si ya existe una notificación
  let notification = document.querySelector(".game-notification");

  if (!notification) {
    notification = document.createElement("div");
    notification.className = "game-notification";
    document.body.appendChild(notification);
  }

  // Añadir clase de tipo
  notification.className = "game-notification";
  if (type === "error") {
    notification.classList.add("error");
  } else if (type === "info") {
    notification.classList.add("info");
  } else {
    notification.classList.add("success");
  }

  // Actualizar mensaje y mostrar
  notification.textContent = message;
  notification.classList.add("show");

  // Ocultar después de 3 segundos
  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// Función para manejar la búsqueda
async function handleSearch() {
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  const query = searchInput.value.trim();

  if (query.length < 3) {
    searchResults.innerHTML =
      '<li class="search-instruction">Escribe al menos 3 caracteres para buscar...</li>';
    return;
  }

  // Mostrar indicador de carga
  searchResults.innerHTML =
    '<li class="search-loading">Buscando juegos...</li>';

  try {
    const games = await searchGames(query);
    displaySearchResults(games, searchInput.dataset.type);
  } catch (error) {
    console.error("Error en la búsqueda:", error);
    searchResults.innerHTML =
      '<li class="search-error">Error al buscar juegos. Inténtalo de nuevo.</li>';
    showNotification("Error al buscar juegos. Inténtalo de nuevo.", "error");
  }
}

// Función para buscar juegos en la API
async function searchGames(query) {
  const url = `${API_BASE_URL}/games?key=${API_KEY}&search=${encodeURIComponent(
    query
  )}&page_size=10`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error API: ${response.status}`);
  }

  const data = await response.json();
  return data.results;
}

// Función para mostrar resultados de búsqueda
function displaySearchResults(games, type) {
  const searchResults = document.getElementById("search-results");
  searchResults.innerHTML = "";

  if (games.length === 0) {
    searchResults.innerHTML =
      '<li class="search-no-results">No se encontraron juegos. Intenta con otra búsqueda.</li>';
    return;
  }

  games.forEach((game) => {
    const li = document.createElement("li");
    li.className = "search-result-item";

    // Crear imagen en miniatura
    const img = document.createElement("img");
    img.src = game.background_image || "img/placeholder.png";
    img.alt = game.name;
    img.onerror = function () {
      this.src = "img/placeholder.png";
    };

    // Crear div para información
    const info = document.createElement("div");
    info.className = "search-result-info";

    // Título del juego
    const title = document.createElement("div");
    title.className = "search-result-title";
    title.textContent = game.name;

    // Año de lanzamiento
    const year = document.createElement("div");
    year.className = "search-result-year";
    year.textContent = game.released
      ? `Lanzamiento: ${new Date(game.released).getFullYear()}`
      : "Fecha desconocida";

    // Plataformas
    const platforms = document.createElement("div");
    platforms.className = "search-result-platforms";
    platforms.textContent = game.platforms
      ? `Plataformas: ${game.platforms
          .slice(0, 3)
          .map((p) => p.platform.name)
          .join(", ")}${game.platforms.length > 3 ? "..." : ""}`
      : "Plataformas: No disponible";

    // Indicador de selección
    const selectIndicator = document.createElement("span");
    selectIndicator.className = "select-indicator";
    selectIndicator.textContent = "Seleccionar";

    // Añadir elementos al DOM
    info.appendChild(title);
    info.appendChild(year);
    info.appendChild(platforms);

    li.appendChild(img);
    li.appendChild(info);
    li.appendChild(selectIndicator);

    // Evento de clic para seleccionar juego
    li.addEventListener("click", () => {
      selectGame(game, type);
    });

    searchResults.appendChild(li);
  });
}

// Función para seleccionar un juego
function selectGame(game, type) {
  if (type === "your") {
    yourGame = game;
    updateGamePoster("your-game-poster", game);
  } else {
    theirGame = game;
    updateGamePoster("their-game-poster", game);
  }

  // Ocultar búsqueda
  document.getElementById("search-container").style.display = "none";
  document.getElementById("search-input").value = "";

  // Si ambos juegos están seleccionados, mostrar recomendaciones
  if (yourGame && theirGame) {
    showNotification(
      "¡Ambos juegos seleccionados! Generando recomendaciones..."
    );
    getRecommendations();
  }
}

// Función para actualizar el poster de un juego
function updateGamePoster(elementId, game) {
  const posterElement = document.getElementById(elementId);
  posterElement.innerHTML = "";
  posterElement.classList.add("selected");

  const img = document.createElement("img");
  img.src = game.background_image || "img/placeholder.png";
  img.alt = game.name;
  img.onerror = function () {
    this.src = "img/placeholder.png";
  };

  // Añadir título del juego
  const title = document.createElement("div");
  title.className = "game-title-overlay";
  title.textContent = game.name;

  posterElement.appendChild(img);
  posterElement.appendChild(title);
}

// Función para obtener una combinación aleatoria
async function getRandomCombo() {
  try {
    // Obtener juegos populares
    const url = `${API_BASE_URL}/games?key=${API_KEY}&ordering=-rating&page_size=50`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error API: ${response.status}`);
    }

    const data = await response.json();
    const games = data.results;

    if (games.length < 2) {
      throw new Error("No se encontraron suficientes juegos.");
    }

    // Seleccionar dos juegos aleatorios diferentes
    let index1 = Math.floor(Math.random() * games.length);
    let index2;
    do {
      index2 = Math.floor(Math.random() * games.length);
    } while (index1 === index2);

    // Asignar juegos
    yourGame = games[index1];
    theirGame = games[index2];

    // Actualizar posters
    updateGamePoster("your-game-poster", yourGame);
    updateGamePoster("their-game-poster", theirGame);

    // Mostrar mensaje de éxito
    showNotification(
      "¡Combinación aleatoria seleccionada! Generando recomendaciones..."
    );

    // Obtener recomendaciones
    getRecommendations();
  } catch (error) {
    console.error("Error al obtener combinación aleatoria:", error);
    showNotification(
      "Error al obtener combinación aleatoria. Inténtalo de nuevo.",
      "error"
    );
  }
}

// Función para obtener recomendaciones basadas en los juegos seleccionados
async function getRecommendations() {
  try {
    // Limpiar recomendaciones anteriores
    recommendedGames = [];

    // Obtener géneros de ambos juegos
    const yourGenres = yourGame.genres.map((g) => g.id);
    const theirGenres = theirGame.genres.map((g) => g.id);

    // Combinar géneros (sin duplicados)
    const combinedGenres = [...new Set([...yourGenres, ...theirGenres])];

    // Verificar si estamos usando los mismos géneros que antes
    const genresString = combinedGenres.sort().join(",");
    const useAlternativeApproach = previousGenres.includes(genresString);

    // Guardar géneros actuales para futuras comparaciones
    if (!previousGenres.includes(genresString)) {
      previousGenres.push(genresString);
      // Limitar el historial a los últimos 5 conjuntos de géneros
      if (previousGenres.length > 5) {
        previousGenres.shift();
      }
    }

    // Si no hay géneros o estamos usando los mismos géneros que antes, usar enfoque alternativo
    let queryParams = "";
    if (combinedGenres.length > 0 && !useAlternativeApproach) {
      queryParams = `&genres=${combinedGenres.join(",")}`;
    } else {
      // Usar plataformas o tags como alternativa
      const yourPlatforms = yourGame.platforms
        ? yourGame.platforms.map((p) => p.platform.id)
        : [];
      const theirPlatforms = theirGame.platforms
        ? theirGame.platforms.map((p) => p.platform.id)
        : [];
      const combinedPlatforms = [
        ...new Set([...yourPlatforms, ...theirPlatforms]),
      ];

      if (combinedPlatforms.length > 0) {
        queryParams = `&platforms=${combinedPlatforms.join(",")}`;
      }

      // Añadir un parámetro de ordenación aleatorio para mayor variedad
      const orderOptions = ["-rating", "-released", "-added", "-metacritic"];
      const randomOrder =
        orderOptions[Math.floor(Math.random() * orderOptions.length)];
      queryParams += `&ordering=${randomOrder}`;
    }

    // Excluir los juegos ya seleccionados y usados
    const excludeIds = [
      yourGame.id,
      theirGame.id,
      ...Array.from(usedGameIds),
    ].join(",");

    // Obtener juegos recomendados - Aumentado a 40 para tener más opciones de filtrado
    const url = `${API_BASE_URL}/games?key=${API_KEY}${queryParams}&exclude=${excludeIds}&page_size=40`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error API: ${response.status}`);
    }

    const data = await response.json();

    // Filtrar juegos para asegurar variedad
    let filteredGames = data.results.filter((game) => {
      // Verificar que no sea uno de los juegos seleccionados o ya usados
      return (
        game.id !== yourGame.id &&
        game.id !== theirGame.id &&
        !usedGameIds.has(game.id)
      );
    });

    // Si tenemos pocos juegos, intentar con otra búsqueda más amplia
    if (filteredGames.length < 10) {
      // Intentar con una búsqueda más amplia sin filtros de género
      const fallbackUrl = `${API_BASE_URL}/games?key=${API_KEY}&exclude=${excludeIds}&ordering=-rating&page_size=40`;
      const fallbackResponse = await fetch(fallbackUrl);

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        const fallbackGames = fallbackData.results.filter(
          (game) =>
            game.id !== yourGame.id &&
            game.id !== theirGame.id &&
            !usedGameIds.has(game.id)
        );

        // Combinar con los juegos ya encontrados
        filteredGames = [...new Set([...filteredGames, ...fallbackGames])];
      }
    }

    // Ordenar aleatoriamente para mayor variedad
    filteredGames.sort(() => Math.random() - 0.5);

    // Limitar a 10 juegos
    recommendedGames = filteredGames.slice(0, 10);

    // Agregar IDs a la lista de usados para evitar repeticiones en futuras recomendaciones
    recommendedGames.forEach((game) => usedGameIds.add(game.id));

    // Mostrar recomendaciones
    displayRecommendations();
  } catch (error) {
    console.error("Error al obtener recomendaciones:", error);
    showNotification(
      "Error al obtener recomendaciones. Inténtalo de nuevo.",
      "error"
    );
  }
}

// Función para mostrar recomendaciones
function displayRecommendations() {
  const recommendationsContainer = document.getElementById(
    "recommendations-container"
  );
  const recommendationsGrid = document.getElementById("recommendations-grid");
  const gameDetails = document.getElementById("game-details");

  // Mostrar contenedor de recomendaciones
  recommendationsContainer.style.display = "block";
  recommendationsGrid.style.display = "grid";
  gameDetails.style.display = "none";

  // Limpiar grid
  recommendationsGrid.innerHTML = "";

  // Verificar si hay recomendaciones
  if (recommendedGames.length === 0) {
    recommendationsGrid.innerHTML =
      '<p class="no-results">No se encontraron recomendaciones basadas en tu selección. Intenta con otros juegos.</p>';
    return;
  }

  // Crear elementos para cada juego recomendado
  recommendedGames.forEach((game) => {
    const item = document.createElement("div");
    item.className = "recommendation-item";

    const poster = document.createElement("div");
    poster.className = "recommendation-poster";

    const img = document.createElement("img");
    img.src = game.background_image || "img/placeholder.png";
    img.alt = game.name;
    img.onerror = function () {
      this.src = "img/placeholder.png";
    };

    const title = document.createElement("div");
    title.className = "recommendation-title";
    title.textContent = game.name;

    // Añadir información adicional
    const info = document.createElement("div");
    info.className = "recommendation-info";

    // Año de lanzamiento
    if (game.released) {
      const year = document.createElement("span");
      year.className = "recommendation-year";
      year.textContent = new Date(game.released).getFullYear();
      info.appendChild(year);
    }

    // Rating si está disponible
    if (game.rating) {
      const rating = document.createElement("span");
      rating.className = "recommendation-rating";
      rating.innerHTML = `★ ${game.rating.toFixed(1)}`;
      info.appendChild(rating);
    }

    poster.appendChild(img);
    item.appendChild(poster);
    item.appendChild(title);
    item.appendChild(info);

    // Evento para mostrar detalles
    item.addEventListener("click", () => showGameDetails(game));

    recommendationsGrid.appendChild(item);
  });

  // Desplazar a las recomendaciones
  recommendationsContainer.scrollIntoView({ behavior: "smooth" });

  // Mostrar notificación
  showNotification(
    `¡Listo! Encontramos ${recommendedGames.length} juegos recomendados para ti.`
  );
}

// Función para mostrar detalles de un juego
async function showGameDetails(game) {
  const recommendationsGrid = document.getElementById("recommendations-grid");
  const gameDetails = document.getElementById("game-details");
  const detailPoster = document.getElementById("detail-poster");
  const detailTitle = document.getElementById("detail-title");
  const detailYear = document.getElementById("detail-year");
  const detailGenres = document.getElementById("detail-genres");
  const detailDescription = document.getElementById("detail-description");

  // Ocultar grid y mostrar detalles
  recommendationsGrid.style.display = "none";
  gameDetails.style.display = "block";

  // Mostrar indicador de carga
  detailDescription.innerHTML =
    '<div class="loading-indicator">Cargando detalles del juego...</div>';

  // Actualizar información básica
  detailPoster.src = game.background_image || "img/placeholder.png";
  detailPoster.onerror = function () {
    this.src = "img/placeholder.png";
  };
  detailTitle.textContent = game.name;
  detailYear.textContent = game.released
    ? `Lanzamiento: ${new Date(game.released).getFullYear()}`
    : "Fecha de lanzamiento desconocida";
  detailGenres.textContent = `Géneros: ${
    game.genres.map((g) => g.name).join(", ") || "No disponible"
  }`;

  // Obtener detalles adicionales
  try {
    const url = `${API_BASE_URL}/games/${game.id}?key=${API_KEY}`;
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();

      // Crear contenido HTML para la descripción
      let descriptionHTML = "";

      if (data.description) {
        descriptionHTML += `<div class="game-description">${data.description}</div>`;
      } else {
        descriptionHTML += "<p>No hay descripción disponible.</p>";
      }

      // Añadir plataformas si están disponibles
      if (data.platforms && data.platforms.length > 0) {
        descriptionHTML +=
          '<div class="game-platforms"><strong>Plataformas:</strong> ';
        descriptionHTML += data.platforms
          .map((p) => p.platform.name)
          .join(", ");
        descriptionHTML += "</div>";
      }

      // Añadir desarrolladores si están disponibles
      if (data.developers && data.developers.length > 0) {
        descriptionHTML +=
          '<div class="game-developers"><strong>Desarrolladores:</strong> ';
        descriptionHTML += data.developers.map((d) => d.name).join(", ");
        descriptionHTML += "</div>";
      }

      // Añadir editores si están disponibles
      if (data.publishers && data.publishers.length > 0) {
        descriptionHTML +=
          '<div class="game-publishers"><strong>Editores:</strong> ';
        descriptionHTML += data.publishers.map((p) => p.name).join(", ");
        descriptionHTML += "</div>";
      }

      detailDescription.innerHTML = descriptionHTML;
    } else {
      detailDescription.textContent = "No se pudo cargar la descripción.";
    }
  } catch (error) {
    console.error("Error al obtener detalles:", error);
    detailDescription.textContent = "Error al cargar la descripción.";
  }

  // Desplazar a los detalles
  gameDetails.scrollIntoView({ behavior: "smooth" });
}

// Función para reiniciar selecciones
function resetSelections() {
  yourGame = null;
  theirGame = null;

  // Limpiar posters
  document.getElementById("your-game-poster").innerHTML =
    '<div class="selection-indicator">Selecciona un juego</div>';
  document.getElementById("your-game-poster").classList.remove("selected");

  document.getElementById("their-game-poster").innerHTML =
    '<div class="selection-indicator">Selecciona un juego</div>';
  document.getElementById("their-game-poster").classList.remove("selected");

  // Ocultar recomendaciones
  document.getElementById("recommendations-container").style.display = "none";

  // Mostrar notificación
  showNotification("Selecciones reiniciadas. ¡Elige nuevos juegos!", "info");

  // Desplazar al inicio
  document
    .querySelector(".heart-container")
    .scrollIntoView({ behavior: "smooth" });
}

// Función debounce para evitar demasiadas llamadas a la API
function debounce(func, delay) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

// Asegurar que las animaciones se reinicien periódicamente
setInterval(() => {
  // Recrear elementos animados para mantener la animación fresca
  createGameElements();
}, 60000); // Cada minuto
