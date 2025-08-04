class GestorRecibos {
    constructor() {
        this.ID_HOJA = '1TlxZvRKolH7K3cGr_JskyJkND16tm0URdB0tI2G2pQo';
        this.CLAVE_API = 'AIzaSyDMyL1stX-QSMHPvuQAp93ipegoEYdg1mI';
        this.HOJA_USUARIOS = 'Usuarios';
        
        this.usuarios = {};
        this.usuarioActual = null;
        this.recibosFiltrados = [];
        this.todosLosRecibos = [];

        this.selectorDependencia = null;
        this.botonCargar = null;
        this.cargando = null;
        this.contenedorRecibos = null;
        this.inputLegajo = null;

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
}

const gestorRecibos = new GestorRecibos();