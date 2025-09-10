class GestorRecibos {
    constructor() {
        this.ID_HOJA = '1TlxZvRKolH7K3cGr_JskyJkND16tm0URdB0tI2G2pQo';
        this.CLAVE_API = 'AIzaSyDMyL1stX-QSMHPvuQAp93ipegoEYdg1mI';
        this.HOJA_USUARIOS = 'Usuarios';
        this.HOJA_VACACIONES = 'Vacaciones';
        this.HOJA_BAJAS = 'Bajas Sin Cubrir';
        this.HOJA_PersonalActivo = 'Personal Activo';
        this.HOJA_ACCIDENTES = 'Accidentes';
        this.HOJA_MedicinaLaboral = 'Medicina Laboral';
        this.HOJA_RECATEGORIZACION = "datos_recategorizacion";
        this.HOJA_Escalafon = "Escalafon";
        this.HOJA_Recibos = 'datos_recibos';

        this.usuarios = {};
        this.usuarioActual = null;

        this._cache = new Map();
        this._cacheTTL = 5 * 60 * 1000;

        // Variables para recibos
        this.recibosFiltrados = [];
        this.todosLosRecibos = [];
        this.selectorDependencia = null;
        this.botonCargar = null;
        this.cargando = null;
        this.contenedorRecibos = null;
        this.inputLegajo = null;

        // Variables para vacaciones
        this.vacacionesFiltradas = [];
        this.todasLasVacaciones = [];
        this.encabezadosVacaciones = null;
        this.selectorDependenciaVacaciones = null;
        this.botonCargarVacaciones = null;
        this.cargandoVacaciones = null;
        this.contenedorVacaciones = null;
        this.inputLegajoVacaciones = null;

        // Variables para bajas sin cubrir
        this.bajasFiltradas = [];
        this.todasLasBajas = [];
        this.selectorDependenciaBajas = null;
        this.botonCargarBajas = null;
        this.cargandoBajas = null;
        this.contenedorBajas = null;
        this.inputLegajoBajas = null;

        // Variables para personal activo
        this.personalActivoFiltrado = [];
        this.todosLosPersonalActivo = [];
        this.selectorDependenciaPersonalActivo = null;
        this.botonCargarPersonalActivo = null;
        this.cargandoPersonalActivo = null;
        this.contenedorPersonalActivo = null;
        this.inputLegajoPersonalActivo = null;

        // Variables para recategorización
        this.inputLegajoRecategorizacion = null;
        this.botonBuscarRecategorizacion = null;
        this.recategorizacionDatos = null;
        this.recategorizacionLista = [];
        this.categoriasDisponibles = [];

        // Variables para accidentes
        this.formularioAccidente = null;
        this.inputLegajoAccidente = null;
        this.inputNombreAccidente = null;
        this.inputApellidoAccidente = null;
        this.inputDetalleAccidente = null;
        this.inputFechaAccidente = null;
        this.inputHoraAccidente = null;
        this.inputAdministradorAccidente = null;
        this.botonGuardarAccidente = null;

        // Variables para medicina laboral
        this.formularioMedicinaLaboral = null;
        this.inputLegajoMedicinaLaboral = null;
        this.inputNombreMedicinaLaboral = null;
        this.inputApellidoMedicinaLaboral = null;
        this.inputFechaCertificadoMedicinaLaboral = null;
        this.inputcantDiasHorasMedicinaLaboral = null;
        this.inputHoraMedicinaLaboral = null;
        this.diagnosticoMedicinaLaboral = null;
        this.archivoAdjMedicinaLaboral = null;
        this.inputAdministradorMedicinaLaboral = null;

        this.pdfLinks = [
            { href: 'pdfs/IOMA.pdf', label: 'IOMA', icon: '📄' },
            { href: 'pdfs/Ordenanza - Temas importantes.pdf', label: 'Ordenanzas', icon: '📚' },
            { href: 'pdfs/NORMATIVAS VIGENTES DESDE 1-1-25 (002).pdf', label: 'Normativa Medicina Laboral', icon: '⚖️' },
        ];

        this.inicializar();
    }

    async inicializar() {
        try {
            await this.cargarUsuarios();
            this.mostrarLogin();
        } catch (error) {
            document.body.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); font-family: Arial, sans-serif; color: var(--primary-contrast); text-align: center;">
                    <div style="background: rgba(255,255,255,0.1); padding: 40px; border-radius: 15px; backdrop-filter: blur(10px);">
                        <h2>❌ Error de conexión</h2>
                        <p>No se pudieron cargar los usuarios del sistema.</p>
                        <p>Verifica tu conexión a internet y la configuración de la hoja de cálculo.</p>
                        <button onclick="location.reload()" style="padding: 10px 20px; background: var(--surface); color: var(--brand-primary); border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin-top: 20px;">
                            🔄 Intentar nuevamente
                        </button>
                    </div>
                </div>
            `;
        }
    }

    async cargarUsuarios() {
        try {
            const datos = await this.obtenerDatosHoja(`${this.HOJA_USUARIOS}!A:D`);
            this.usuarios = {};

            if (datos.values?.length > 1) {
                datos.values.slice(1).forEach(fila => {
                    if (fila[0] && fila[1] && fila[2]) {
                        this.usuarios[fila[0]] = {
                            password: fila[1],
                            dependencia: fila[2],
                            role: fila[3] || 'admin'
                        };
                    }
                });
            }
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            this.usuarios = {};
            throw new Error('No se pudieron cargar los usuarios desde la hoja de cálculo');
        }
    }

    mostrarLogin() {
        document.body.innerHTML = this.obtenerHTMLLogin();
        this.configurarEventosLogin();
    }

    obtenerHTMLLogin() {
        return `
            ${this.getToolbarDownloadsHTML()}
            <div class="login-container" style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); font-family: Arial, sans-serif;">
                <div class="login-form" style="background: var(--surface); padding: 40px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); width: 350px; text-align: center;">
                    <h2 style="color: var(--text); margin-bottom: 30px; font-size: 28px;">Sistema de Gestión</h2>
                    <p style="color: #666; margin-bottom: 25px;">Inicia sesión para acceder</p>
                    <form id="loginForm">
                        <div style="margin-bottom: 20px; text-align: left;">
                            <label style="color: #555; font-weight: bold;">Usuario:</label>
                            <input type="text" id="username" required style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; margin-top: 5px; box-sizing: border-box;">
                        </div>
                        <div style="margin-bottom: 25px; text-align: left;">
                            <label style="color: #555; font-weight: bold;">Contraseña:</label>
                            <input type="password" id="password" required style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; margin-top: 5px; box-sizing: border-box;">
                        </div>
                        <button type="submit" style="width: 100%; padding: 12px; background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">
                            Ingresar
                        </button>
                    </form>
                    <div id="loginError" style="color: var(--error); text-align: center; margin-top: 15px; font-weight: bold;"></div>
                </div>
            </div>
        `;
    }

    getToolbarDownloadsHTML() {
        const links = this.pdfLinks
            .map(l => `<a href="${l.href}" download class="download-link">${l.icon} ${l.label}</a>`)
            .join('');
        return `
            <nav class="toolbar-downloads">
                <div style="max-width:1200px; margin:0 auto; padding:0 16px; display:flex; align-items:center; justify-content:center; gap:20px; flex-wrap:wrap;">
                    <img src="logo.png" alt="Logo del Sistema de Gestión" style="height:100px; width:auto; object-fit:contain;">
                    <div style="display:flex; align-items:center; justify-content:center; gap:12px; flex-wrap:wrap;">${links}</div>
                </div>
            </nav>
        `;
    }

    configurarEventosLogin() {
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.autenticar();
        });
        document.getElementById('username').focus();
    }

    async autenticar() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        errorDiv.textContent = 'Verificando credenciales...';
        errorDiv.style.color = '#007bff';

        await this.cargarUsuarios();

        if (this.usuarios[username]?.password === password) {
            this.usuarioActual = { username, ...this.usuarios[username] };
            this.mostrarInterfazPrincipal();
        } else {
            this.mostrarErrorLogin(errorDiv);
        }
    }

    mostrarErrorLogin(errorDiv) {
        errorDiv.textContent = 'Usuario o contraseña incorrectos';
        errorDiv.style.color = '#e74c3c';
        document.getElementById('password').value = '';
        document.getElementById('username').focus();
    }

    mostrarInterfazPrincipal() {
        this.mostrarMenuPrincipal();
    }

    mostrarMenuPrincipal() {
        document.body.innerHTML = this.obtenerHTMLMenu();
        this.configurarEventosMenu();
    }

    obtenerHTMLMenu() {
        return `
            <div class="menu-page">
                <div class="menu-card">
                    ${this.obtenerHTMLHeaderMenu()}

                    <h1 class="menu-title">🏢 Sistema de Gestión</h1>

                    <div class="menu-options">
            <button onclick="gestorRecibos.mostrarModuloRecibos()" class="menu-btn" style="background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); border: none; font-weight: bold;">
                            📋<br>Recibos de Sueldo
                        </button>

            <button onclick="gestorRecibos.mostrarModuloVacaciones()" class="menu-btn" style="background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); border: none; font-weight: bold;">
                            🏖️<br>Vacaciones
                        </button>

            <button onclick="gestorRecibos.mostrarModuloBajas()" class="menu-btn" style="background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); border: none; font-weight: bold;">
                            ⚠️<br>Bajas Sin Cubrir
                        </button>

            <button onclick="gestorRecibos.mostrarModuloPersonalActivo()" class="menu-btn" style="background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); border: none; font-weight: bold;">
                            👥<br>Personal Activo
                        </button>

            <button onclick="gestorRecibos.mostrarModuloRecategorizacion()" class="menu-btn" style="background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); border: none; font-weight: bold;">
                            🔄<br>Recategorización
                        </button>

            <button onclick="gestorRecibos.mostrarModuloAccidentes()" class="menu-btn" style="background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); border: none; font-weight: bold;">
                            🚨<br>Registrar Accidente
                        </button>

            <button onclick="gestorRecibos.mostrarModuloMedicinaLaboral()" class="menu-btn" style="background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); border: none; font-weight: bold;">
                            🏥<br>Medicina Laboral
                        </button>
            <button onclick=gestorRecibos.mostrarModuloModelosNotas() class="menu-btn" style="background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); border: none; font-weight: bold;">
                            📝<br>Modelos de Notas
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    obtenerHTMLHeaderMenu() {
        return `
            <div class="user-info" style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); padding: 15px 20px; border-radius: 8px; margin-bottom: 20px;">
                <div>
                    <strong>👤 ${this.usuarioActual.username}</strong>
                    <br>
                    <small>${this.usuarioActual.dependencia || 'Super Administrador'}</small>
                </div>
                <button onclick="gestorRecibos.cerrarSesion()" style="background-color: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                    🚪 Cerrar Sesión
                </button>
            </div>
        `;
    }

    configurarEventosMenu() {
        // Agregar efectos hover a los botones del menú
        const botones = document.querySelectorAll('.menu-btn');
        botones.forEach(boton => {
            boton.onmouseover = () => boton.style.transform = 'translateY(-5px)';
            boton.onmouseout = () => boton.style.transform = 'translateY(0)';
        });
    }

    debounce(fn, delay = 250) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    getUserHeaderHTML(tituloConIcono) {
        return `
            <div class="user-info" style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); padding: 15px 20px; border-radius: 8px; margin-bottom: 20px;">
                <div>
                    <strong>👤 ${this.usuarioActual.username}</strong>
                    <br>
                    <small>${this.usuarioActual.dependencia || 'Super Administrador'}</small>
                </div>
                <button onclick="gestorRecibos.cerrarSesion()" style="background-color: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                    🚪 Cerrar Sesión
                </button>
            </div>
            <h1 style="text-align: center; color: var(--text); margin-bottom: 20px;">${tituloConIcono}</h1>
        `;
    }

    mostrarModuloRecibos() {
        document.body.innerHTML = this.obtenerHTMLInterfaz();
        this.inicializarReferenciasDOM();
        this.configurarEventos();
        this.cargarDependenciasRestringidas();
    }

    obtenerHTMLInterfaz() {
        return `
            <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
        <div class="header" style="background: var(--surface); padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
                    ${this.obtenerHTMLHeader()}
                    ${this.obtenerHTMLControles()}
                    
                    <div style="text-align: center; margin-top: 20px;">
            <button onclick="gestorRecibos.mostrarMenuPrincipal()" style="padding: 8px 15px; background: var(--neutral); color: var(--primary-contrast); border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                            ⬅️ Volver al Menú Principal
                        </button>
                    </div>
                </div>
                
        <div id="loading" style="display: none; text-align: center; padding: 40px; font-size: 18px; color: var(--brand-primary);">
                    ⏳ Cargando recibos...
                </div>
                
                <div id="recibosContainer"></div>
            </div>
        `;
    }

    obtenerHTMLHeader() {
        return this.getUserHeaderHTML('📋 Sistema de Gestión de Recibos');
    }

    obtenerHTMLControles() {
        return `
            <div class="controls" style="display: flex; gap: 15px; align-items: center; justify-content: center; flex-wrap: wrap;">
        <select id="dependenciaSelect" style="padding: 10px; border: 2px solid var(--border); border-radius: 5px; font-size: 16px; min-width: 200px;">
                    <option value="">Selecciona una dependencia</option>
                </select>
                
        <input type="text" id="legajoInput" placeholder="Filtrar por legajo..." style="padding: 10px; border: 2px solid var(--border); border-radius: 5px; font-size: 16px; min-width: 150px;">
                
        <button id="loadBtn" style="padding: 10px 20px; background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); border: none; border-radius: 5px; font-size: 16px; cursor: pointer; font-weight: bold;">
                    📥 Cargar Recibos
                </button>
                
        <button id="uploadBtn" style="padding: 10px 20px; background: #00a86b; color: var(--primary-contrast); border: none; border-radius: 5px; font-size: 16px; cursor: pointer; font-weight: bold;">
                    ⬆️ Subir Recibo
                </button>
                <input id="uploadInput" type="file" accept="application/pdf,image/*" multiple style="display:none">

        <button id="clearBtn" style="padding: 10px 15px; background: var(--neutral); color: var(--primary-contrast); border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
                    🗑️ Limpiar
                </button>
            </div>
        `;
    }

    inicializarReferenciasDOM() {
        this.selectorDependencia = document.getElementById('dependenciaSelect');
        this.botonCargar = document.getElementById('loadBtn');
        this.cargando = document.getElementById('loading');
        this.contenedorRecibos = document.getElementById('recibosContainer');
        this.inputLegajo = document.getElementById('legajoInput');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.uploadInput = document.getElementById('uploadInput');
        this.cargarRecibosDesdeStorage();
        try {
            if (this.selectorDependencia && this.selectorDependencia.options.length <= 1 && this.usuarioActual && this.usuarioActual.dependencia) {
                const opcion = document.createElement('option');
                opcion.value = this.usuarioActual.dependencia;
                opcion.textContent = this.usuarioActual.dependencia;
                this.selectorDependencia.appendChild(opcion);
                this.selectorDependencia.value = this.usuarioActual.dependencia;
                // Si no es superadmin, mantenemos el selector deshabilitado para reflejar permisos
                if (this.usuarioActual.role !== 'superadmin') {
                    this.selectorDependencia.disabled = true;
                    this.selectorDependencia.style.backgroundColor = '#f8f9fa';
                }
            }
        } catch (e) {
            console.warn('No se pudo auto-popular dependencia:', e);
        }
    }

    configurarEventos() {
        this.botonCargar.addEventListener('click', () => this.cargarRecibos());
        this.inputLegajo.addEventListener('input', this.debounce(() => this.filtrarPorLegajo(), 200));
        document.getElementById('clearBtn').addEventListener('click', () => this.limpiarFiltros());
        if (this.uploadBtn && this.uploadInput) {
            this.uploadBtn.addEventListener('click', () => this.uploadInput.click());
            this.uploadInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length) this.handleUploadFiles(files);
                e.target.value = '';
            });
        }
    }
    handleUploadFiles(files) {
        this.mostrarFormularioCarga(files);
    }

    mostrarFormularioCarga(files) {
        const overlay = document.createElement('div');
        overlay.id = 'uploadModalOverlay';
        overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:9999;';

        const ahora = new Date();
        const fechaHoy = ahora.toISOString().split('T')[0];
        const anioActual = ahora.getFullYear();

        const filesListHTML = files.map(f => `<li>${f.name} (${Math.round(f.size / 1024)} KB)</li>`).join('');

        overlay.innerHTML = `
            <div style="background:var(--surface); padding:18px; border-radius:10px; width:420px; max-width:95%; box-shadow:0 10px 30px rgba(0,0,0,0.3);">
                <h3 style="margin:0 0 8px 0;">Subir Recibo </h3>
                <p style="margin:0 0 12px 0; color:#555; font-size:14px">Archivos seleccionados:</p>
                <ul style="max-height:90px; overflow:auto; padding-left:18px; margin:0 0 12px 0;">${filesListHTML}</ul>

                <label style="display:block; font-weight:bold; margin-bottom:6px">Fecha</label>
                <input type="date" id="modalFechaRecibo" value="${fechaHoy}" style="width:100%; padding:8px; margin-bottom:10px; border:1px solid var(--border); border-radius:6px">

                <label style="display:block; font-weight:bold; margin-bottom:6px">Legajo</label>
                <input type="text" id="modalLegajoRecibo" value="${(this.inputLegajo && this.inputLegajo.value) || ''}" placeholder="Ej: 12345" style="width:100%; padding:8px; margin-bottom:10px; border:1px solid var(--border); border-radius:6px">

                <div style="display:flex; gap:8px; margin-bottom:10px;">
                    <div style="flex:1">
                        <label style="display:block; font-weight:bold; margin-bottom:6px">Mes</label>
                        <select id="modalMesRecibo" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:6px">
                            <option value="">Seleccione mes</option>
                            <option value="1">Enero</option>
                            <option value="2">Febrero</option>
                            <option value="3">Marzo</option>
                            <option value="4">Abril</option>
                            <option value="5">Mayo</option>
                            <option value="6">Junio</option>
                            <option value="7">Julio</option>
                            <option value="8">Agosto</option>
                            <option value="9">Septiembre</option>
                            <option value="10">Octubre</option>
                            <option value="11">Noviembre</option>
                            <option value="12">Diciembre</option>
                        </select>
                    </div>
                    <div style="width:110px">
                        <label style="display:block; font-weight:bold; margin-bottom:6px">Año</label>
                        <select id="modalAnioRecibo" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:6px">
                            <option value="${anioActual}">${anioActual}</option>
                            <option value="${anioActual - 1}">${anioActual - 1}</option>
                            <option value="${anioActual + 1}">${anioActual + 1}</option>
                        </select>
                    </div>
                </div>

                <div style="display:flex; gap:8px; justify-content:flex-end;">
                    <button id="modalCancelarBtn" style="padding:8px 12px; background:#eee; border-radius:6px; border:1px solid #ddd">Cancelar</button>
                    <button id="modalSubirBtn" style="padding:8px 12px; background:linear-gradient(135deg,var(--brand-primary),var(--brand-secondary)); color:var(--primary-contrast); border-radius:6px; border:none">Subir Recibo</button>
                </div>
                <div id="modalProgress" style="margin-top:10px; display:none; font-size:13px"></div>
            </div>
        `;

        document.body.appendChild(overlay);

        const cancelar = document.getElementById('modalCancelarBtn');
        const subir = document.getElementById('modalSubirBtn');
        const progress = document.getElementById('modalProgress');

        cancelar.addEventListener('click', () => overlay.remove());

        subir.addEventListener('click', async () => {
            const fecha = document.getElementById('modalFechaRecibo').value;
            const legajo = document.getElementById('modalLegajoRecibo').value.trim();
            const mes = document.getElementById('modalMesRecibo').value;
            const anio = document.getElementById('modalAnioRecibo').value;

            if (!fecha || !legajo || !mes || !anio) {
                alert('Por favor complete fecha, legajo, mes y año antes de subir.');
                return;
            }

            subir.disabled = true;
            cancelar.disabled = true;
            progress.style.display = 'block';
            progress.textContent = '⏳ Subiendo archivos...';

            try {
                await this.uploadFilesToSheet(files, { fecha, legajo, mes, anio });
                progress.textContent = '✅ Todos los recibos se cargaron correctamente.';
                setTimeout(() => overlay.remove(), 1200);
            } catch (err) {
                console.error('Error subiendo recibos:', err);
                progress.textContent = '❌ Ocurrió un error al subir. Ver consola.';
                cancelar.disabled = false;
            }
        });
    }

    async uploadFilesToSheet(files, meta) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const base64 = await this.readFileAsBase64(file);

            const uploadedAt = new Date().toLocaleString('es-AR');
            const dependencia = (this.selectorDependencia && this.selectorDependencia.value) || (this.usuarioActual && this.usuarioActual.dependencia) || 'N/A';

            const values = [
                meta.fecha,
                meta.legajo,
                `${meta.mes}/${meta.anio}`,
                file.name
            ];

            const payload = {
                values,
                file: {
                    base64: base64.split(',')[1],
                    type: file.type,
                    name: file.name
                }
            };

            let serverResp = null;
            try {
                serverResp = await this.enviarReciboAHoja(payload);
                console.log('Respuesta del servidor al subir recibo:', serverResp);
            } catch (err) {
                console.error('Error enviando recibo a la hoja:', err);
                throw err;
            }

            const serverFileUrl = serverResp && (serverResp.fileUrl || serverResp.url || serverResp.fileUrlDrive || serverResp.fileUrlDrive);
            try {
                const finalUrl = serverFileUrl || URL.createObjectURL(file);
                this.todosLosRecibos.unshift({ name: file.name, url: finalUrl, size: file.size, type: file.type, legajo: meta.legajo, dependencia, uploadedAt: new Date().toISOString() });
                this.guardarRecibosEnStorage();
                this.mostrarRecibosSubidos();
            } catch (e) {
                console.warn('No se pudo crear URL local para el archivo:', e);
            }
        }
    }

    readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('Error leyendo archivo'));
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    }

    async enviarReciboAHoja(payload) {
        const APPS_SCRIPT_URL = `https://script.google.com/macros/s/AKfycbz0dgpx9Ywohz9PTZ4Uvdoo10I8Rrzhht-jQBA69h_bdOiIs_ApMhscFrkVGFv9ZIrs1Q/exec`;
        try {
            const enriched = { ...payload, sheetName: this.HOJA_Recibos, folderId: '1e79jWQOKnFqHegIlXOpDZw1cUfa_ZuBu' };
            const res = await fetch(APPS_SCRIPT_URL, { method: 'POST', body: JSON.stringify(enriched) });
            if (!res.ok) throw new Error(`Apps Script respondió ${res.status}`);
            try {
                const json = await res.json();
                return json;
            } catch (parseErr) {
                console.warn('Respuesta de Apps Script no es JSON:', parseErr);
                return { ok: true };
            }
        } catch (err) {
            console.error('Error enviando recibo a hoja:', err);
            throw err;
        }
    }

    mostrarRecibosSubidos() {

        if (!this.contenedorRecibos) return;

        const uploaded = this.todosLosRecibos.filter(r => r.url);
        const html = [];
        if (uploaded.length === 0) {
            return;
        }

        html.push('<div id="uploadedReceipts" style="margin-bottom:20px">');
        html.push('<h3 style="text-align:center; margin-bottom:10px;">Recibos subidos (sesión)</h3>');
        uploaded.forEach((r, idx) => {
            const sizeKb = r.size ? Math.round(r.size / 1024) + ' KB' : '';
            html.push(`
                <div class="recibo-card" style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
                    <div style="flex:1">
                        <div class="recibo-title">${r.name}</div>
                        <div class="recibo-details" style="margin-top:6px; display:flex; gap:12px; flex-wrap:wrap;">
                            <div class="detail-item"><div class="detail-label">Legajo</div><div class="detail-value">${r.legajo}</div></div>
                            <div class="detail-item"><div class="detail-label">Dependencia</div><div class="detail-value">${r.dependencia}</div></div>
                            <div class="detail-item"><div class="detail-label">Subido</div><div class="detail-value">${new Date(r.uploadedAt).toLocaleString()}</div></div>
                            <div class="detail-item"><div class="detail-label">Tamaño</div><div class="detail-value">${sizeKb}</div></div>
                        </div>
                    </div>
                    <div style="display:flex; gap:8px; align-items:center">
                        <a class="download-btn" href="${r.url}" download="${r.name}">Ver / Descargar</a>
                        <button class="download-btn" style="background:#e74c3c" data-index="${idx}">Eliminar</button>
                    </div>
                </div>
            `);
        });
        html.push('</div>');

        const wrapper = document.createElement('div');
        wrapper.innerHTML = html.join('');
        const old = document.getElementById('uploadedReceipts');
        if (old) old.remove();
        this.contenedorRecibos.prepend(wrapper);
        wrapper.querySelectorAll('button[data-index]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const i = parseInt(btn.getAttribute('data-index'));
                this.eliminarReciboSubido(i);
            });
        });
    }

    eliminarReciboSubido(idx) {
        const uploaded = this.todosLosRecibos.filter(r => r.url);
        const target = uploaded[idx];
        if (!target) return;
        if (target.url) URL.revokeObjectURL(target.url);
        const findIndex = this.todosLosRecibos.findIndex(r => r.name === target.name && r.uploadedAt === target.uploadedAt);
        if (findIndex !== -1) this.todosLosRecibos.splice(findIndex, 1);
        this.mostrarRecibosSubidos();
    }

    cargarRecibosDesdeStorage() {
        this.todosLosRecibos = [];
    }

    async cargarDependenciasRestringidas() {
        try {
            if (this.usuarioActual.role === 'superadmin') {
                await this.cargarTodasLasDependencias();
            } else {
                this.cargarDependenciaUsuario();
            }
        } catch (error) {
            console.error('Error cargando dependencias:', error);
            this.mostrarError('Error al cargar las dependencias');
        }
    }

    async cargarTodasLasDependencias() {
        const opcionTodos = document.createElement('option');
        opcionTodos.value = 'TODOS';
        opcionTodos.textContent = 'Ver Todas las Dependencias';
        this.selectorDependencia.appendChild(opcionTodos);

        const datos = await this.obtenerDatosHoja('E:E');
        const dependencias = [...new Set(datos.values.slice(2).map(fila => fila[0]).filter(dep => dep))];

        dependencias.forEach(dep => {
            const opcion = document.createElement('option');
            opcion.value = dep;
            opcion.textContent = dep;
            this.selectorDependencia.appendChild(opcion);
        });
    }

    cargarDependenciaUsuario() {
        const opcion = document.createElement('option');
        opcion.value = this.usuarioActual.dependencia;
        opcion.textContent = this.usuarioActual.dependencia;
        this.selectorDependencia.appendChild(opcion);
        this.selectorDependencia.value = this.usuarioActual.dependencia;
        this.selectorDependencia.disabled = true;
        this.selectorDependencia.style.backgroundColor = '#f8f9fa';
    }

    cerrarSesion() {
        this.usuarioActual = null;
        this.mostrarLogin();
    }

    async obtenerDatosHoja(rango) {
        const key = String(rango);
        const ahora = Date.now();
        const cacheEntry = this._cache.get(key);
        if (cacheEntry && (ahora - cacheEntry.t) < this._cacheTTL) {
            return cacheEntry.data;
        }

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.ID_HOJA}/values/${rango}?key=${this.CLAVE_API}`;
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 15000);
        let respuesta;
        try {
            respuesta = await fetch(url, { signal: ctrl.signal });
        } finally {
            clearTimeout(timeout);
        }

        if (!respuesta.ok) {
            throw new Error(`Error: ${respuesta.status}`);
        }

        const data = await respuesta.json();
        this._cache.set(key, { t: ahora, data });
        return data;
    }

    async cargarRecibos() {
        const dependenciaSeleccionada = this.selectorDependencia.value;

        if (!dependenciaSeleccionada) {
            alert('Por favor selecciona una dependencia');
            return;
        }

        this.mostrarCarga(true);
        this.contenedorRecibos.innerHTML = '';

        try {
            const datos = await this.obtenerDatosHoja('A:E');

            if (!datos.values || datos.values.length <= 1) {
                this.mostrarError('No se encontraron datos');
                return;
            }

            const encabezados = datos.values[0];
            this.encabezadosRecibos = encabezados;
            const filas = datos.values.slice(2);

            // Si es superadmin y selecciona "TODOS", mostrar todos los recibos
            if (this.usuarioActual.role === 'superadmin' && dependenciaSeleccionada === 'TODOS') {
                this.todosLosRecibos = filas;
            } else {
                this.todosLosRecibos = filas.filter(fila => fila[4] === dependenciaSeleccionada);
            }

            if (this.todosLosRecibos.length === 0) {
                this.mostrarError('No se encontraron recibos para esta dependencia');
                return;
            }

            this.aplicarFiltros();
            this.renderizarRecibos(this.recibosFiltrados, encabezados);

        } catch (error) {
            console.error('Error cargando recibos:', error);
            this.mostrarError('Error al cargar los recibos');
        } finally {
            this.mostrarCarga(false);
        }
    }

    verificarPermisos(dependencia) {
        if (this.usuarioActual.role === 'superadmin') {
            return true;
        }
        return this.usuarioActual.dependencia === dependencia;
    }

    aplicarFiltros() {
        let recibos = [...this.todosLosRecibos];

        const legajoBuscado = this.inputLegajo.value.trim();
        if (legajoBuscado) {
            recibos = recibos.filter(recibo => {
                const legajoRecibo = recibo[1] ? recibo[1].toString() : '';
                return legajoRecibo.toLowerCase().includes(legajoBuscado.toLowerCase());
            });
        }

        this.recibosFiltrados = recibos;
    }

    filtrarPorLegajo() {
        if (this.todosLosRecibos.length === 0) {
            return;
        }

        this.aplicarFiltros();
        this.contenedorRecibos.innerHTML = '';

        if (this.recibosFiltrados.length === 0) {
            this.mostrarError('No se encontraron recibos con ese número de legajo');
        } else {
            const encabezados = ['Legajo', 'Nombre', 'Monto', 'PDF', 'Dependencia'];
            this.renderizarRecibos(this.recibosFiltrados, encabezados);
        }
    }

    limpiarFiltros() {
        this.inputLegajo.value = '';

        if (this.todosLosRecibos.length > 0) {
            this.recibosFiltrados = [...this.todosLosRecibos];
            const encabezados = ['Legajo', 'Nombre', 'Monto', 'PDF', 'Dependencia'];
            this.contenedorRecibos.innerHTML = '';
            this.renderizarRecibos(this.recibosFiltrados, encabezados);
        }
    }

    renderizarRecibos(recibos, encabezados) {
        const frag = document.createDocumentFragment();
        recibos.forEach((recibo, indice) => {
            const tarjetaRecibo = this.crearTarjetaRecibo(recibo, encabezados, indice);
            frag.appendChild(tarjetaRecibo);
        });
        this.contenedorRecibos.appendChild(frag);
    }

    crearTarjetaRecibo(recibo, encabezados, indice) {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'recibo-card';
        tarjeta.style.cssText = `
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            overflow: hidden;
            transition: transform 0.2s;
        `;

        tarjeta.innerHTML = this.obtenerHTMLTarjeta(recibo, encabezados, indice);
        this.configurarHoverTarjeta(tarjeta);

        return tarjeta;
    }

    obtenerHTMLTarjeta(recibo, encabezados, indice) {
        const legajo = recibo[1] || 'N/A';
        return `
            <div class="recibo-header" style="background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 18px; font-weight: bold;">
                    📄 Recibo #${indice + 1} - Legajo: ${legajo}
                </div>
                <button onclick="gestorRecibos.descargarRecibo(${indice})" style="background-color: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 14px;">
                    📥 Descargar PDF
                </button>
            </div>
            <div style="padding: 20px;">
                ${this.obtenerHTMLDetalles(recibo, encabezados)}
            </div>
        `;
    }

    obtenerHTMLDetalles(recibo, encabezados) {
        return encabezados
            .map((encabezado, i) => {
                if (i === 3) return '';
                return `
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                        <div style="font-weight: bold; color: #555; flex: 1;">${encabezado}:</div>
                        <div style="color: var(--text); flex: 2; text-align: right;">${recibo[i] || 'N/A'}</div>
                    </div>
                `;
            })
            .join('');
    }

    configurarHoverTarjeta(tarjeta) {
        tarjeta.onmouseover = () => tarjeta.style.transform = 'translateY(-2px)';
        tarjeta.onmouseout = () => tarjeta.style.transform = 'translateY(0)';
    }

    descargarRecibo(indice) {
        const recibo = this.recibosFiltrados[indice];
        const urlPDF = recibo[3];

        if (!urlPDF) {
            alert('❌ No hay PDF disponible para este recibo');
            return;
        }

        this.descargarPDFDesdeURL(urlPDF, `recibo_${indice + 1}.pdf`);
    }

    descargarPDFDesdeURL(url, nombreArchivo) {
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = nombreArchivo;
        enlace.target = '_blank';

        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
    }

    mostrarCarga(mostrar) {
        this.cargando.style.display = mostrar ? 'block' : 'none';
    }

    mostrarError(mensaje) {
        this.contenedorRecibos.innerHTML = `
            <div style="text-align: center; color: var(--error); font-size: 18px; padding: 40px; background: var(--surface); border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                ❌ ${mensaje}
            </div>
        `;
    }

    //MODULO DE RECATEGORIZACION

    mostrarModuloRecategorizacion() {
        document.body.innerHTML = this.obtenerHTMLRecategorizacion();
        this.inicializarReferenciasDOMRecategorizacion();
        // Cargar categorías disponibles para usar en la lista
        this.cargarCategoriasRecategorizacion().catch(e => console.warn('No se pudieron cargar categorías:', e));
    }

    obtenerHTMLRecategorizacion() {
        return `
            <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
                <div class="header" style="background: var(--surface); padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
                    ${this.obtenerHTMLHeaderRecategorizacion()}
                    ${this.obtenerHTMLControlesRecategorizacion()}
                </div>

                <div id="loadingRecategorizacion" style="display: none; text-align: center; padding: 40px; font-size: 18px; color: #4a4f4eff;">
                    ⏳ Cargando recategorización...
                </div>

                <div id="recategorizacionContainer"></div>
            </div>
        `;
    }

    obtenerHTMLHeaderRecategorizacion() {
        return this.getUserHeaderHTML('🔄 Sistema de Recategorización');
    }

    obtenerHTMLControlesRecategorizacion() {
        return `
            <div class="controls" style="display: flex; gap: 12px; align-items: center; justify-content: center; flex-wrap: wrap; margin-bottom: 12px;">
                <input type="text" id="legajoInputRecategorizacion" placeholder="Ingresar legajo..." 
                    style="padding: 10px; border: 2px solid var(--border); border-radius: 5px; font-size: 16px; min-width: 180px;">
                <button id="buscarBtnRecategorizacion" 
                    style="padding: 10px 16px; background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); border: none; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold;">
                    🔍 Buscar
                </button>
                <button id="agregarBtnRecategorizacion" title="Agregar legajo a la lista" 
                    style="padding: 10px 12px; background: #6c757d; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;">
                    ➕ Agregar a Lista
                </button>
                <button id="limpiarListaRecategorizacion" title="Limpiar lista de legajos" 
                    style="padding: 10px 12px; background: #adb5bd; color: #222; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;">
                    🗑️ Limpiar Lista
                </button>
                <button onclick="gestorRecibos.mostrarMenuPrincipal()" style="padding: 8px 15px; background: var(--neutral); color: var(--primary-contrast); border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                    ⬅️ Volver al Menú Principal
                </button>
                <div style="width:100%; display:flex; justify-content:center; margin-top:8px;">
                    <button id="enviarListaRecategorizacionBtn" style="padding: 10px 18px; background: #007bff; color: white; border: none; border-radius: 6px; font-size: 15px; cursor: pointer; font-weight:bold; display:none;">
                        📤 Enviar Lista de Recategorizaciones
                    </button>
                </div>
            </div>
        `;
    }

    inicializarReferenciasDOMRecategorizacion() {
        this.cargando = document.getElementById('loadingRecategorizacion');
        this.contenedorRecibos = document.getElementById('recategorizacionContainer');
        this.inputLegajoRecategorizacion = document.getElementById('legajoInputRecategorizacion');
        this.botonBuscarRecategorizacion = document.getElementById('buscarBtnRecategorizacion');
        this.botonAgregarRecategorizacion = document.getElementById('agregarBtnRecategorizacion');
        this.botonLimpiarListaRecategorizacion = document.getElementById('limpiarListaRecategorizacion');
        this.botonEnviarListaRecategorizacion = document.getElementById('enviarListaRecategorizacionBtn');

        if (this.botonBuscarRecategorizacion) {
            this.botonBuscarRecategorizacion.addEventListener('click', () => this.buscarLegajoRecategorizacion());
        }
        if (this.inputLegajoRecategorizacion) {
            this.inputLegajoRecategorizacion.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.buscarLegajoRecategorizacion();
                }
            });
        }
        if (this.botonAgregarRecategorizacion) this.botonAgregarRecategorizacion.addEventListener('click', () => this.agregarAListaRecategorizacion());
        if (this.botonLimpiarListaRecategorizacion) this.botonLimpiarListaRecategorizacion.addEventListener('click', () => { this.recategorizacionLista = []; this.actualizarRenderListaRecategorizacion(); });
        if (this.botonEnviarListaRecategorizacion) this.botonEnviarListaRecategorizacion.addEventListener('click', () => this.enviarListaRecategorizacion());
    }

    async buscarLegajoRecategorizacion() {
        const legajo = (this.inputLegajoRecategorizacion?.value || '').trim();
        if (!legajo) {
            alert('Por favor ingrese un número de legajo');
            this.inputLegajoRecategorizacion?.focus();
            return;
        }
        if (!/^\d+$/.test(legajo)) {
            alert('El legajo debe ser numérico');
            this.inputLegajoRecategorizacion?.focus();
            return;
        }

        if (this.cargando) this.cargando.style.display = 'block';
        if (this.contenedorRecibos) this.contenedorRecibos.innerHTML = '';

        try {
            const datos = await this.obtenerDatosHoja(`${this.HOJA_PersonalActivo}!A:D`);
            const filas = datos?.values?.slice(1) || [];
            const dependenciaUsuario = this.usuarioActual?.dependencia || '';
            const isSuperAdmin = this.usuarioActual?.role === 'superadmin';

            const coincidencia = filas.find(fila => {
                const legajoFila = String(fila[0] || '').trim(); // Col A
                const dependenciaFila = String(fila[3] || '').trim(); // Col D
                return legajoFila === legajo && (isSuperAdmin || dependenciaFila === dependenciaUsuario);
            });

            if (!coincidencia) {
                this.contenedorRecibos.innerHTML = `
                    <div style="text-align: center; color: var(--error); font-size: 16px; padding: 24px; background: var(--surface); border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
                        ❌ No se encontró un registro para el legajo ${legajo}${isSuperAdmin ? '' : ' en su dependencia'}.
                    </div>
                `;
                return;
            }

            const [colA, colB, colC] = [coincidencia[0] || 'N/A', coincidencia[1] || 'N/A', coincidencia[2] || 'N/A'];
            const dependenciaEncontrada = coincidencia[3] || 'N/A';

            // Obtener categorías desde HOJA_Escalafon (columna A)
            let opcionesCategorias = '<option value="">Seleccione una categoría</option>';
            try {
                // Reusar categorías cargadas previamente si existen
                let categorias = this.categoriasDisponibles && this.categoriasDisponibles.length ? this.categoriasDisponibles : [];
                if (!categorias || categorias.length === 0) {
                    const datosEsc = await this.obtenerDatosHoja(`${this.HOJA_Escalafon}!A:A`);
                    categorias = [...new Set((datosEsc?.values || []).slice(1).map(f => f[0]).filter(Boolean))];
                    this.categoriasDisponibles = categorias;
                }
                if (categorias.length > 0) {
                    opcionesCategorias += categorias.map(c => `<option value="${c}">${c}</option>`).join('');
                }
            } catch (e) {
                console.warn('No se pudieron cargar las categorías de Escalafon:', e);
            }

            // Guardar datos para el envío posterior
            this.recategorizacionDatos = { legajo: colA, nombre: colB, categoriaActual: colC };

            this.contenedorRecibos.innerHTML = `
                <div class="recategorizacion-card" style="background: var(--surface); border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
                    <div style="background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); padding: 14px 18px; font-weight: bold; display:flex; justify-content:space-between; align-items:center;">
                        <span>🔎 Resultado de Búsqueda</span>
                        <span>Legajo: ${colA}</span>
                    </div>
                    <div style="padding: 16px;">
                        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f0f0f0;">
                            <div style="font-weight:bold; color:#555;">Nombre Completo:</div>
                            <div style="color: var(--text);">${colB}</div>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding:8px 0;">
                            <div style="font-weight:bold; color:#555;">Categoria Actual:</div>
                            <div style="color: var(--text);">${colC}</div>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; padding:8px 0;">
                            <div style="font-weight:bold; color:#555;">Categoria Solicitada:</div>
                            <div style="flex:1; text-align:right;">
                                <select id="categoriaSolicitadaSelect" style="min-width:220px; padding:8px 10px; border:2px solid var(--border); border-radius:6px; font-size:14px;">
                                    ${opcionesCategorias}
                                </select>
                            </div>
                        </div>
                        <div style="text-align:right; margin-top:12px;">
                            <button id="solicitarRecategorizacionBtn" onclick="gestorRecibos.solicitarRecategorizacion()" 
                                style="padding: 10px 16px; background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); border: none; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold;">
                                📝 Solicitar Recategorización
                            </button>
                        </div>
                        <div id="mensajeRecategorizacion" style="display:none; margin-top:12px; padding:12px; border-radius:8px; font-weight:bold; text-align:center;"></div>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Error buscando legajo en Personal Activo:', error);
            this.contenedorRecibos.innerHTML = `
                <div style="text-align: center; color: var(--error); font-size: 16px; padding: 24px; background: var(--surface); border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
                    ❌ Ocurrió un error al buscar el legajo. Intente nuevamente.
                </div>
            `;
        } finally {
            if (this.cargando) this.cargando.style.display = 'none';
        }
    }

    // Carga categorías desde la hoja de escalafón para usarlas en selects por ítem
    async cargarCategoriasRecategorizacion() {
        try {
            const datosEsc = await this.obtenerDatosHoja(`${this.HOJA_Escalafon}!A:A`);
            const categorias = [...new Set((datosEsc?.values || []).slice(1).map(f => f[0]).filter(Boolean))];
            this.categoriasDisponibles = categorias;
        } catch (e) {
            console.warn('Error cargando categorias de escalafon:', e);
            this.categoriasDisponibles = [];
        }
    }

    async solicitarRecategorizacion() {
        const btn = document.getElementById('solicitarRecategorizacionBtn');
        const select = document.getElementById('categoriaSolicitadaSelect');
        const msg = document.getElementById('mensajeRecategorizacion');

        if (!this.recategorizacionDatos) return;
        if (!select || !select.value) {
            alert('Seleccione una categoría solicitada.');
            select?.focus();
            return;
        }

        const { legajo, nombre, categoriaActual } = this.recategorizacionDatos;
        const categoriaSolicitada = select.value;

        // Deshabilitar botón mientras envía
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⏳ Enviando solicitud...';
            btn.style.opacity = '0.8';
        }

        try {
            // Si hay lista activa y contiene elementos, se envía la lista en lote
            if (this.recategorizacionLista && this.recategorizacionLista.length > 0) {
                // Enviar cada elemento con la categoria seleccionada (o si cada elemento ya tiene categoriaSolicitada individual, usarla)
                const payloads = this.recategorizacionLista.map(item => [item.legajo, item.nombre, item.categoriaActual, categoriaSolicitada]);
                // Enviar los payloads uno por uno para mantener compatibilidad con Apps Script actual
                for (const p of payloads) {
                    await this.enviarRecategorizacionAHoja(p);
                }
            } else {
                await this.enviarRecategorizacionAHoja([legajo, nombre, categoriaActual, categoriaSolicitada]);
            }
            if (msg) {
                msg.style.display = 'block';
                msg.style.backgroundColor = '#d4edda';
                msg.style.color = '#155724';
                msg.style.border = '1px solid #c3e6cb';
                msg.innerHTML = '✅ Solicitud enviada correctamente';
            }
        } catch (error) {
            console.error('Error enviando recategorización:', error);
            if (msg) {
                msg.style.display = 'block';
                msg.style.backgroundColor = '#f8d7da';
                msg.style.color = '#721c24';
                msg.style.border = '1px solid #f5c6cb';
                msg.innerHTML = '❌ No se pudo enviar la solicitud. Intente nuevamente.';
            }
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = '📝 Solicitar Recategorización';
                btn.style.opacity = '1';
            }
            // Si se envió una lista, limpiarla
            if (this.recategorizacionLista && this.recategorizacionLista.length > 0) {
                this.recategorizacionLista = [];
                this.actualizarRenderListaRecategorizacion();
            }
        }
    }

    // Agrega el legajo actual (o uno ingresado) a la lista de recategorizacion
    agregarAListaRecategorizacion() {
        const legajo = (this.inputLegajoRecategorizacion?.value || '').trim();
        if (!legajo) {
            alert('Ingrese un legajo antes de agregar a la lista');
            this.inputLegajoRecategorizacion?.focus();
            return;
        }
        if (!/^\d+$/.test(legajo)) {
            alert('El legajo debe ser numérico');
            this.inputLegajoRecategorizacion?.focus();
            return;
        }

        // Buscar datos en Personal Activo para completar nombre y categoria actual
        this.obtenerDatosHoja(`${this.HOJA_PersonalActivo}!A:D`).then(datos => {
            const filas = datos?.values?.slice(1) || [];
            const fila = filas.find(f => String(f[0] || '').trim() === legajo);
            const isSuperAdmin = this.usuarioActual?.role === 'superadmin';

            if (fila) {
                const dependenciaFila = String(fila[3] || '').trim();
                const dependenciaUsuario = (this.usuarioActual?.dependencia || '').toString().trim();
                if (!isSuperAdmin && dependenciaFila.toLowerCase() !== dependenciaUsuario.toLowerCase()) {
                    alert(`No puede agregar legajos de otra dependencia (legajo ${legajo} pertenece a ${dependenciaFila}).`);
                    return;
                }
            } else {
                if (!isSuperAdmin) {
                    alert('No se encontró el legajo en Personal Activo o pertenece a otra dependencia. Solo superadmin puede agregar legajos externos.');
                    return;
                }
            }

            const leg = fila ? (fila[0] || legajo) : legajo;
            const nom = fila ? (fila[1] || 'N/A') : 'N/A';
            const cat = fila ? (fila[2] || 'N/A') : 'N/A';

            if (this.recategorizacionLista.some(r => r.legajo === leg)) {
                alert('El legajo ya está en la lista');
                return;
            }

            this.recategorizacionLista.push({ legajo: leg, nombre: nom, categoriaActual: cat });
            this.actualizarRenderListaRecategorizacion();
            this.inputLegajoRecategorizacion.value = '';
            this.inputLegajoRecategorizacion.focus();
        }).catch(err => {
            console.error('Error obteniendo datos para agregar a lista:', err);
            const isSuperAdmin = this.usuarioActual?.role === 'superadmin';
            if (!isSuperAdmin) {
                alert('No se pudieron verificar los datos del legajo. Solo superadmin puede agregar legajos sin verificación.');
                return;
            }
            if (!this.recategorizacionLista.some(r => r.legajo === legajo)) {
                this.recategorizacionLista.push({ legajo: legajo, nombre: 'N/A', categoriaActual: 'N/A' });
                this.actualizarRenderListaRecategorizacion();
            }
        });
    }

    removerDeListaRecategorizacion(index) {
        if (index >= 0 && index < this.recategorizacionLista.length) {
            this.recategorizacionLista.splice(index, 1);
            this.actualizarRenderListaRecategorizacion();
        }
    }

    actualizarRenderListaRecategorizacion() {
        const container = document.getElementById('recategorizacionContainer');
        const enviarBtn = document.getElementById('enviarListaRecategorizacionBtn');
        if (!container) return;
        if (!this.recategorizacionLista || this.recategorizacionLista.length === 0) {
            container.innerHTML = '';
            if (enviarBtn) enviarBtn.style.display = 'none';
            return;
        }

        if (enviarBtn) enviarBtn.style.display = 'inline-block';

        // Construir opciones de select desde categoriasDisponibles
        const opciones = ['<option value="">(Sin seleccionar)</option>']
            .concat((this.categoriasDisponibles || []).map(c => `<option value="${c}">${c}</option>`)).join('');

        const html = this.recategorizacionLista.map((r, idx) => {
            const selectedValue = r.categoriaSolicitada ? r.categoriaSolicitada : '';
            return `
                <div style="background: var(--surface); padding:10px; border-radius:8px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 6px rgba(0,0,0,0.06);">
                    <div style="flex:1;">
                        <div style="font-weight:bold;">${r.nombre} (Legajo: ${r.legajo})</div>
                        <div style="color: #666; font-size:13px;">Categoria Actual: ${r.categoriaActual}</div>
                    </div>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <select id="categoria_item_${idx}" onchange="(function(i){ return function(e){ gestorRecibos.recategorizacionLista[i].categoriaSolicitada = e.target.value } } )(${idx}).call(null,event)" style="padding:6px 8px; border-radius:6px; border:1px solid #ccc; min-width:200px;">
                            ${opciones.replace(/value="${selectedValue}"/, `value="${selectedValue}" selected`)}
                        </select>
                        <button onclick="gestorRecibos.removerDeListaRecategorizacion(${idx})" style="padding:6px 10px; border-radius:6px; background:#e74c3c; color:white; border:none; cursor:pointer;">Eliminar</button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div style="margin-top:12px;">
                <h3 style="text-align:center;">Lista de Recategorizaciones (${this.recategorizacionLista.length})</h3>
                ${html}
                <div style="text-align:center; margin-top:8px; font-size:13px; color:#555;">Antes de enviar, seleccione la categoría solicitada en cualquier tarjeta individual o use el botón de enviar para aplicar la misma categoría a todos.</div>
            </div>
        `;
    }

    // Enviar la lista completa a la hoja de recategorizacion
    async enviarListaRecategorizacion() {
        if (!this.recategorizacionLista || this.recategorizacionLista.length === 0) {
            alert('La lista está vacía');
            return;
        }

        // Verificar si todos los ítems tienen categoriaSolicitada
        const sinCategoria = this.recategorizacionLista.filter(r => !r.categoriaSolicitada || r.categoriaSolicitada.trim() === '');
        let categoriaComun = null;
        if (sinCategoria.length > 0) {
            categoriaComun = prompt(`Hay ${sinCategoria.length} legajos sin categoría solicitada. Ingrese una categoría común para esos legajos, o cancele para abortar:`);
            if (!categoriaComun) {
                alert('Envio cancelado. Complete las categorías o ingrese una categoría común.');
                return;
            }
        }

        const btn = document.getElementById('enviarListaRecategorizacionBtn');
        if (btn) { btn.disabled = true; btn.textContent = '⏳ Enviando...'; }

        try {
            for (const item of this.recategorizacionLista) {
                const cat = (item.categoriaSolicitada && item.categoriaSolicitada.trim()) ? item.categoriaSolicitada : categoriaComun;
                await this.enviarRecategorizacionAHoja([item.legajo, item.nombre, item.categoriaActual, cat]);
            }
            alert('Lista enviada correctamente');
            this.recategorizacionLista = [];
            this.actualizarRenderListaRecategorizacion();
        } catch (err) {
            console.error('Error enviando lista:', err);
            alert('Ocurrió un error al enviar la lista. Revise la consola.');
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = '📤 Enviar Lista de Recategorizaciones'; }
        }
    }

    async enviarRecategorizacionAHoja(values) {
        const APPS_SCRIPT_URL = `https://script.google.com/macros/s/AKfycbz0dgpx9Ywohz9PTZ4Uvdoo10I8Rrzhht-jQBA69h_bdOiIs_ApMhscFrkVGFv9ZIrs1Q/exec`;
        const payload = {
            values,
            sheetName: this.HOJA_RECATEGORIZACION,
            insertAtTop: true
        };
        const res = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            throw new Error(`Apps Script respondió ${res.status}`);
        }
        return true;
    }

    // MÓDULO DE VACACIONES
    mostrarModuloVacaciones() {
        document.body.innerHTML = this.obtenerHTMLVacaciones();
        this.inicializarReferenciasDOMVacaciones();
        this.configurarEventosVacaciones();
        this.cargarDependenciasVacaciones();
    }

    obtenerHTMLVacaciones() {
        return `
            <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
                <div class="header" style="background: var(--surface); padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
                    ${this.obtenerHTMLHeaderVacaciones()}
                    ${this.obtenerHTMLControlesVacaciones()}
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="gestorRecibos.mostrarMenuPrincipal()" style="padding: 8px 15px; background: var(--neutral); color: var(--primary-contrast); border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                            ⬅️ Volver al Menú Principal
                        </button>
                    </div>
                </div>
                
                <div id="loadingVacaciones" style="display: none; text-align: center; padding: 40px; font-size: 18px; color: #28a745;">
                    ⏳ Cargando vacaciones...
                </div>
                
                <div id="vacacionesContainer"></div>
            </div>
        `;
    }

    obtenerHTMLHeaderVacaciones() {
        return this.getUserHeaderHTML('🏖️ Sistema de Gestión de Vacaciones');
    }

    obtenerHTMLControlesVacaciones() {
        return `
            <div class="controls" style="display: flex; gap: 15px; align-items: center; justify-content: center; flex-wrap: wrap;">
                <select id="dependenciaSelectVacaciones" style="padding: 10px; border: 2px solid var(--border); border-radius: 5px; font-size: 16px; min-width: 200px;">
                    <option value="">Selecciona una dependencia</option>
                </select>
                
                <input type="text" id="legajoInputVacaciones" placeholder="Filtrar por legajo..." style="padding: 10px; border: 2px solid var(--border); border-radius: 5px; font-size: 16px; min-width: 150px;">
                
                <button id="loadBtnVacaciones" style="padding: 10px 20px; background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); border: none; border-radius: 5px; font-size: 16px; cursor: pointer; font-weight: bold;">
                    🏖️ Cargar Vacaciones
                </button>

                <button id="exportBtnVacaciones" style="padding: 10px 16px; background: #0b74de; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;">
                    📥 Exportar Excel
                </button>
                
                <button id="clearBtnVacaciones" style="padding: 10px 15px; background: var(--neutral); color: var(--primary-contrast); border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
                    🗑️ Limpiar
                </button>
            </div>
        `;
    }

    inicializarReferenciasDOMVacaciones() {
        this.selectorDependenciaVacaciones = document.getElementById('dependenciaSelectVacaciones');
        this.botonCargarVacaciones = document.getElementById('loadBtnVacaciones');
        this.cargandoVacaciones = document.getElementById('loadingVacaciones');
        this.contenedorVacaciones = document.getElementById('vacacionesContainer');
        this.inputLegajoVacaciones = document.getElementById('legajoInputVacaciones');
    }

    configurarEventosVacaciones() {
        this.botonCargarVacaciones.addEventListener('click', () => this.cargarVacaciones());
        this.inputLegajoVacaciones.addEventListener('input', this.debounce(() => this.filtrarPorLegajoVacaciones(), 200));
        document.getElementById('clearBtnVacaciones').addEventListener('click', () => this.limpiarFiltrosVacaciones());
        const expVac = document.getElementById('exportBtnVacaciones');
        if (expVac) expVac.addEventListener('click', () => this.exportarVacacionesExcel());
    }

    async cargarDependenciasVacaciones() {
        try {
            if (this.usuarioActual.role === 'superadmin') {
                await this.cargarTodasLasDependenciasVacaciones();
            } else {
                this.cargarDependenciaUsuarioVacaciones();
            }
        } catch (error) {
            console.error('Error cargando dependencias:', error);
            this.mostrarErrorVacaciones('Error al cargar las dependencias');
        }
    }

    async cargarTodasLasDependenciasVacaciones() {
        const opcionTodos = document.createElement('option');
        opcionTodos.value = 'TODOS';
        opcionTodos.textContent = 'Ver Todas las Dependencias';
        this.selectorDependenciaVacaciones.appendChild(opcionTodos);

        const datos = await this.obtenerDatosHoja(`${this.HOJA_VACACIONES}!C:C`);
        const dependencias = [...new Set(datos.values?.slice(1).map(fila => fila[0]).filter(dep => dep) || [])];

        dependencias.forEach(dep => {
            const opcion = document.createElement('option');
            opcion.value = dep;
            opcion.textContent = dep;
            this.selectorDependenciaVacaciones.appendChild(opcion);
        });
    }

    cargarDependenciaUsuarioVacaciones() {
        const opcion = document.createElement('option');
        opcion.value = this.usuarioActual.dependencia;
        opcion.textContent = this.usuarioActual.dependencia;
        this.selectorDependenciaVacaciones.appendChild(opcion);
        this.selectorDependenciaVacaciones.value = this.usuarioActual.dependencia;
        this.selectorDependenciaVacaciones.disabled = true;
        this.selectorDependenciaVacaciones.style.backgroundColor = '#f8f9fa';
    }

    async cargarVacaciones() {
        const dependenciaSeleccionada = this.selectorDependenciaVacaciones.value;

        if (!dependenciaSeleccionada) {
            alert('Por favor selecciona una dependencia');
            return;
        }

        this.mostrarCargaVacaciones(true);
        this.contenedorVacaciones.innerHTML = '';

        try {
            const datos = await this.obtenerDatosHoja(`${this.HOJA_VACACIONES}!A:F`);

            if (!datos.values || datos.values.length <= 1) {
                this.mostrarErrorVacaciones('No se encontraron datos de vacaciones');
                return;
            }

            const encabezados = datos.values[0];
            this.encabezadosVacaciones = encabezados;
            const filas = datos.values.slice(1);

            if (this.usuarioActual.role === 'superadmin' && dependenciaSeleccionada === 'TODOS') {
                this.todasLasVacaciones = filas;
            } else {
                this.todasLasVacaciones = filas.filter(fila => fila[2] === dependenciaSeleccionada);
            }

            if (this.todasLasVacaciones.length === 0) {
                this.mostrarErrorVacaciones('No se encontraron vacaciones para esta dependencia');
                return;
            }

            this.aplicarFiltrosVacaciones();
            this.renderizarVacaciones(this.vacacionesFiltradas, this.encabezadosVacaciones);

        } catch (error) {
            console.error('Error cargando vacaciones:', error);
            this.mostrarErrorVacaciones('Error al cargar las vacaciones');
        } finally {
            this.mostrarCargaVacaciones(false);
        }
    }

    aplicarFiltrosVacaciones() {
        let vacaciones = [...this.todasLasVacaciones];

        const legajoBuscado = this.inputLegajoVacaciones.value.trim();
        if (legajoBuscado) {
            vacaciones = vacaciones.filter(vacacion => {
                const legajoVacacion = vacacion[0] ? vacacion[0].toString() : '';
                return legajoVacacion.toLowerCase().includes(legajoBuscado.toLowerCase());
            });
        }

        this.vacacionesFiltradas = vacaciones;
    }

    filtrarPorLegajoVacaciones() {
        if (!this.todasLasVacaciones || this.todasLasVacaciones.length === 0) {
            return;
        }

        this.aplicarFiltrosVacaciones();
        this.contenedorVacaciones.innerHTML = '';

        if (this.vacacionesFiltradas.length === 0) {
            this.mostrarErrorVacaciones('No se encontraron vacaciones con ese número de legajo');
        } else {
            const encabezados = this.encabezadosVacaciones || ['Legajo', 'Nombre'];
            this.renderizarVacaciones(this.vacacionesFiltradas, encabezados);
        }
    }

    limpiarFiltrosVacaciones() {
        this.inputLegajoVacaciones.value = '';

        if (this.todasLasVacaciones && this.todasLasVacaciones.length > 0) {
            this.vacacionesFiltradas = [...this.todasLasVacaciones];
            const encabezados = this.encabezadosVacaciones || ['Legajo', 'Nombre'];
            this.contenedorVacaciones.innerHTML = '';
            this.renderizarVacaciones(this.vacacionesFiltradas, encabezados);
        }
    }

    renderizarVacaciones(vacaciones, encabezados) {
        const frag = document.createDocumentFragment();
        vacaciones.forEach((vacacion, indice) => {
            const tarjetaVacacion = this.crearTarjetaVacacion(vacacion, encabezados, indice);
            frag.appendChild(tarjetaVacacion);
        });
        this.contenedorVacaciones.appendChild(frag);
    }

    crearTarjetaVacacion(vacacion, encabezados, indice) {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'vacacion-card';
        tarjeta.style.cssText = `
            background: var(--surface);
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            overflow: hidden;
            transition: transform 0.2s;
        `;

        tarjeta.innerHTML = this.obtenerHTMLTarjetaVacacion(vacacion, encabezados, indice);
        this.configurarHoverTarjeta(tarjeta);

        return tarjeta;
    }

    obtenerHTMLTarjetaVacacion(vacacion, encabezados, indice) {
        const legajo = vacacion[0] || 'N/A';
        const nombre = vacacion[1] || 'N/A';
        return `
            <div class="vacacion-header" style="background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 18px; font-weight: bold;">
                    🏖️ Vacación #${indice + 1} - ${nombre} (Legajo: ${legajo})
                </div>
            </div>
            <div style="padding: 20px;">
                ${this.obtenerHTMLDetallesVacacion(vacacion, encabezados)}
            </div>
        `;
    }

    obtenerHTMLDetallesVacacion(vacacion, encabezados) {
        return encabezados
            .map((encabezado, i) => {
                return `
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                        <div style="font-weight: bold; color: #555; flex: 1;">${encabezado}:</div>
                        <div style="color: var(--text); flex: 2; text-align: right;">${vacacion[i] || 'N/A'}</div>
                    </div>
                `;
            })
            .join('');
    }

    mostrarCargaVacaciones(mostrar) {
        this.cargandoVacaciones.style.display = mostrar ? 'block' : 'none';
    }

    mostrarErrorVacaciones(mensaje) {
        this.contenedorVacaciones.innerHTML = `
            <div style="text-align: center; color: var(--error); font-size: 18px; padding: 40px; background: var(--surface); border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                ❌ ${mensaje}
            </div>
        `;
    }

    // MÓDULO DE BAJAS SIN CUBRIR
    mostrarModuloBajas() {
        document.body.innerHTML = this.obtenerHTMLBajas();
        this.inicializarReferenciasDOMBajas();
        this.configurarEventosBajas();
        this.cargarDependenciasBajas();
    }

    obtenerHTMLBajas() {
        return `
            <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
                <div class="header" style="background: var(--surface); padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
                    ${this.obtenerHTMLHeaderBajas()}
                    ${this.obtenerHTMLControlesBajas()}
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="gestorRecibos.mostrarMenuPrincipal()" style="padding: 8px 15px; background: var(--neutral); color: var(--primary-contrast); border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                            ⬅️ Volver al Menú Principal
                        </button>
                    </div>
                </div>
                
                <div id="loadingBajas" style="display: none; text-align: center; padding: 40px; font-size: 18px; color: #dc3545;">
                    ⏳ Cargando bajas sin cubrir...
                </div>
                
                <div id="bajasContainer"></div>
            </div>
        `;
    }

    obtenerHTMLHeaderBajas() {
        return this.getUserHeaderHTML('⚠️ Sistema de Gestión de Bajas Sin Cubrir');
    }

    obtenerHTMLControlesBajas() {
        return `
            <div class="controls" style="display: flex; gap: 15px; align-items: center; justify-content: center; flex-wrap: wrap;">
                <select id="dependenciaSelectBajas" style="padding: 10px; border: 2px solid var(--border); border-radius: 5px; font-size: 16px; min-width: 200px;">
                    <option value="">Selecciona una dependencia</option>
                </select>
                
                <input type="text" id="legajoInputBajas" placeholder="Filtrar por legajo..." style="padding: 10px; border: 2px solid var(--border); border-radius: 5px; font-size: 16px; min-width: 150px;">
                
                <button id="loadBtnBajas" style="padding: 10px 20px; background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); border: none; border-radius: 5px; font-size: 16px; cursor: pointer; font-weight: bold;">
                    ⚠️ Cargar Bajas
                </button>

                <button id="exportBtnBajas" style="padding: 10px 16px; background: #0b74de; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;">
                    📥 Exportar Excel
                </button>
                
                <button id="clearBtnBajas" style="padding: 10px 15px; background: var(--neutral); color: var(--primary-contrast); border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
                    🗑️ Limpiar
                </button>
            </div>
        `;
    }

    inicializarReferenciasDOMBajas() {
        this.selectorDependenciaBajas = document.getElementById('dependenciaSelectBajas');
        this.botonCargarBajas = document.getElementById('loadBtnBajas');
        this.cargandoBajas = document.getElementById('loadingBajas');
        this.contenedorBajas = document.getElementById('bajasContainer');
        this.inputLegajoBajas = document.getElementById('legajoInputBajas');
    }

    configurarEventosBajas() {
        this.botonCargarBajas.addEventListener('click', () => this.cargarBajas());
        this.inputLegajoBajas.addEventListener('input', this.debounce(() => this.filtrarPorLegajoBajas(), 200));
        document.getElementById('clearBtnBajas').addEventListener('click', () => this.limpiarFiltrosBajas());
        const expBajas = document.getElementById('exportBtnBajas');
        if (expBajas) expBajas.addEventListener('click', () => this.exportarBajasExcel());
    }

    async cargarDependenciasBajas() {
        try {
            if (this.usuarioActual.role === 'superadmin') {
                await this.cargarTodasLasDependenciasBajas();
            } else {
                this.cargarDependenciaUsuarioBajas();
            }
        } catch (error) {
            console.error('Error cargando dependencias:', error);
            this.mostrarErrorBajas('Error al cargar las dependencias');
        }
    }

    async cargarTodasLasDependenciasBajas() {
        // Agregar opción para ver todos los datos
        const opcionTodos = document.createElement('option');
        opcionTodos.value = 'TODOS';
        opcionTodos.textContent = 'Ver Todas las Dependencias';
        this.selectorDependenciaBajas.appendChild(opcionTodos);

        const datos = await this.obtenerDatosHoja(`${this.HOJA_BAJAS}!F:F`);
        const dependencias = [...new Set(datos.values?.slice(1).map(fila => fila[0]).filter(dep => dep) || [])];

        dependencias.forEach(dep => {
            const opcion = document.createElement('option');
            opcion.value = dep;
            opcion.textContent = dep;
            this.selectorDependenciaBajas.appendChild(opcion);
        });
    }

    cargarDependenciaUsuarioBajas() {
        const opcion = document.createElement('option');
        opcion.value = this.usuarioActual.dependencia;
        opcion.textContent = this.usuarioActual.dependencia;
        this.selectorDependenciaBajas.appendChild(opcion);
        this.selectorDependenciaBajas.value = this.usuarioActual.dependencia;
        this.selectorDependenciaBajas.disabled = true;
        this.selectorDependenciaBajas.style.backgroundColor = '#f8f9fa';
    }

    async cargarBajas() {
        const dependenciaSeleccionada = this.selectorDependenciaBajas.value;

        if (!dependenciaSeleccionada) {
            alert('Por favor selecciona una dependencia');
            return;
        }

        this.mostrarCargaBajas(true);
        this.contenedorBajas.innerHTML = '';

        try {
            const datos = await this.obtenerDatosHoja(`${this.HOJA_BAJAS}!A:H`);

            if (!datos.values || datos.values.length <= 1) {
                this.mostrarErrorBajas('No se encontraron datos de bajas sin cubrir');
                return;
            }

            const encabezados = datos.values[0];
            this.encabezadosBajas = encabezados;
            const filas = datos.values.slice(1);

            if (this.usuarioActual.role === 'superadmin' && dependenciaSeleccionada === 'TODOS') {
                this.todasLasBajas = filas;
            } else {
                this.todasLasBajas = filas.filter(fila => fila[5] === dependenciaSeleccionada);
            }

            if (this.todasLasBajas.length === 0) {
                this.mostrarErrorBajas('No se encontraron bajas sin cubrir para esta dependencia');
                return;
            }

            this.aplicarFiltrosBajas();
            this.renderizarBajas(this.bajasFiltradas, encabezados);

        } catch (error) {
            console.error('Error cargando bajas:', error);
            this.mostrarErrorBajas('Error al cargar las bajas sin cubrir');
        } finally {
            this.mostrarCargaBajas(false);
        }
    }

    aplicarFiltrosBajas() {
        let bajas = [...this.todasLasBajas];

        const legajoBuscado = this.inputLegajoBajas.value.trim();
        if (legajoBuscado) {
            bajas = bajas.filter(baja => {
                const legajoBaja = baja[0] ? baja[0].toString() : '';
                return legajoBaja.toLowerCase().includes(legajoBuscado.toLowerCase());
            });
        }

        this.bajasFiltradas = bajas;
    }

    filtrarPorLegajoBajas() {
        if (!this.todasLasBajas || this.todasLasBajas.length === 0) {
            return;
        }

        this.aplicarFiltrosBajas();
        this.contenedorBajas.innerHTML = '';

        if (this.bajasFiltradas.length === 0) {
            this.mostrarErrorBajas('No se encontraron bajas sin cubrir con ese número de legajo');
        } else {
            const encabezados = ['Legajo', 'Nombre', 'Fecha Inicio', 'Fecha Fin', 'Dependencia'];
            this.renderizarBajas(this.bajasFiltradas, encabezados);
        }
    }

    limpiarFiltrosBajas() {
        this.inputLegajoBajas.value = '';

        if (this.todasLasBajas && this.todasLasBajas.length > 0) {
            this.bajasFiltradas = [...this.todasLasBajas];
            const encabezados = ['Legajo', 'Nombre', 'Fecha Inicio', 'Fecha Fin', 'Dependencia'];
            this.contenedorBajas.innerHTML = '';
            this.renderizarBajas(this.bajasFiltradas, encabezados);
        }
    }

    renderizarBajas(bajas, encabezados) {
        const frag = document.createDocumentFragment();
        bajas.forEach((baja, indice) => {
            const tarjetaBaja = this.crearTarjetaBaja(baja, encabezados, indice);
            frag.appendChild(tarjetaBaja);
        });
        this.contenedorBajas.appendChild(frag);
    }

    crearTarjetaBaja(baja, encabezados, indice) {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'baja-card';
        tarjeta.style.cssText = `
            background: var(--surface);
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            overflow: hidden;
            transition: transform 0.2s;
        `;

        tarjeta.innerHTML = this.obtenerHTMLTarjetaBaja(baja, encabezados, indice);
        this.configurarHoverTarjeta(tarjeta);

        return tarjeta;
    }

    obtenerHTMLTarjetaBaja(baja, encabezados, indice) {
        const legajo = baja[0] || 'N/A';
        const nombre = baja[1] || 'N/A';
        return `
            <div class="baja-header" style="background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 18px; font-weight: bold;">
                    ⚠️ Baja Sin Cubrir #${indice + 1} - ${nombre} (Legajo: ${legajo})
                </div>
            </div>
            <div style="padding: 20px;">
                ${this.obtenerHTMLDetallesBaja(baja, encabezados)}
            </div>
        `;
    }

    obtenerHTMLDetallesBaja(baja, encabezados) {
        return encabezados
            .map((encabezado, i) => {
                return `
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                        <div style="font-weight: bold; color: #555; flex: 1;">${encabezado}:</div>
                        <div style="color: var(--text); flex: 2; text-align: right;">${baja[i] || 'N/A'}</div>
                    </div>
                `;
            })
            .join('');
    }

    mostrarCargaBajas(mostrar) {
        this.cargandoBajas.style.display = mostrar ? 'block' : 'none';
    }

    mostrarErrorBajas(mensaje) {
        this.contenedorBajas.innerHTML = `
            <div style="text-align: center; color: var(--error); font-size: 18px; padding: 40px; background: var(--surface); border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                ❌ ${mensaje}
            </div>
        `;
    }

    //MODULO DE MODELOS DE NOTAS

    mostrarModuloModelosNotas() {
        document.body.innerHTML = this.obtenerHTMLModelosNotas();
        this.inicializarReferenciasDOMModelosNotas();
        this.configurarEventosModelosNotas();
    }

    obtenerHTMLModelosNotas() {
        return `
            <div class="container" style="max-width: 1000px; margin: 0 auto; padding: 20px;">
                <div class="header" style="background: var(--surface); padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
                    ${this.obtenerHTMLHeaderModelosNotas()}
                    <div style="text-align: center; margin-top: 12px;">
                        <button onclick="gestorRecibos.mostrarMenuPrincipal()" style="padding: 8px 15px; background: var(--neutral); color: var(--primary-contrast); border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                            ⬅️ Volver al Menú Principal
                        </button>
                    </div>
                </div>
                <div id="modelosContainer" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:16px;"></div>
            </div>
        `;
    }

    obtenerHTMLHeaderModelosNotas() {
        return this.getUserHeaderHTML('🗂️ Modelos de Notas');
    }

    inicializarReferenciasDOMModelosNotas() {
        this.modelosContainer = document.getElementById('modelosContainer');
        this.buscarModelosInput = document.getElementById('buscarModelosInput');
        this.filtroTipoModelos = document.getElementById('filtroTipoModelos');
        this.recargarModelosBtn = document.getElementById('recargarModelosBtn');
        this._modelosLista = [];
        this.cargarModelosDesdeManifest();
    }

    configurarEventosModelosNotas() {
        if (this.buscarModelosInput) {
            this.buscarModelosInput.addEventListener('input', this.debounce(() => this.aplicarFiltroModelos(), 200));
        }
        if (this.filtroTipoModelos) {
            this.filtroTipoModelos.addEventListener('change', () => this.aplicarFiltroModelos());
        }
        if (this.recargarModelosBtn) {
            this.recargarModelosBtn.addEventListener('click', () => this.cargarModelosDesdeManifest(true));
        }
    }

    async cargarModelosDesdeManifest(force = false) {
        try {
            const url = 'pdfs/manifest.json';
            const resp = await fetch(url + (force ? ('?t=' + Date.now()) : ''));
            if (!resp.ok) throw new Error('No se pudo cargar manifest');
            const lista = await resp.json();
            this._modelosLista = Array.isArray(lista) ? lista : [];
            this.aplicarFiltroModelos();
        } catch (error) {
            console.error('Error cargando manifest de modelos:', error);
            this._modelosLista = this.pdfLinks || [];
            this.aplicarFiltroModelos();
        }
    }

    aplicarFiltroModelos() {
        const termino = (this.buscarModelosInput?.value || '').toLowerCase();
        const tipo = (this.filtroTipoModelos?.value || '').toLowerCase();

        const filtrados = this._modelosLista.filter(item => {
            const label = (item.label || '').toLowerCase();
            const href = (item.href || '').toLowerCase();
            const t = (item.type || '').toLowerCase() || href.split('.').pop();

            const matchTerm = termino ? (label.includes(termino) || href.includes(termino)) : true;
            const matchTipo = tipo ? (t === tipo) : true;
            return matchTerm && matchTipo;
        });

        this.renderizarModelos(filtrados);
    }

    renderizarModelos(lista) {
        if (!this.modelosContainer) return;
        this.modelosContainer.innerHTML = '';

        if (!lista || lista.length === 0) {
            this.modelosContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:20px; color:var(--error);">No se encontraron documentos.</div>`;
            return;
        }

        const frag = document.createDocumentFragment();
        lista.forEach((item, idx) => {
            const card = document.createElement('div');
            card.style.cssText = 'background:var(--surface); padding:12px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.06); display:flex; flex-direction:column; gap:8px;';

            const title = document.createElement('div');
            title.style.fontWeight = 'bold';
            title.style.color = 'var(--text)';
            title.textContent = item.label || item.href.split('/').pop();

            const icon = document.createElement('div');
            icon.textContent = item.type === 'pdf' ? '📄' : '📁';

            const actions = document.createElement('div');
            actions.style.display = 'flex';
            actions.style.justifyContent = 'space-between';
            actions.style.alignItems = 'center';

            const isGoogleDoc = /https?:\/\/docs\.google\.com\/document\//i.test(item.href);
            const isExportLink = /\/export(\?|$)/i.test(item.href);
            const hasKnownExt = /\.(pdf|docx|doc|xlsx|pptx)(\?|$)/i.test(item.href);

            const linkOpen = document.createElement('a');
            linkOpen.href = item.href;
            linkOpen.target = '_blank';
            linkOpen.rel = 'noopener noreferrer';
            linkOpen.textContent = isGoogleDoc ? '📂 Abrir en Drive' : '🔍 Ver';
            linkOpen.style.textDecoration = 'none';
            linkOpen.style.color = 'var(--brand-primary)';

            actions.appendChild(linkOpen);

            if (isExportLink || hasKnownExt) {
                const linkDownload = document.createElement('a');
                linkDownload.href = item.href;
                linkDownload.download = '';
                linkDownload.textContent = '📥 Descargar';
                linkDownload.style.textDecoration = 'none';
                linkDownload.style.background = 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)';
                linkDownload.style.color = 'var(--primary-contrast)';
                linkDownload.style.padding = '6px 10px';
                linkDownload.style.borderRadius = '6px';
                actions.appendChild(linkDownload);
            } else {
                const hint = document.createElement('div');
                hint.textContent = 'Formato original en Drive';
                hint.style.fontSize = '12px';
                hint.style.color = '#888';
                actions.appendChild(hint);
            }

            const meta = document.createElement('div');
            meta.style.fontSize = '13px';
            meta.style.color = '#666';
            meta.textContent = item.type ? item.type.toUpperCase() : (item.href.split('.').pop() || '').toUpperCase();

            card.appendChild(icon);
            card.appendChild(title);
            card.appendChild(meta);
            card.appendChild(actions);

            frag.appendChild(card);
        });

        this.modelosContainer.appendChild(frag);
    }

    // MÓDULO DE PERSONAL ACTIVO
    mostrarModuloPersonalActivo() {
        document.body.innerHTML = this.obtenerHTMLPersonalActivo();
        this.inicializarReferenciasDOMPersonalActivo();
        this.configurarEventosPersonalActivo();
        this.cargarDependenciasPersonalActivo();
    }

    obtenerHTMLPersonalActivo() {
        return `
            <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
                <div class="header" style="background: var(--surface); padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
                    ${this.obtenerHTMLHeaderPersonalActivo()}
                    ${this.obtenerHTMLControlesPersonalActivo()}
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="gestorRecibos.mostrarMenuPrincipal()" style="padding: 8px 15px; background: var(--neutral); color: var(--primary-contrast); border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                            ⬅️ Volver al Menú Principal
                        </button>
                    </div>
                </div>
                
                <div id="loadingPersonalActivo" style="display: none; text-align: center; padding: 40px; font-size: 18px; color: #17a2b8;">
                    ⏳ Cargando personal activo...
                </div>
                
                <div id="personalActivoContainer"></div>
            </div>
        `;
    }

    obtenerHTMLHeaderPersonalActivo() {
        return this.getUserHeaderHTML('👥 Sistema de Gestión de Personal Activo');
    }

    obtenerHTMLControlesPersonalActivo() {
        return `
            <div class="controls" style="display: flex; gap: 15px; align-items: center; justify-content: center; flex-wrap: wrap;">
                <select id="dependenciaSelectPersonalActivo" style="padding: 10px; border: 2px solid var(--border); border-radius: 5px; font-size: 16px; min-width: 200px;">
                    <option value="">Selecciona una dependencia</option>
                </select>
                
                <input type="text" id="legajoInputPersonalActivo" placeholder="Filtrar por legajo..." style="padding: 10px; border: 2px solid var(--border); border-radius: 5px; font-size: 16px; min-width: 150px;">
                
                <button id="loadBtnPersonalActivo" style="padding: 10px 20px; background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); border: none; border-radius: 5px; font-size: 16px; cursor: pointer; font-weight: bold;">
                    👥 Cargar Personal
                </button>

                <button id="exportBtnPersonalActivo" style="padding: 10px 16px; background: #0b74de; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;">
                    📥 Exportar Excel
                </button>
                
                <button id="clearBtnPersonalActivo" style="padding: 10px 15px; background: var(--neutral); color: var(--primary-contrast); border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
                    🗑️ Limpiar
                </button>
            </div>
        `;
    }

    inicializarReferenciasDOMPersonalActivo() {
        this.selectorDependenciaPersonalActivo = document.getElementById('dependenciaSelectPersonalActivo');
        this.botonCargarPersonalActivo = document.getElementById('loadBtnPersonalActivo');
        this.cargandoPersonalActivo = document.getElementById('loadingPersonalActivo');
        this.contenedorPersonalActivo = document.getElementById('personalActivoContainer');
        this.inputLegajoPersonalActivo = document.getElementById('legajoInputPersonalActivo');
    }

    configurarEventosPersonalActivo() {
        this.botonCargarPersonalActivo.addEventListener('click', () => this.cargarPersonalActivo());
        this.inputLegajoPersonalActivo.addEventListener('input', this.debounce(() => this.filtrarPorLegajoPersonalActivo(), 200));
        document.getElementById('clearBtnPersonalActivo').addEventListener('click', () => this.limpiarFiltrosPersonalActivo());
        const expPA = document.getElementById('exportBtnPersonalActivo');
        if (expPA) expPA.addEventListener('click', () => this.exportarPersonalActivoExcel());
    }

    async cargarDependenciasPersonalActivo() {
        try {
            if (this.usuarioActual.role === 'superadmin') {
                await this.cargarTodasLasDependenciasPersonalActivo();
            } else {
                this.cargarDependenciaUsuarioPersonalActivo();
            }
        } catch (error) {
            console.error('Error cargando dependencias:', error);
            this.mostrarErrorPersonalActivo('Error al cargar las dependencias');
        }
    }

    async cargarTodasLasDependenciasPersonalActivo() {
        const opcionTodos = document.createElement('option');
        opcionTodos.value = 'TODOS';
        opcionTodos.textContent = 'Ver Todas las Dependencias';
        this.selectorDependenciaPersonalActivo.appendChild(opcionTodos);

        const datos = await this.obtenerDatosHoja(`${this.HOJA_PersonalActivo}!D:D`);
        const dependencias = [...new Set(datos.values?.slice(1).map(fila => fila[0]).filter(dep => dep) || [])];

        dependencias.forEach(dep => {
            const opcion = document.createElement('option');
            opcion.value = dep;
            opcion.textContent = dep;
            this.selectorDependenciaPersonalActivo.appendChild(opcion);
        });
    }

    cargarDependenciaUsuarioPersonalActivo() {
        const opcion = document.createElement('option');
        opcion.value = this.usuarioActual.dependencia;
        opcion.textContent = this.usuarioActual.dependencia;
        this.selectorDependenciaPersonalActivo.appendChild(opcion);
        this.selectorDependenciaPersonalActivo.value = this.usuarioActual.dependencia;
        this.selectorDependenciaPersonalActivo.disabled = true;
        this.selectorDependenciaPersonalActivo.style.backgroundColor = '#f8f9fa';
    }

    async cargarPersonalActivo() {
        const dependenciaSeleccionada = this.selectorDependenciaPersonalActivo.value;

        if (!dependenciaSeleccionada) {
            alert('Por favor selecciona una dependencia');
            return;
        }

        this.mostrarCargaPersonalActivo(true);
        this.contenedorPersonalActivo.innerHTML = '';

        try {
            const datos = await this.obtenerDatosHoja(`${this.HOJA_PersonalActivo}!A:I`);

            if (!datos.values || datos.values.length <= 1) {
                this.mostrarErrorPersonalActivo('No se encontraron datos de personal activo');
                return;
            }

            const encabezados = datos.values[0];
            this.encabezadosPersonalActivo = encabezados;
            const filas = datos.values.slice(1);

            if (this.usuarioActual.role === 'superadmin' && dependenciaSeleccionada === 'TODOS') {
                this.todosLosPersonalActivo = filas;
            } else {
                this.todosLosPersonalActivo = filas.filter(fila => fila[3] === dependenciaSeleccionada);
            }

            if (this.todosLosPersonalActivo.length === 0) {
                this.mostrarErrorPersonalActivo('No se encontró personal activo para esta dependencia');
                return;
            }

            this.aplicarFiltrosPersonalActivo();
            this.renderizarPersonalActivo(this.personalActivoFiltrado, encabezados);

        } catch (error) {
            console.error('Error cargando personal activo:', error);
            this.mostrarErrorPersonalActivo('Error al cargar el personal activo');
        } finally {
            this.mostrarCargaPersonalActivo(false);
        }
    }

    aplicarFiltrosPersonalActivo() {
        let personal = [...this.todosLosPersonalActivo];

        const legajoBuscado = this.inputLegajoPersonalActivo.value.trim();
        if (legajoBuscado) {
            personal = personal.filter(persona => {
                const legajoPersona = persona[0] ? persona[0].toString() : '';
                return legajoPersona.toLowerCase().includes(legajoBuscado.toLowerCase());
            });
        }

        this.personalActivoFiltrado = personal;
    }

    filtrarPorLegajoPersonalActivo() {
        if (!this.todosLosPersonalActivo || this.todosLosPersonalActivo.length === 0) {
            return;
        }

        this.aplicarFiltrosPersonalActivo();
        this.contenedorPersonalActivo.innerHTML = '';

        if (this.personalActivoFiltrado.length === 0) {
            this.mostrarErrorPersonalActivo('No se encontró personal activo con ese número de legajo');
        } else {
            const encabezados = ['Legajo', 'Nombre', 'Cargo', 'Estado', 'Dependencia'];
            this.renderizarPersonalActivo(this.personalActivoFiltrado, encabezados);
        }
    }

    limpiarFiltrosPersonalActivo() {
        this.inputLegajoPersonalActivo.value = '';

        if (this.todosLosPersonalActivo && this.todosLosPersonalActivo.length > 0) {
            this.personalActivoFiltrado = [...this.todosLosPersonalActivo];
            const encabezados = ['Legajo', 'Nombre', 'Cargo', 'Estado', 'Dependencia'];
            this.contenedorPersonalActivo.innerHTML = '';
            this.renderizarPersonalActivo(this.personalActivoFiltrado, encabezados);
        }
    }

    renderizarPersonalActivo(personal, encabezados) {
        const frag = document.createDocumentFragment();
        personal.forEach((persona, indice) => {
            const tarjetaPersona = this.crearTarjetaPersonalActivo(persona, encabezados, indice);
            frag.appendChild(tarjetaPersona);
        });
        this.contenedorPersonalActivo.appendChild(frag);
    }

    crearTarjetaPersonalActivo(persona, encabezados, indice) {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'personal-activo-card';
        tarjeta.style.cssText = `
            background: var(--surface);
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            overflow: hidden;
            transition: transform 0.2s;
        `;

        tarjeta.innerHTML = this.obtenerHTMLTarjetaPersonalActivo(persona, encabezados, indice);
        this.configurarHoverTarjeta(tarjeta);

        return tarjeta;
    }

    obtenerHTMLTarjetaPersonalActivo(persona, encabezados, indice) {
        const legajo = persona[0] || 'N/A';
        const nombre = persona[1] || 'N/A';
        const cargo = persona[2] || 'N/A';
        const estado = persona[3] || 'N/A';

        let estadoColor = '#28a745';
        if (estado.toLowerCase().includes('inactivo') || estado.toLowerCase().includes('baja')) {
            estadoColor = '#dc3545';
        } else if (estado.toLowerCase().includes('licencia') || estado.toLowerCase().includes('suspendido')) {
            estadoColor = '#ffc107';
        }

        return `
            <div class="personal-activo-header" style="background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 18px; font-weight: bold;">
                    👥 ${nombre} (Legajo: ${legajo})
                </div>
                <div style="background-color: ${estadoColor}; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold;">
                    ${estado}
                </div>
            </div>
            <div style="padding: 20px;">
                ${this.obtenerHTMLDetallesPersonalActivo(persona, encabezados)}
            </div>
        `;
    }

    obtenerHTMLDetallesPersonalActivo(persona, encabezados) {
        return encabezados
            .map((encabezado, i) => {
                let valor = persona[i] || 'N/A';
                if (encabezado === 'Estado' && valor !== 'N/A') {
                    let estadoColor = '#28a745';
                    if (valor.toLowerCase().includes('inactivo') || valor.toLowerCase().includes('baja')) {
                        estadoColor = '#dc3545';
                    } else if (valor.toLowerCase().includes('licencia') || valor.toLowerCase().includes('suspendido')) {
                        estadoColor = '#ffc107';
                    }
                    valor = `<span style="color: ${estadoColor}; font-weight: bold;">${valor}</span>`;
                }

                return `
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                        <div style="font-weight: bold; color: #555; flex: 1;">${encabezado}:</div>
                        <div style="color: var(--text); flex: 2; text-align: right;">${valor}</div>
                    </div>
                `;
            })
            .join('');
    }

    mostrarCargaPersonalActivo(mostrar) {
        this.cargandoPersonalActivo.style.display = mostrar ? 'block' : 'none';
    }

    mostrarErrorPersonalActivo(mensaje) {
        this.contenedorPersonalActivo.innerHTML = `
            <div style="text-align: center; color: var(--error); font-size: 18px; padding: 40px; background: var(--surface); border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                ❌ ${mensaje}
            </div>
        `;
    }

    // MÓDULO DE ACCIDENTES
    mostrarModuloAccidentes() {
        document.body.innerHTML = this.obtenerHTMLAccidentes();
        this.inicializarReferenciasDOMAccidentes();
        this.configurarEventosAccidentes();
        this.establecerFechaHoraActual();
    }

    obtenerHTMLAccidentes() {
        return `
            <div class="container" style="max-width: 800px; margin: 0 auto; padding: 20px;">
                <div class="header" style="background: var(--surface); padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
                    ${this.obtenerHTMLHeaderAccidentes()}
                    
                    <div style="text-align: center; margin-bottom: 20px;">
                        <button onclick="gestorRecibos.mostrarMenuPrincipal()" style="padding: 8px 15px; background: var(--neutral); color: var(--primary-contrast); border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                            ⬅️ Volver al Menú Principal
                        </button>
                    </div>
                </div>
                
                <div class="form-container" style="background: var(--surface); padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    ${this.obtenerHTMLFormularioAccidente()}
                </div>
                
                <div id="mensajeAccidente" style="margin-top: 20px; padding: 15px; border-radius: 8px; display: none; font-weight: bold; text-align: center;"></div>
            </div>
        `;
    }

    obtenerHTMLHeaderAccidentes() {
        return this.getUserHeaderHTML('🚨 Registro de Accidentes Laborales');
    }

    obtenerHTMLFormularioAccidente() {
        return `
            <form id="formularioAccidente">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; color: #555; font-weight: bold; margin-bottom: 5px;">
                            <span style="color: var(--error);">*</span> Número de Legajo:
                        </label>
                        <input type="text" id="legajoAccidente" required 
                               style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; box-sizing: border-box;"
                               placeholder="Ej: 12345">
                    </div>
                    
                    <div>
                        <label style="display: block; color: #555; font-weight: bold; margin-bottom: 5px;">
                            <span style="color: var(--error);">*</span> Nombre del Accidentado:
                        </label>
                        <input type="text" id="nombreAccidente" required 
                               style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; box-sizing: border-box;"
                               placeholder="Ej: Juan Carlos">
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: #555; font-weight: bold; margin-bottom: 5px;">
                        <span style="color: var(--error);">*</span> Apellido del Accidentado:
                    </label>
                    <input type="text" id="apellidoAccidente" required 
                           style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; box-sizing: border-box;"
                           placeholder="Ej: González Pérez">
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: #555; font-weight: bold; margin-bottom: 5px;">
                        <span style="color: var(--error);">*</span> Detalle del Accidente:
                    </label>
                    <textarea id="detalleAccidente" required rows="4"
                              style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; resize: vertical; box-sizing: border-box;"
                              placeholder="Describa lo sucedido..."></textarea>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; color: #555; font-weight: bold; margin-bottom: 5px;">
                            <span style="color: var(--error);">*</span> Fecha del Accidente:
                        </label>
                        <input type="date" id="fechaAccidente" required 
                               style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; box-sizing: border-box;">
                    </div>
                    
                    <div>
                        <label style="display: block; color: #555; font-weight: bold; margin-bottom: 5px;">
                            <span style="color: var(--error);">*</span> Hora del Accidente:
                        </label>
                        <input type="time" id="horaAccidente" required 
                               style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; box-sizing: border-box;">
                    </div>
                </div>

                <div style="margin-bottom: 30px;">
                    <label style="display: block; color: #555; font-weight: bold; margin-bottom: 5px;">
                        <span style="color: var(--error);">*</span> Administrador que Carga el Reclamo:
                    </label>
                    <input type="text" id="administradorAccidente" required
                           style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; box-sizing: border-box;"
                           placeholder="Ingrese nombre y apellido del administrador...">
                </div>

                <div style="text-align: center;">
                    <button type="submit" id="guardarAccidente" 
                            style="padding: 15px 30px; background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); border: none; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; transition: all 0.3s;">
                        🚨 Registrar Accidente
                    </button>
                </div>

                <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; color: #856404;">
                    <strong>📝 Nota importante:</strong> Los campos marcados con <span style="color: var(--error);">*</span> son obligatorios. 
                    Asegúrese de completar toda la información requerida antes de enviar el formulario.
                </div>
            </form>
        `;
    }

    inicializarReferenciasDOMAccidentes() {
        this.formularioAccidente = document.getElementById('formularioAccidente');
        this.inputLegajoAccidente = document.getElementById('legajoAccidente');
        this.inputNombreAccidente = document.getElementById('nombreAccidente');
        this.inputApellidoAccidente = document.getElementById('apellidoAccidente');
        this.inputDetalleAccidente = document.getElementById('detalleAccidente');
        this.inputFechaAccidente = document.getElementById('fechaAccidente');
        this.inputHoraAccidente = document.getElementById('horaAccidente');
        this.inputAdministradorAccidente = document.getElementById('administradorAccidente');
        this.botonGuardarAccidente = document.getElementById('guardarAccidente');
    }

    configurarEventosAccidentes() {
        this.formularioAccidente.addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarAccidente();
        });

        // Agregar efecto hover al botón
        this.botonGuardarAccidente.onmouseover = () => {
            this.botonGuardarAccidente.style.transform = 'translateY(-2px)';
            this.botonGuardarAccidente.style.boxShadow = '0 5px 15px rgba(253, 126, 20, 0.4)';
        };

        this.botonGuardarAccidente.onmouseout = () => {
            this.botonGuardarAccidente.style.transform = 'translateY(0)';
            this.botonGuardarAccidente.style.boxShadow = 'none';
        };
    }

    establecerFechaHoraActual() {
        const ahora = new Date();
        const fecha = ahora.toISOString().split('T')[0];
        const hora = ahora.toTimeString().split(':').slice(0, 2).join(':');

        this.inputFechaAccidente.value = fecha;
        this.inputHoraAccidente.value = hora;
    }

    async guardarAccidente() {
        if (!this.validarFormularioAccidente()) {
            return;
        }

        this.botonGuardarAccidente.disabled = true;
        this.botonGuardarAccidente.textContent = '⏳ Guardando...';
        this.botonGuardarAccidente.style.background = 'var(--neutral)';

        try {
            const datosAccidente = this.recopilarDatosAccidente();
            await this.enviarAccidenteAHoja(datosAccidente);
            this.mostrarMensajeExito();
            this.limpiarFormularioAccidente();
        } catch (error) {
            console.error('Error guardando accidente:', error);
            this.mostrarMensajeError('Error al guardar el accidente. Intente nuevamente.');
        } finally {
            this.restaurarBotonGuardar();
        }
    }

    validarFormularioAccidente() {
        const campos = [
            { elemento: this.inputLegajoAccidente, nombre: 'Número de Legajo' },
            { elemento: this.inputNombreAccidente, nombre: 'Nombre' },
            { elemento: this.inputApellidoAccidente, nombre: 'Apellido' },
            { elemento: this.inputDetalleAccidente, nombre: 'Detalle del Accidente' },
            { elemento: this.inputFechaAccidente, nombre: 'Fecha del Accidente' },
            { elemento: this.inputHoraAccidente, nombre: 'Hora del Accidente' },
            { elemento: this.inputAdministradorAccidente, nombre: 'Administrador' }
        ];

        for (const campo of campos) {
            if (!campo.elemento.value.trim()) {
                this.mostrarMensajeError(`El campo "${campo.nombre}" es obligatorio.`);
                campo.elemento.focus();
                return false;
            }
        }

        if (!/^\d+$/.test(this.inputLegajoAccidente.value.trim())) {
            this.mostrarMensajeError('El número de legajo debe contener solo números.');
            this.inputLegajoAccidente.focus();
            return false;
        }

        if (this.inputDetalleAccidente.value.trim().length < 10) {
            this.mostrarMensajeError('El detalle del accidente debe tener al menos 10 caracteres.');
            this.inputDetalleAccidente.focus();
            return false;
        }

        return true;
    }

    recopilarDatosAccidente() {
        const fechaHora = `${this.inputFechaAccidente.value} ${this.inputHoraAccidente.value}`;
        const fechaRegistro = new Date().toLocaleString('es-AR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        return [
            this.inputLegajoAccidente.value.trim(),
            this.inputNombreAccidente.value.trim(),
            this.inputApellidoAccidente.value.trim(),
            this.inputDetalleAccidente.value.trim(),
            fechaHora,
            this.inputAdministradorAccidente.value.trim(),
            this.usuarioActual.dependencia || 'Sin Dependencia',
            fechaRegistro
        ];
    }

    async enviarAccidenteAHoja(datosAccidente) {
        const APPS_SCRIPT_URL = `https://script.google.com/macros/s/AKfycbz0dgpx9Ywohz9PTZ4Uvdoo10I8Rrzhht-jQBA69h_bdOiIs_ApMhscFrkVGFv9ZIrs1Q/exec`;

        try {
            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    values: datosAccidente,
                    sheetName: this.HOJA_ACCIDENTES
                })
            });

            console.log("Datos enviados a Apps Script exitosamente.");
        } catch (error) {
            console.error('Error al contactar con Google Apps Script:', error);
            throw error;
        }
    }

    mostrarMensajeExito() {
        const mensaje = document.getElementById('mensajeAccidente');
        mensaje.style.display = 'block';
        mensaje.style.backgroundColor = '#d4edda';
        mensaje.style.color = '#155724';
        mensaje.style.border = '1px solid #c3e6cb';
        mensaje.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                <span style="font-size: 24px;">✅</span>
                <div>
                    <strong>¡Accidente registrado exitosamente!</strong><br>
                    <small>El reporte ha sido guardado en el sistema.</small>
                </div>
            </div>
        `;
        setTimeout(() => {
            mensaje.style.display = 'none';
        }, 5000);
    }

    mostrarMensajeError(texto) {
        const mensaje = document.getElementById('mensajeAccidente');
        mensaje.style.display = 'block';
        mensaje.style.backgroundColor = '#f8d7da';
        mensaje.style.color = '#721c24';
        mensaje.style.border = '1px solid #f5c6cb';
        mensaje.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                <span style="font-size: 24px;">❌</span>
                <div>
                    <strong>Error:</strong><br>
                    <small>${texto}</small>
                </div>
            </div>
        `;

        setTimeout(() => {
            mensaje.style.display = 'none';
        }, 5000);
    }

    limpiarFormularioAccidente() {
        this.inputLegajoAccidente.value = '';
        this.inputNombreAccidente.value = '';
        this.inputApellidoAccidente.value = '';
        this.inputDetalleAccidente.value = '';
        this.inputAdministradorAccidente.value = '';
        this.establecerFechaHoraActual();
    }

    restaurarBotonGuardar() {
        this.botonGuardarAccidente.disabled = false;
        this.botonGuardarAccidente.textContent = '🚨 Registrar Accidente';
        this.botonGuardarAccidente.style.background = 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)';
    }

    // MÓDULO DE MEDICINA LABORAL
    mostrarModuloMedicinaLaboral() {
        document.body.innerHTML = this.obtenerHTMLMedicinaLaboral();
        this.inicializarReferenciasDOMMedicinaLaboral();
        this.configurarEventosMedicinaLaboral();
        this.establecerFechaActualMedicinaLaboral();
    }

    obtenerHTMLMedicinaLaboral() {
        return `
            <div class="container" style="max-width: 800px; margin: 0 auto; padding: 20px;">
                <div class="header" style="background: var(--surface); padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
                    ${this.obtenerHTMLHeaderMedicinaLaboral()}
                    
                    <div style="text-align: center; margin-bottom: 20px;">
                        <button onclick="gestorRecibos.mostrarMenuPrincipal()" style="padding: 8px 15px; background: var(--neutral); color: var(--primary-contrast); border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                            ⬅️ Volver al Menú Principal
                        </button>
                    </div>
                </div>
                
                <div class="form-container" style="background: var(--surface); padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    ${this.obtenerHTMLFormularioMedicinaLaboral()}
                </div>
                
                <div id="mensajeMedicinaLaboral" style="margin-top: 20px; padding: 15px; border-radius: 8px; display: none; font-weight: bold; text-align: center;"></div>
            </div>
        `;
    }

    obtenerHTMLHeaderMedicinaLaboral() {
        return this.getUserHeaderHTML('🏥 Registro de Medicina Laboral');
    }

    obtenerHTMLFormularioMedicinaLaboral() {
        return `
            <form id="formularioMedicinaLaboral">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; color: #555; font-weight: bold; margin-bottom: 5px;">
                            <span style="color: var(--error);">*</span> Número de Legajo:
                        </label>
                        <input type="text" id="legajoMedicinaLaboral" required 
                               style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; box-sizing: border-box;"
                               placeholder="Ej: 12345">
                    </div>
                    
                    <div>
                        <label style="display: block; color: #555; font-weight: bold; margin-bottom: 5px;">
                            <span style="color: var(--error);">*</span> Nombre:
                        </label>
                        <input type="text" id="nombreMedicinaLaboral" required 
                               style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; box-sizing: border-box;"
                               placeholder="Ej: Juan Carlos">
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: #555; font-weight: bold; margin-bottom: 5px;">
                        <span style="color: var(--error);">*</span> Apellido:
                    </label>
                    <input type="text" id="apellidoMedicinaLaboral" required 
                           style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; box-sizing: border-box;"
                           placeholder="Ej: González Pérez">
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: #555; font-weight: bold; margin-bottom: 5px;">
                        <span style="color: var(--error);">*</span> Fecha del Certificado Médico:
                    </label>
                    <input type="date" id="fechaCertificadoMedicinaLaboral" required 
                           style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; box-sizing: border-box;">
                </div>

                <div style="margin-bottom: 12px;">
                    <label style="display: block; color: #555; font-weight: bold; margin-bottom: 8px;">
                        <span style="color: var(--error);">*</span> Tipo de Registro:
                    </label>
                    <div style="display:flex; gap:16px; align-items:center;">
                        <label style="display:flex; gap:8px; align-items:center;">
                            <input type="radio" name="tipoCantidadML" id="tipoDiasML" value="dias" checked>
                            <span>Días</span>
                        </label>
                        <label style="display:flex; gap:8px; align-items:center;">
                            <input type="radio" name="tipoCantidadML" id="tipoHorasML" value="horas">
                            <span>Horas</span>
                        </label>
                    </div>
                </div>

                <div id="campoDiasML" style="margin-bottom: 20px;">
                    <label style="display: block; color: #555; font-weight: bold; margin-bottom: 5px;">
                        <span style="color: var(--error);">*</span> Cantidad de Días:
                    </label>
                    <input type="number" id="cantidadDiasMedicinaLaboral" min="1" required
                           style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; box-sizing: border-box;"
                           placeholder="Ej: 7">
                </div>

                <div id="campoHorasML" style="margin-bottom: 20px; display: none;">
                    <label style="display: block; color: #555; font-weight: bold; margin-bottom: 5px;">
                        <span style="color: var(--error);">*</span> Cantidad de Horas:
                    </label>
                    <input type="number" id="cantidadHorasMedicinaLaboral" min="1" step="0.5"
                           style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; box-sizing: border-box;"
                           placeholder="Ej: 4">
                    <small style="color: #666; font-size: 14px;">Puede usar medios puntos (ej. 3.5)</small>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: #555; font-weight: bold; margin-bottom: 5px;">
                        <span style="color: var(--error);">*</span> Diagnóstico:
                    </label>
                    <textarea id="diagnosticoMedicinaLaboral" required rows="4"
                              style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; resize: vertical; box-sizing: border-box;"
                              placeholder="Describa el diagnóstico médico..."></textarea>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: #555; font-weight: bold; margin-bottom: 5px;">
                        <span style="color: var(--error);">*</span> Archivo Adjunto:
                    </label>
                    <input type="file" id="archivoAdjMedicinaLaboral" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" required
                           style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; box-sizing: border-box;">
                    <small style="color: #666; font-size: 14px;">Formatos permitidos: PDF, JPG, PNG, DOC, DOCX</small>
                </div>

                <div style="margin-bottom: 30px;">
                    <label style="display: block; color: #555; font-weight: bold; margin-bottom: 5px;">
                        <span style="color: var(--error);">*</span> Administrador que Carga el Registro:
                    </label>
                    <input type="text" id="administradorMedicinaLaboral" required
                           style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 16px; box-sizing: border-box;"
                           placeholder="Ingrese nombre y apellido del administrador...">
                </div>

                <div style="text-align: center;">
                    <button type="submit" id="guardarMedicinaLaboral" 
                            style="padding: 15px 30px; background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%); color: var(--primary-contrast); border: none; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; transition: all 0.3s;">
                        🏥 Registrar Medicina Laboral
                    </button>
                </div>

                <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; color: #856404;">
                    <strong>📝 Nota importante:</strong> Los campos marcados con <span style="color: var(--error);">*</span> son obligatorios. 
                    Asegúrese de completar toda la información requerida antes de enviar el formulario.
                </div>
            </form>
        `;
    }

    inicializarReferenciasDOMMedicinaLaboral() {
        this.formularioMedicinaLaboral = document.getElementById('formularioMedicinaLaboral');
        this.inputLegajoMedicinaLaboral = document.getElementById('legajoMedicinaLaboral');
        this.inputNombreMedicinaLaboral = document.getElementById('nombreMedicinaLaboral');
        this.inputApellidoMedicinaLaboral = document.getElementById('apellidoMedicinaLaboral');
        this.inputFechaCertificadoMedicinaLaboral = document.getElementById('fechaCertificadoMedicinaLaboral');
        this.radioTipoDiasML = document.getElementById('tipoDiasML');
        this.radioTipoHorasML = document.getElementById('tipoHorasML');
        this.inputCantidadDiasMedicinaLaboral = document.getElementById('cantidadDiasMedicinaLaboral');
        this.inputCantidadHorasMedicinaLaboral = document.getElementById('cantidadHorasMedicinaLaboral');
        this.campoDiasML = document.getElementById('campoDiasML');
        this.campoHorasML = document.getElementById('campoHorasML');
        this.diagnosticoMedicinaLaboral = document.getElementById('diagnosticoMedicinaLaboral');
        this.archivoAdjMedicinaLaboral = document.getElementById('archivoAdjMedicinaLaboral');
        this.inputAdministradorMedicinaLaboral = document.getElementById('administradorMedicinaLaboral');
        this.botonGuardarMedicinaLaboral = document.getElementById('guardarMedicinaLaboral');
    }

    configurarEventosMedicinaLaboral() {
        this.formularioMedicinaLaboral.addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarMedicinaLaboral();
        });

        // Agregar efecto hover al botón
        this.botonGuardarMedicinaLaboral.onmouseover = () => {
            this.botonGuardarMedicinaLaboral.style.transform = 'translateY(-2px)';
            this.botonGuardarMedicinaLaboral.style.boxShadow = '0 5px 15px rgba(20, 39, 253, 0.4)';
        };

        this.botonGuardarMedicinaLaboral.onmouseout = () => {
            this.botonGuardarMedicinaLaboral.style.transform = 'translateY(0)';
            this.botonGuardarMedicinaLaboral.style.boxShadow = 'none';
        };

        // Toggle entre Días y Horas
        this.radioTipoDiasML.addEventListener('change', () => this.toggleTipoCantidadMedicinaLaboral());
        this.radioTipoHorasML.addEventListener('change', () => this.toggleTipoCantidadMedicinaLaboral());
        // Estado inicial
        this.toggleTipoCantidadMedicinaLaboral();
    }

    establecerFechaActualMedicinaLaboral() {
        const ahora = new Date();
        const fecha = ahora.toISOString().split('T')[0];
        this.inputFechaCertificadoMedicinaLaboral.value = fecha;
    }

    toggleTipoCantidadMedicinaLaboral() {
        const esDias = this.radioTipoDiasML.checked;
        this.campoDiasML.style.display = esDias ? 'block' : 'none';
        this.campoHorasML.style.display = esDias ? 'none' : 'block';
        this.inputCantidadDiasMedicinaLaboral.required = esDias;
        this.inputCantidadHorasMedicinaLaboral.required = !esDias;
        if (esDias) {
            this.inputCantidadHorasMedicinaLaboral.value = '';
        } else {
            this.inputCantidadDiasMedicinaLaboral.value = '';
        }
    }

    async guardarMedicinaLaboral() {
        if (!this.validarFormularioMedicinaLaboral()) {
            return;
        }

        this.botonGuardarMedicinaLaboral.disabled = true;
        this.botonGuardarMedicinaLaboral.textContent = '⏳ Subiendo archivo y guardando...';
        this.botonGuardarMedicinaLaboral.style.background = 'var(--neutral)';

        try {
            let datosMedicinaLaboral = this.recopilarDatosMedicinaLaboral();
            let archivo = this.archivoAdjMedicinaLaboral.files[0];

            if (archivo) {
                const reader = new FileReader();
                reader.readAsDataURL(archivo);
                reader.onload = async () => {
                    const base64Data = reader.result.split(',');
                    const payload = {
                        values: datosMedicinaLaboral,
                        file: {
                            base64: base64Data[1],
                            type: archivo.type,
                            name: archivo.name
                        }
                    };

                    await this.enviarMedicinaLaboralAHoja(payload);
                    this.mostrarMensajeExitoMedicinaLaboral();
                    this.limpiarFormularioMedicinaLaboral();
                };
            } else {
                const payload = { values: datosMedicinaLaboral };
                await this.enviarMedicinaLaboralAHoja(payload);
                this.mostrarMensajeExitoMedicinaLaboral();
                this.limpiarFormularioMedicinaLaboral();
            }

        } catch (error) {
        } finally {
            this.restaurarBotonGuardarMedicinaLaboral();
        }
    }

    validarFormularioMedicinaLaboral() {
        const campos = [
            { elemento: this.inputLegajoMedicinaLaboral, nombre: 'Número de Legajo' },
            { elemento: this.inputNombreMedicinaLaboral, nombre: 'Nombre' },
            { elemento: this.inputApellidoMedicinaLaboral, nombre: 'Apellido' },
            { elemento: this.inputFechaCertificadoMedicinaLaboral, nombre: 'Fecha del Certificado' },
            { elemento: this.diagnosticoMedicinaLaboral, nombre: 'Diagnóstico' },
            { elemento: this.inputAdministradorMedicinaLaboral, nombre: 'Administrador' }
        ];

        for (const campo of campos) {
            if (!campo.elemento.value.trim()) {
                this.mostrarMensajeErrorMedicinaLaboral(`El campo "${campo.nombre}" es obligatorio.`);
                campo.elemento.focus();
                return false;
            }
        }

        if (!/^\d+$/.test(this.inputLegajoMedicinaLaboral.value.trim())) {
            this.mostrarMensajeErrorMedicinaLaboral('El número de legajo debe contener solo números.');
            this.inputLegajoMedicinaLaboral.focus();
            return false;
        }

        if (this.radioTipoDiasML.checked) {
            const dias = parseInt(this.inputCantidadDiasMedicinaLaboral.value, 10);
            if (isNaN(dias) || dias < 1) {
                this.mostrarMensajeErrorMedicinaLaboral('La cantidad de días debe ser mayor a 0.');
                this.inputCantidadDiasMedicinaLaboral.focus();
                return false;
            }
        } else {
            const horas = parseFloat(this.inputCantidadHorasMedicinaLaboral.value);
            if (isNaN(horas) || horas <= 0) {
                this.mostrarMensajeErrorMedicinaLaboral('La cantidad de horas debe ser mayor a 0.');
                this.inputCantidadHorasMedicinaLaboral.focus();
                return false;
            }
        }

        if (this.diagnosticoMedicinaLaboral.value.trim().length < 5) {
            this.mostrarMensajeErrorMedicinaLaboral('El diagnóstico debe tener al menos 5 caracteres.');
            this.diagnosticoMedicinaLaboral.focus();
            return false;
        }


        if (!this.archivoAdjMedicinaLaboral || this.archivoAdjMedicinaLaboral.files.length === 0) {
            this.mostrarMensajeErrorMedicinaLaboral('Debe adjuntar un archivo (PDF, JPG, PNG, DOC o DOCX).');
            this.archivoAdjMedicinaLaboral.focus();
            return false;
        }

        return true;
    }

    recopilarDatosMedicinaLaboral() {
        const fechaRegistro = new Date().toLocaleString('es-AR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        const archivoAdjunto = this.archivoAdjMedicinaLaboral.files.length > 0
            ? this.archivoAdjMedicinaLaboral.files[0].name
            : 'Sin archivo';

        const esDias = this.radioTipoDiasML.checked;
        const cantidad = esDias
            ? this.inputCantidadDiasMedicinaLaboral.value
            : this.inputCantidadHorasMedicinaLaboral.value;
        const unidad = esDias ? 'Días' : 'Horas';

        return [
            this.inputLegajoMedicinaLaboral.value.trim(),
            this.inputNombreMedicinaLaboral.value.trim(),
            this.inputApellidoMedicinaLaboral.value.trim(),
            this.inputFechaCertificadoMedicinaLaboral.value,
            cantidad,
            unidad,
            this.diagnosticoMedicinaLaboral.value.trim(),
            archivoAdjunto,
            this.inputAdministradorMedicinaLaboral.value.trim(),
            this.usuarioActual.dependencia || 'Sin Dependencia',
            fechaRegistro
        ];
    }

    async enviarMedicinaLaboralAHoja(payload) {
        const APPS_SCRIPT_URL = `https://script.google.com/macros/s/AKfycbz0dgpx9Ywohz9PTZ4Uvdoo10I8Rrzhht-jQBA69h_bdOiIs_ApMhscFrkVGFv9ZIrs1Q/exec`;

        try {
            const enrichedPayload = {
                ...payload,
                sheetName: this.HOJA_MedicinaLaboral
            };

            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(enrichedPayload)
            });

            console.log("Datos y/o archivo enviados a Apps Script exitosamente.");
        } catch (error) {
            console.error('Error al contactar con Google Apps Script:', error);
            throw error;
        }
    }

    mostrarMensajeExitoMedicinaLaboral() {
        const mensaje = document.getElementById('mensajeMedicinaLaboral');
        mensaje.style.display = 'block';
        mensaje.style.backgroundColor = '#d4edda';
        mensaje.style.color = '#155724';
        mensaje.style.border = '1px solid #c3e6cb';
        mensaje.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                <span style="font-size: 24px;">✅</span>
                <div>
                    <strong>¡Registro de medicina laboral guardado exitosamente!</strong><br>
                    <small>El reporte ha sido guardado en el sistema.</small>
                </div>
            </div>
        `;
        setTimeout(() => {
            mensaje.style.display = 'none';
        }, 5000);
    }

    mostrarMensajeErrorMedicinaLaboral(texto) {
        const mensaje = document.getElementById('mensajeMedicinaLaboral');
        mensaje.style.display = 'block';
        mensaje.style.backgroundColor = '#f8d7da';
        mensaje.style.color = '#721c24';
        mensaje.style.border = '1px solid #f5c6cb';
        mensaje.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                <span style="font-size: 24px;">❌</span>
                <div>
                    <strong>Error:</strong><br>
                    <small>${texto}</small>
                </div>
            </div>
        `;

        setTimeout(() => {
            mensaje.style.display = 'none';
        }, 5000);
    }

    limpiarFormularioMedicinaLaboral() {
        this.inputLegajoMedicinaLaboral.value = '';
        this.inputNombreMedicinaLaboral.value = '';
        this.inputApellidoMedicinaLaboral.value = '';
        this.inputCantidadDiasMedicinaLaboral.value = '';
        this.inputCantidadHorasMedicinaLaboral.value = '';
        this.diagnosticoMedicinaLaboral.value = '';
        this.archivoAdjMedicinaLaboral.value = '';
        this.inputAdministradorMedicinaLaboral.value = '';
        this.establecerFechaActualMedicinaLaboral();
        this.radioTipoDiasML.checked = true;
        this.toggleTipoCantidadMedicinaLaboral();
    }

    restaurarBotonGuardarMedicinaLaboral() {
        this.botonGuardarMedicinaLaboral.disabled = false;
        this.botonGuardarMedicinaLaboral.textContent = '🏥 Registrar Medicina Laboral';
        this.botonGuardarMedicinaLaboral.style.background = 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)';
    }

    exportarArrayAExcel(arrayDeFilas, nombreArchivo = 'export.xlsx', encabezados = null) {
        try {
            const datos = [];

            // Si recibimos un array de objetos y no se proporcionaron encabezados,
            // inferimos encabezados desde las claves del primer objeto.
            let filasProcesadas = [];
            if (arrayDeFilas.length > 0 && typeof arrayDeFilas[0] === 'object' && !Array.isArray(arrayDeFilas[0])) {
                if (!encabezados || !Array.isArray(encabezados)) {
                    encabezados = Object.keys(arrayDeFilas[0]);
                }
                filasProcesadas = arrayDeFilas.map(obj => encabezados.map(k => obj[k] ?? ''));
            } else {
                filasProcesadas = arrayDeFilas.map(f => {
                    if (Array.isArray(f)) return f;
                    if (typeof f === 'object' && f !== null) return Object.values(f);
                    return [f];
                });
            }

            if (encabezados && Array.isArray(encabezados)) {
                datos.push(encabezados);
            }

            filasProcesadas.forEach(r => datos.push(r));

            const ws = XLSX.utils.aoa_to_sheet(datos);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Datos');

            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = nombreArchivo;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Error exportando a Excel:', e);
            alert('Ocurrió un error al exportar a Excel. Revisa la consola.');
        }
    }

    exportarVacacionesExcel() {
        if (!this.vacacionesFiltradas || this.vacacionesFiltradas.length === 0) {
            alert('No hay datos de vacaciones para exportar');
            return;
        }
        // Usar encabezados de la hoja si están disponibles
        const encabezados = this.encabezadosVacaciones || null;
        this.exportarArrayAExcel(this.vacacionesFiltradas, `vacaciones_${(new Date()).toISOString().slice(0, 10)}.xlsx`, encabezados);
    }

    exportarBajasExcel() {
        if (!this.bajasFiltradas || this.bajasFiltradas.length === 0) {
            alert('No hay datos de bajas para exportar');
            return;
        }
        const encabezados = null; // no siempre hay encabezados almacenados
        this.exportarArrayAExcel(this.bajasFiltradas, `bajas_${(new Date()).toISOString().slice(0, 10)}.xlsx`, encabezados);
    }

    exportarPersonalActivoExcel() {
        if (!this.personalActivoFiltrado || this.personalActivoFiltrado.length === 0) {
            alert('No hay datos de personal activo para exportar');
            return;
        }
        const encabezados = null;
        this.exportarArrayAExcel(this.personalActivoFiltrado, `personal_activo_${(new Date()).toISOString().slice(0, 10)}.xlsx`, encabezados);
    }
}

const gestorRecibos = new GestorRecibos();