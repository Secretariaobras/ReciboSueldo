class GestorRecibos {
    constructor() {
        this.ID_HOJA = '1TlxZvRKolH7K3cGr_JskyJkND16tm0URdB0tI2G2pQo';
        this.CLAVE_API = 'AIzaSyDMyL1stX-QSMHPvuQAp93ipegoEYdg1mI';
        this.HOJA_USUARIOS = 'Usuarios';
        this.HOJA_VACACIONES = 'Vacaciones';
        this.HOJA_BAJAS = 'Bajas Sin Cubrir';
        this.HOJA_PersonalActivo = 'Personal Activo';

        this.usuarios = {};
        this.usuarioActual = null;
        
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

        this.inicializar();
    }

    async inicializar() {
        try {
            await this.cargarUsuarios();
            this.mostrarLogin();
        } catch (error) {
            document.body.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: Arial, sans-serif; color: white; text-align: center;">
                    <div style="background: rgba(255,255,255,0.1); padding: 40px; border-radius: 15px; backdrop-filter: blur(10px);">
                        <h2>❌ Error de conexión</h2>
                        <p>No se pudieron cargar los usuarios del sistema.</p>
                        <p>Verifica tu conexión a internet y la configuración de la hoja de cálculo.</p>
                        <button onclick="location.reload()" style="padding: 10px 20px; background: white; color: #667eea; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin-top: 20px;">
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
            <div class="login-container" style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: Arial, sans-serif;">
                <div class="login-form" style="background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); width: 350px; text-align: center;">
                    <h2 style="color: #333; margin-bottom: 30px; font-size: 28px;">Sistema de Recibos</h2>
                    <p style="color: #666; margin-bottom: 25px;">Inicia sesión para acceder</p>
                    
                    <form id="loginForm">
                        <div style="margin-bottom: 20px; text-align: left;">
                            <label style="color: #555; font-weight: bold;">Usuario:</label>
                            <input type="text" id="username" required style="width: 100%; padding: 12px; border: 2px solid #e1e1e1; border-radius: 8px; font-size: 16px; margin-top: 5px; box-sizing: border-box;">
                        </div>
                        <div style="margin-bottom: 25px; text-align: left;">
                            <label style="color: #555; font-weight: bold;">Contraseña:</label>
                            <input type="password" id="password" required style="width: 100%; padding: 12px; border: 2px solid #e1e1e1; border-radius: 8px; font-size: 16px; margin-top: 5px; box-sizing: border-box;">
                        </div>
                        <button type="submit" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">
                            Ingresar
                        </button>
                    </form>
                    
                    <div id="loginError" style="color: #e74c3c; text-align: center; margin-top: 15px; font-weight: bold;"></div>
                </div>
            </div>
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
            <div class="container" style="max-width: 800px; margin: 0 auto; padding: 20px; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;">
                <div style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); text-align: center; width: 100%;">
                    ${this.obtenerHTMLHeaderMenu()}
                    
                    <h1 style="color: #333; margin-bottom: 30px; font-size: 32px;">🏢 Sistema de Gestión</h1>
                    
                    <div class="menu-options" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 30px;">
                        <button onclick="gestorRecibos.mostrarModuloRecibos()" class="menu-btn" style="padding: 30px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 15px; font-size: 18px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                            📋<br>Recibos de Sueldo
                        </button>
                        
                        <button onclick="gestorRecibos.mostrarModuloVacaciones()" class="menu-btn" style="padding: 30px 20px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; border: none; border-radius: 15px; font-size: 18px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                            🏖️<br>Vacaciones
                        </button>
                        
                        <button onclick="gestorRecibos.mostrarModuloBajas()" class="menu-btn" style="padding: 30px 20px; background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; border: none; border-radius: 15px; font-size: 18px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                            ⚠️<br>Bajas Sin Cubrir
                        </button>
                        
                        <button onclick="gestorRecibos.mostrarModuloPersonalActivo()" class="menu-btn" style="padding: 30px 20px; background: linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%); color: white; border: none; border-radius: 15px; font-size: 18px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                            👥<br>Personal Activo
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    obtenerHTMLHeaderMenu() {
        return `
            <div class="user-info" style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 20px; border-radius: 8px; margin-bottom: 20px;">
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

    mostrarModuloRecibos() {
        document.body.innerHTML = this.obtenerHTMLInterfaz();
        this.inicializarReferenciasDOM();
        this.configurarEventos();
        this.cargarDependenciasRestringidas();
    }

    obtenerHTMLInterfaz() {
        return `
            <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
                <div class="header" style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
                    ${this.obtenerHTMLHeader()}
                    ${this.obtenerHTMLControles()}
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="gestorRecibos.mostrarMenuPrincipal()" style="padding: 8px 15px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                            ⬅️ Volver al Menú Principal
                        </button>
                    </div>
                </div>
                
                <div id="loading" style="display: none; text-align: center; padding: 40px; font-size: 18px; color: #667eea;">
                    ⏳ Cargando recibos...
                </div>
                
                <div id="recibosContainer"></div>
            </div>
        `;
    }

    obtenerHTMLHeader() {
        return `
            <div class="user-info" style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 20px; border-radius: 8px; margin-bottom: 20px;">
                <div>
                    <strong>👤 ${this.usuarioActual.username}</strong>
                    <br>
                    <small>${this.usuarioActual.dependencia || 'Super Administrador'}</small>
                </div>
                <button onclick="gestorRecibos.cerrarSesion()" style="background-color: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                    🚪 Cerrar Sesión
                </button>
            </div>
            
            <h1 style="text-align: center; color: #333; margin-bottom: 20px;">📋 Sistema de Gestión de Recibos</h1>
        `;
    }

    obtenerHTMLControles() {
        return `
            <div class="controls" style="display: flex; gap: 15px; align-items: center; justify-content: center; flex-wrap: wrap;">
                <select id="dependenciaSelect" style="padding: 10px; border: 2px solid #e1e1e1; border-radius: 5px; font-size: 16px; min-width: 200px;">
                    <option value="">Selecciona una dependencia</option>
                </select>
                
                <input type="text" id="legajoInput" placeholder="Filtrar por legajo..." style="padding: 10px; border: 2px solid #e1e1e1; border-radius: 5px; font-size: 16px; min-width: 150px;">
                
                <button id="loadBtn" style="padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; font-weight: bold;">
                    📥 Cargar Recibos
                </button>
                
                <button id="clearBtn" style="padding: 10px 15px; background: #6c757d; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
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
    }

    configurarEventos() {
        this.botonCargar.addEventListener('click', () => this.cargarRecibos());
        this.inputLegajo.addEventListener('input', () => this.filtrarPorLegajo());
        document.getElementById('clearBtn').addEventListener('click', () => this.limpiarFiltros());
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
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.ID_HOJA}/values/${rango}?key=${this.CLAVE_API}`;
        const respuesta = await fetch(url);

        if (!respuesta.ok) {
            throw new Error(`Error: ${respuesta.status}`);
        }

        return await respuesta.json();
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
            const filas = datos.values.slice(2);

            this.todosLosRecibos = filas.filter(fila => fila[4] === dependenciaSeleccionada);

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
        recibos.forEach((recibo, indice) => {
            const tarjetaRecibo = this.crearTarjetaRecibo(recibo, encabezados, indice);
            this.contenedorRecibos.appendChild(tarjetaRecibo);
        });
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
            <div class="recibo-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
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
                        <div style="color: #333; flex: 2; text-align: right;">${recibo[i] || 'N/A'}</div>
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
            <div style="text-align: center; color: #e74c3c; font-size: 18px; padding: 40px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                ❌ ${mensaje}
            </div>
        `;
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
                <div class="header" style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
                    ${this.obtenerHTMLHeaderVacaciones()}
                    ${this.obtenerHTMLControlesVacaciones()}
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="gestorRecibos.mostrarMenuPrincipal()" style="padding: 8px 15px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
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
        return `
            <div class="user-info" style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 20px; border-radius: 8px; margin-bottom: 20px;">
                <div>
                    <strong>👤 ${this.usuarioActual.username}</strong>
                    <br>
                    <small>${this.usuarioActual.dependencia || 'Super Administrador'}</small>
                </div>
                <button onclick="gestorRecibos.cerrarSesion()" style="background-color: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                    🚪 Cerrar Sesión
                </button>
            </div>
            
            <h1 style="text-align: center; color: #333; margin-bottom: 20px;">🏖️ Sistema de Gestión de Vacaciones</h1>
        `;
    }

    obtenerHTMLControlesVacaciones() {
        return `
            <div class="controls" style="display: flex; gap: 15px; align-items: center; justify-content: center; flex-wrap: wrap;">
                <select id="dependenciaSelectVacaciones" style="padding: 10px; border: 2px solid #e1e1e1; border-radius: 5px; font-size: 16px; min-width: 200px;">
                    <option value="">Selecciona una dependencia</option>
                </select>
                
                <input type="text" id="legajoInputVacaciones" placeholder="Filtrar por legajo..." style="padding: 10px; border: 2px solid #e1e1e1; border-radius: 5px; font-size: 16px; min-width: 150px;">
                
                <button id="loadBtnVacaciones" style="padding: 10px 20px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; font-weight: bold;">
                    🏖️ Cargar Vacaciones
                </button>
                
                <button id="clearBtnVacaciones" style="padding: 10px 15px; background: #6c757d; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
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
        this.inputLegajoVacaciones.addEventListener('input', () => this.filtrarPorLegajoVacaciones());
        document.getElementById('clearBtnVacaciones').addEventListener('click', () => this.limpiarFiltrosVacaciones());
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
            const datos = await this.obtenerDatosHoja(`${this.HOJA_VACACIONES}!A:G`);

            if (!datos.values || datos.values.length <= 1) {
                this.mostrarErrorVacaciones('No se encontraron datos de vacaciones');
                return;
            }

            const encabezados = datos.values[0];
            const filas = datos.values.slice(1);

            this.todasLasVacaciones = filas.filter(fila => fila[2] === dependenciaSeleccionada);

            if (this.todasLasVacaciones.length === 0) {
                this.mostrarErrorVacaciones('No se encontraron vacaciones para esta dependencia');
                return;
            }

            this.aplicarFiltrosVacaciones();
            this.renderizarVacaciones(this.vacacionesFiltradas, encabezados);

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
            const encabezados = ['Legajo', 'Nombre', 'Fecha Inicio', 'Fecha Fin', 'Dependencia'];
            this.renderizarVacaciones(this.vacacionesFiltradas, encabezados);
        }
    }

    limpiarFiltrosVacaciones() {
        this.inputLegajoVacaciones.value = '';
        
        if (this.todasLasVacaciones && this.todasLasVacaciones.length > 0) {
            this.vacacionesFiltradas = [...this.todasLasVacaciones];
            const encabezados = ['Legajo', 'Nombre', 'Fecha Inicio', 'Fecha Fin', 'Dependencia'];
            this.contenedorVacaciones.innerHTML = '';
            this.renderizarVacaciones(this.vacacionesFiltradas, encabezados);
        }
    }

    renderizarVacaciones(vacaciones, encabezados) {
        vacaciones.forEach((vacacion, indice) => {
            const tarjetaVacacion = this.crearTarjetaVacacion(vacacion, encabezados, indice);
            this.contenedorVacaciones.appendChild(tarjetaVacacion);
        });
    }

    crearTarjetaVacacion(vacacion, encabezados, indice) {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'vacacion-card';
        tarjeta.style.cssText = `
            background: white;
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
            <div class="vacacion-header" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
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
                        <div style="color: #333; flex: 2; text-align: right;">${vacacion[i] || 'N/A'}</div>
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
            <div style="text-align: center; color: #e74c3c; font-size: 18px; padding: 40px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
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
                <div class="header" style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
                    ${this.obtenerHTMLHeaderBajas()}
                    ${this.obtenerHTMLControlesBajas()}
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="gestorRecibos.mostrarMenuPrincipal()" style="padding: 8px 15px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
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
        return `
            <div class="user-info" style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 15px 20px; border-radius: 8px; margin-bottom: 20px;">
                <div>
                    <strong>👤 ${this.usuarioActual.username}</strong>
                    <br>
                    <small>${this.usuarioActual.dependencia || 'Super Administrador'}</small>
                </div>
                <button onclick="gestorRecibos.cerrarSesion()" style="background-color: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                    🚪 Cerrar Sesión
                </button>
            </div>
            
            <h1 style="text-align: center; color: #333; margin-bottom: 20px;">⚠️ Sistema de Gestión de Bajas Sin Cubrir</h1>
        `;
    }

    obtenerHTMLControlesBajas() {
        return `
            <div class="controls" style="display: flex; gap: 15px; align-items: center; justify-content: center; flex-wrap: wrap;">
                <select id="dependenciaSelectBajas" style="padding: 10px; border: 2px solid #e1e1e1; border-radius: 5px; font-size: 16px; min-width: 200px;">
                    <option value="">Selecciona una dependencia</option>
                </select>
                
                <input type="text" id="legajoInputBajas" placeholder="Filtrar por legajo..." style="padding: 10px; border: 2px solid #e1e1e1; border-radius: 5px; font-size: 16px; min-width: 150px;">
                
                <button id="loadBtnBajas" style="padding: 10px 20px; background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; font-weight: bold;">
                    ⚠️ Cargar Bajas
                </button>
                
                <button id="clearBtnBajas" style="padding: 10px 15px; background: #6c757d; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
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
        this.inputLegajoBajas.addEventListener('input', () => this.filtrarPorLegajoBajas());
        document.getElementById('clearBtnBajas').addEventListener('click', () => this.limpiarFiltrosBajas());
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
            const filas = datos.values.slice(1);

            this.todasLasBajas = filas.filter(fila => fila[5] === dependenciaSeleccionada);

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
        bajas.forEach((baja, indice) => {
            const tarjetaBaja = this.crearTarjetaBaja(baja, encabezados, indice);
            this.contenedorBajas.appendChild(tarjetaBaja);
        });
    }

    crearTarjetaBaja(baja, encabezados, indice) {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'baja-card';
        tarjeta.style.cssText = `
            background: white;
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
            <div class="baja-header" style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
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
                        <div style="color: #333; flex: 2; text-align: right;">${baja[i] || 'N/A'}</div>
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
            <div style="text-align: center; color: #e74c3c; font-size: 18px; padding: 40px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                ❌ ${mensaje}
            </div>
        `;
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
                <div class="header" style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
                    ${this.obtenerHTMLHeaderPersonalActivo()}
                    ${this.obtenerHTMLControlesPersonalActivo()}
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="gestorRecibos.mostrarMenuPrincipal()" style="padding: 8px 15px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
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
        return `
            <div class="user-info" style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%); color: white; padding: 15px 20px; border-radius: 8px; margin-bottom: 20px;">
                <div>
                    <strong>👤 ${this.usuarioActual.username}</strong>
                    <br>
                    <small>${this.usuarioActual.dependencia || 'Super Administrador'}</small>
                </div>
                <button onclick="gestorRecibos.cerrarSesion()" style="background-color: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                    🚪 Cerrar Sesión
                </button>
            </div>
            
            <h1 style="text-align: center; color: #333; margin-bottom: 20px;">👥 Sistema de Gestión de Personal Activo</h1>
        `;
    }

    obtenerHTMLControlesPersonalActivo() {
        return `
            <div class="controls" style="display: flex; gap: 15px; align-items: center; justify-content: center; flex-wrap: wrap;">
                <select id="dependenciaSelectPersonalActivo" style="padding: 10px; border: 2px solid #e1e1e1; border-radius: 5px; font-size: 16px; min-width: 200px;">
                    <option value="">Selecciona una dependencia</option>
                </select>
                
                <input type="text" id="legajoInputPersonalActivo" placeholder="Filtrar por legajo..." style="padding: 10px; border: 2px solid #e1e1e1; border-radius: 5px; font-size: 16px; min-width: 150px;">
                
                <button id="loadBtnPersonalActivo" style="padding: 10px 20px; background: linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%); color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; font-weight: bold;">
                    👥 Cargar Personal
                </button>
                
                <button id="clearBtnPersonalActivo" style="padding: 10px 15px; background: #6c757d; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
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
        this.inputLegajoPersonalActivo.addEventListener('input', () => this.filtrarPorLegajoPersonalActivo());
        document.getElementById('clearBtnPersonalActivo').addEventListener('click', () => this.limpiarFiltrosPersonalActivo());
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
            const filas = datos.values.slice(1);

            this.todosLosPersonalActivo = filas.filter(fila => fila[3] === dependenciaSeleccionada);

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
        personal.forEach((persona, indice) => {
            const tarjetaPersona = this.crearTarjetaPersonalActivo(persona, encabezados, indice);
            this.contenedorPersonalActivo.appendChild(tarjetaPersona);
        });
    }

    crearTarjetaPersonalActivo(persona, encabezados, indice) {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'personal-activo-card';
        tarjeta.style.cssText = `
            background: white;
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
        
        // Color del estado basado en el valor
        let estadoColor = '#28a745'; // Verde por defecto (activo)
        if (estado.toLowerCase().includes('inactivo') || estado.toLowerCase().includes('baja')) {
            estadoColor = '#dc3545'; // Rojo
        } else if (estado.toLowerCase().includes('licencia') || estado.toLowerCase().includes('suspendido')) {
            estadoColor = '#ffc107'; // Amarillo
        }
        
        return `
            <div class="personal-activo-header" style="background: linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%); color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
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
                
                // Formatear el estado con color
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
                        <div style="color: #333; flex: 2; text-align: right;">${valor}</div>
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
            <div style="text-align: center; color: #e74c3c; font-size: 18px; padding: 40px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                ❌ ${mensaje}
            </div>
        `;
    }
}

const gestorRecibos = new GestorRecibos();