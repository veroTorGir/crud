const STORAGE = {
    movies: "cineflix_movies_v2",
    users: "cineflix_users_v2",
    session: "cineflix_session_v2"
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop";

const appState = {
    movies: loadJson(STORAGE.movies, []),
    users: loadJson(STORAGE.users, []),
    activeUser: loadJson(STORAGE.session, null),
    editingMovieId: null
};

const ui = {
    loginSection: document.getElementById("loginSection"),
    mainContent: document.getElementById("mainContent"),
    btnLogin: document.getElementById("btnLogin"),
    btnLogout: document.getElementById("btnLogout"),
    btnAgregar: document.getElementById("btnAgregar"),
    btnGuardarPelicula: document.getElementById("btnGuardarPelicula"),
    sinResultados: document.getElementById("sinResultados"),
    gridPeliculas: document.getElementById("gridPeliculas"),
    carouselMovies: document.getElementById("carouselMovies"),
    inputBuscar: document.getElementById("inputBuscar"),
    selectGenero: document.getElementById("selectGenero"),
    formLogin: document.getElementById("formLogin"),
    formRegistro: document.getElementById("formRegistro"),
    formPelicula: document.getElementById("formPelicula"),
    formUser: document.getElementById("inputUser"),
    formPassword: document.getElementById("inputPassword"),
    formNombre: document.getElementById("inputNombre"),
    formEmail: document.getElementById("inputEmail"),
    formUserReg: document.getElementById("inputUserReg"),
    formPasswordReg: document.getElementById("inputPasswordReg"),
    formConfirmPassword: document.getElementById("inputConfirmPassword"),
    inputTitulo: document.getElementById("inputTitulo"),
    inputGenero: document.getElementById("inputGenero"),
    inputDirector: document.getElementById("inputDirector"),
    inputAno: document.getElementById("inputAno"),
    inputCalificacion: document.getElementById("inputCalificacion"),
    inputDescripcion: document.getElementById("inputDescripcion"),
    inputImagen: document.getElementById("inputImagen"),
    modalTitulo: document.getElementById("modalTitulo"),
    modalPelicula: document.getElementById("modalPelicula"),
    modalDetalles: document.getElementById("modalDetalles"),
    detallesTitulo: document.getElementById("detallesTitulo"),
    detallesGenero: document.getElementById("detallesGenero"),
    detallesDirector: document.getElementById("detallesDirector"),
    detallesAno: document.getElementById("detallesAno"),
    detallesCalificacion: document.getElementById("detallesCalificacion"),
    detallesDescripcion: document.getElementById("detallesDescripcion"),
    detallesImagen: document.getElementById("detallesImagen"),
    linkLogin: document.getElementById("linkLogin")
};

function loadJson(key, defaultValue) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function saveState() {
    localStorage.setItem(STORAGE.movies, JSON.stringify(appState.movies));
    localStorage.setItem(STORAGE.users, JSON.stringify(appState.users));
    localStorage.setItem(STORAGE.session, JSON.stringify(appState.activeUser));
}

function seedUsers() {
    if (appState.users.length > 0) {
        return;
    }

    appState.users = [
        { nombre: "Administrador", email: "admin@cineflix.local", usuario: "admin", password: "admin123" },
        { nombre: "Usuario Demo", email: "demo@cineflix.local", usuario: "demo", password: "demo123" }
    ];
    saveState();
}

function initialize() {
    seedUsers();
    bindEvents();

    if (appState.activeUser) {
        showMainView();
    } else {
        showLoginView();
    }

    renderCatalog();
}

function bindEvents() {
    ui.formLogin.addEventListener("submit", onLogin);
    ui.formRegistro.addEventListener("submit", onRegister);
    ui.btnLogout.addEventListener("click", onLogout);
    ui.btnLogin.addEventListener("click", () => ui.loginSection.scrollIntoView({ behavior: "smooth" }));
    ui.btnGuardarPelicula.addEventListener("click", onSaveMovie);
    ui.inputBuscar.addEventListener("input", renderCatalog);
    ui.selectGenero.addEventListener("change", renderCatalog);

    ui.modalPelicula.addEventListener("hidden.bs.modal", () => {
        ui.formPelicula.reset();
        appState.editingMovieId = null;
        ui.modalTitulo.textContent = "Agregar Película";
    });

    ui.linkLogin.addEventListener("click", event => {
        event.preventDefault();
        document.getElementById("login-tab").click();
    });
}

function onLogin(event) {
    event.preventDefault();

    const user = ui.formUser.value.trim();
    const password = ui.formPassword.value;

    const found = appState.users.find(item => item.usuario === user && item.password === password);
    if (!found) {
        alert("Credenciales inválidas.");
        return;
    }

    appState.activeUser = { usuario: found.usuario, nombre: found.nombre };
    saveState();
    ui.formLogin.reset();
    showMainView();
    renderCatalog();
}

function onRegister(event) {
    event.preventDefault();

    const nombre = ui.formNombre.value.trim();
    const email = ui.formEmail.value.trim().toLowerCase();
    const usuario = ui.formUserReg.value.trim();
    const password = ui.formPasswordReg.value;
    const confirmPassword = ui.formConfirmPassword.value;

    if (usuario.length < 4) {
        alert("El usuario debe tener mínimo 4 caracteres.");
        return;
    }

    if (password.length < 6) {
        alert("La contraseña debe tener mínimo 6 caracteres.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
    }

    const duplicateUser = appState.users.some(item => item.usuario.toLowerCase() === usuario.toLowerCase());
    const duplicateEmail = appState.users.some(item => item.email.toLowerCase() === email);

    if (duplicateUser) {
        alert("Ese usuario ya existe.");
        return;
    }

    if (duplicateEmail) {
        alert("Ese correo ya está registrado.");
        return;
    }

    appState.users.push({ nombre, email, usuario, password });
    saveState();
    ui.formRegistro.reset();
    alert("Cuenta creada. Ahora inicia sesión.");
    document.getElementById("login-tab").click();
}

function onLogout() {
    appState.activeUser = null;
    saveState();
    showLoginView();
}

function showMainView() {
    ui.loginSection.style.display = "none";
    ui.mainContent.style.display = "block";
    ui.btnLogin.style.display = "none";
    ui.btnLogout.style.display = "inline-block";
    ui.btnAgregar.style.display = "inline-block";
}

function showLoginView() {
    ui.loginSection.style.display = "flex";
    ui.mainContent.style.display = "none";
    ui.btnLogin.style.display = "inline-block";
    ui.btnLogout.style.display = "none";
    ui.btnAgregar.style.display = "none";
}

function onSaveMovie() {
    if (!ui.formPelicula.checkValidity()) {
        ui.formPelicula.reportValidity();
        return;
    }

    const movie = {
        id: appState.editingMovieId ?? Date.now(),
        titulo: ui.inputTitulo.value.trim(),
        genero: ui.inputGenero.value,
        director: ui.inputDirector.value.trim(),
        ano: Number(ui.inputAno.value),
        calificacion: Number(ui.inputCalificacion.value),
        descripcion: ui.inputDescripcion.value.trim(),
        imagen: ui.inputImagen.value.trim() || FALLBACK_IMAGE,
        updatedAt: new Date().toISOString()
    };

    if (!appState.editingMovieId) {
        movie.createdAt = new Date().toISOString();
        appState.movies.unshift(movie);
    } else {
        appState.movies = appState.movies.map(item => {
            if (item.id !== appState.editingMovieId) {
                return item;
            }
            return { ...item, ...movie };
        });
    }

    saveState();
    renderCatalog();
    bootstrap.Modal.getOrCreateInstance(ui.modalPelicula).hide();
}

function getFilteredMovies() {
    const text = ui.inputBuscar.value.trim().toLowerCase();
    const selectedGenre = ui.selectGenero.value;

    return appState.movies.filter(movie => {
        const matchesText =
            movie.titulo.toLowerCase().includes(text) ||
            movie.director.toLowerCase().includes(text) ||
            movie.descripcion.toLowerCase().includes(text);
        const matchesGenre = selectedGenre === "" || movie.genero === selectedGenre;
        return matchesText && matchesGenre;
    });
}

function renderCatalog() {
    const visibleMovies = getFilteredMovies();
    ui.gridPeliculas.innerHTML = "";

    ui.sinResultados.style.display = visibleMovies.length === 0 ? "block" : "none";

    visibleMovies.forEach(movie => {
        const col = document.createElement("div");
        col.className = "col-sm-6 col-lg-4 col-xl-3";

        col.innerHTML = `
            <article class="movie-card">
                <img src="${movie.imagen || FALLBACK_IMAGE}" alt="${movie.titulo}" class="movie-image" onerror="this.src='${FALLBACK_IMAGE}'">
                <div class="movie-content">
                    <h5 class="movie-title">${movie.titulo}</h5>
                    <span class="movie-genre">${movie.genero}</span>
                    <p class="movie-meta">Director: ${movie.director}</p>
                    <p class="movie-meta">Año: ${movie.ano}</p>
                    <p class="movie-rating">Puntaje: ${movie.calificacion.toFixed(1)} / 10</p>
                    <p class="movie-description">${movie.descripcion}</p>
                    <div class="movie-actions">
                        <button class="btn btn-outline-primary btn-sm" onclick="verDetalles(${movie.id})">Detalles</button>
                        <button class="btn btn-outline-warning btn-sm" onclick="editarPelicula(${movie.id})">Editar</button>
                        <button class="btn btn-outline-danger btn-sm" onclick="eliminarPelicula(${movie.id})">Eliminar</button>
                    </div>
                </div>
            </article>
        `;

        ui.gridPeliculas.appendChild(col);
    });

    renderRecentSlider();
}

function renderRecentSlider() {
    const recent = [...appState.movies]
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
        .slice(0, 8);

    ui.carouselMovies.innerHTML = "";

    recent.forEach(movie => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "slider-movie-card";
        card.addEventListener("click", () => verDetalles(movie.id));

        card.innerHTML = `
            <img src="${movie.imagen || FALLBACK_IMAGE}" alt="${movie.titulo}" onerror="this.src='${FALLBACK_IMAGE}'">
            <div class="slider-movie-info">
                <h6>${movie.titulo}</h6>
                <small>${movie.genero}</small>
            </div>
        `;

        ui.carouselMovies.appendChild(card);
    });
}

function scrollSlider(direction) {
    ui.carouselMovies.scrollBy({ left: direction * 240, behavior: "smooth" });
}

function eliminarPelicula(id) {
    if (!confirm("¿Deseas eliminar esta película?")) {
        return;
    }

    appState.movies = appState.movies.filter(movie => movie.id !== id);
    saveState();
    renderCatalog();
}

function editarPelicula(id) {
    const movie = appState.movies.find(item => item.id === id);
    if (!movie) {
        return;
    }

    appState.editingMovieId = id;

    ui.modalTitulo.textContent = "Editar Película";
    ui.inputTitulo.value = movie.titulo;
    ui.inputGenero.value = movie.genero;
    ui.inputDirector.value = movie.director;
    ui.inputAno.value = movie.ano;
    ui.inputCalificacion.value = movie.calificacion;
    ui.inputDescripcion.value = movie.descripcion;
    ui.inputImagen.value = movie.imagen;

    bootstrap.Modal.getOrCreateInstance(ui.modalPelicula).show();
}

function verDetalles(id) {
    const movie = appState.movies.find(item => item.id === id);
    if (!movie) {
        return;
    }

    ui.detallesTitulo.textContent = movie.titulo;
    ui.detallesGenero.textContent = movie.genero;
    ui.detallesDirector.textContent = movie.director;
    ui.detallesAno.textContent = movie.ano;
    ui.detallesCalificacion.textContent = movie.calificacion.toFixed(1);
    ui.detallesDescripcion.textContent = movie.descripcion;
    ui.detallesImagen.src = movie.imagen || FALLBACK_IMAGE;
    ui.detallesImagen.alt = movie.titulo;

    bootstrap.Modal.getOrCreateInstance(ui.modalDetalles).show();
}

window.scrollSlider = scrollSlider;
window.eliminarPelicula = eliminarPelicula;
window.editarPelicula = editarPelicula;
window.verDetalles = verDetalles;

document.addEventListener("DOMContentLoaded", initialize);
