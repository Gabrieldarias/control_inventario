const { useState, useEffect } = React;

// ===== UTILIDADES Y HELPERS =====

// Decodificar token JWT
function decodeToken(token) {
  try {
    const parts = token.split('.');
    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch (e) {
    return null;
  }
}

function getErrorMessage(error) {
  if (error && error.response && error.response.data && error.response.data.error) {
    return error.response.data.error;
  }
  if (error && error.message) {
    return error.message;
  }
  return 'Error desconocido';
}

function api() {
  // Obtener URL base de variable de entorno o usar la URL actual
  const getBaseUrl = () => {
    // Si hay REACT_APP_API_URL en variables de entorno
    if (typeof REACT_APP_API_URL !== 'undefined') {
      return REACT_APP_API_URL + '/api';
    }
    
    // Si está en Vercel o producción
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.origin + '/api';
    }
    
    // En desarrollo local
    return 'http://localhost:3001/api';
  };
  
  const base = getBaseUrl();
  const token = localStorage.getItem('token');
  
  // Debug: Verificar token
  console.log('🔑 Token en localStorage:', token ? 'Presente' : 'Ausente');
  console.log('🌐 API Base URL:', base);
  
  // Validar que el token exista y no esté expirado
  if (token) {
    const decoded = decodeToken(token);
    if (decoded && decoded.exp) {
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = decoded.exp - now;
      console.log('⏱️ Token expira en:', Math.floor(timeLeft / 60), 'minutos');
      
      if (decoded.exp < now) {
        console.warn('⚠️ Token expirado. Cerrando sesión...');
        localStorage.removeItem('token');
        window.location.reload();
        return {};
      }
    } else {
      console.warn('⚠️ Token inválido. No se pudo decodificar.');
    }
  } else {
    console.warn('⚠️ No hay token en localStorage.');
  }
  
  const headers = token ? { Authorization: 'Bearer ' + token } : {};
  
  console.log('📤 Headers configurados:', headers.Authorization ? 'Con Authorization' : 'Sin Authorization');
  
  // Crear una instancia de axios con configuración base
  const axiosInstance = axios.create({
    baseURL: base,
    headers: headers
  });
  
  // Interceptor para manejar errores 401
  axiosInstance.interceptors.response.use(
    function(response) {
      return response;
    },
    function(error) {
      if (error.response && error.response.status === 401) {
        console.error('❌ Error 401: No autorizado. Token inválido o expirado.');
        console.error('📍 URL:', error.config.url);
        console.error('📋 Headers enviados:', error.config.headers);
        localStorage.removeItem('token');
        alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        window.location.reload();
      }
      return Promise.reject(error);
    }
  );
  
  return {
    login: (email, password) => axios.post(base + '/auth/login', { email, password }),
    
    // Inventario
    getProductos: (filtros) => axiosInstance.get('/inventory/productos', { params: filtros }),
    crearProducto: (data) => axiosInstance.post('/inventory/productos', data),
    actualizarProducto: (id, data) => axiosInstance.put('/inventory/productos/' + id, data),
    eliminarProducto: (id) => axiosInstance.delete('/inventory/productos/' + id),
    obtenerProducto: (id) => axiosInstance.get('/inventory/productos/' + id),
    buscarProductos: (q) => axiosInstance.get('/inventory/productos/buscar/termino', { params: { q } }),
    
    getCategorias: () => axiosInstance.get('/inventory/categorias'),
    crearCategoria: (data) => axiosInstance.post('/inventory/categorias', data),
    
    crearLote: (data) => axiosInstance.post('/inventory/lotes', data),
    actualizarLote: (loteId, data) => axiosInstance.put('/inventory/lotes/' + loteId, data),
    getLotes: (productoId) => axiosInstance.get('/inventory/lotes/' + productoId),
    
    registrarMovimiento: (data) => axiosInstance.post('/inventory/movimientos', data),
    getMovimientos: (filtros) => axiosInstance.get('/inventory/movimientos', { params: filtros }),
    
    getAlertas: (filtros) => axiosInstance.get('/inventory/alertas', { params: filtros }),
    resolverAlerta: (id) => axiosInstance.put('/inventory/alertas/' + id + '/resolver', {}),
    
    actualizarPrecio: (productoId, data) => axiosInstance.put('/inventory/productos/' + productoId + '/precio', data),
    getHistorialPrecios: (productoId) => axiosInstance.get('/inventory/productos/' + productoId + '/historial-precios'),
    
    getReporteStock: () => axiosInstance.get('/inventory/reportes/stock-actual'),
    getReporteRotacion: (dias) => axiosInstance.get('/inventory/reportes/rotacion', { params: { dias } }),
    getReporteValorizacion: () => axiosInstance.get('/inventory/reportes/valorizacion'),
    getReporteVentas: (from, to) => axiosInstance.get('/sales', { params: { from, to } }),
    getDetalleVenta: (id) => axiosInstance.get('/sales/' + id),
    
    // Ventas
    crearVenta: (data) => axiosInstance.post('/sales', data),
    
    getProveedores: () => axiosInstance.get('/inventory/proveedores'),
    crearProveedor: (data) => axiosInstance.post('/inventory/proveedores', data),
    
    // Compras
    crearCompra: (data) => axiosInstance.post('/compras', data),
    listarCompras: (filtros) => axiosInstance.get('/compras', { params: filtros }),
    obtenerCompra: (id) => axiosInstance.get('/compras/' + id),
    
    // Devoluciones
    crearDevolucion: (data) => axiosInstance.post('/devoluciones', data),
    listarDevoluciones: (filtros) => axiosInstance.get('/devoluciones', { params: filtros }),
    
    // Usuarios
    listarUsuarios: () => axiosInstance.get('/usuarios'),
    crearUsuario: (data) => axiosInstance.post('/usuarios', data),
    actualizarUsuario: (id, data) => axiosInstance.put('/usuarios/' + id, data),
    eliminarUsuario: (id) => axiosInstance.delete('/usuarios/' + id),
    
    // Configuración
    getConfiguracion: () => axiosInstance.get('/configuracion'),
    getConfiguracionClave: (clave) => axiosInstance.get('/configuracion/' + clave),
    setConfiguracion: (clave, valor) => axiosInstance.put('/configuracion/' + clave, { valor }),
    
    importarProductos: (datos) => axiosInstance.post('/inventory/importar', { datos }),
    exportarInventario: () => axiosInstance.get('/inventory/exportar', { responseType: 'blob' })
  };
}

// ===== COMPONENTES DE UTILIDAD =====

function Modal(props) {
  const titulo = props.titulo;
  const children = props.children;
  const onClose = props.onClose;
  
  return React.createElement('div', { className: 'modal-overlay', onClick: onClose },
    React.createElement('div', { className: 'modal-content', onClick: function(e) { e.stopPropagation(); } },
      React.createElement('div', { className: 'modal-header' },
        React.createElement('h3', null, titulo),
        React.createElement('button', { className: 'btn-close', onClick: onClose }, '×')
      ),
      React.createElement('div', { className: 'modal-body' },
        children
      )
    )
  );
}

function AlertBox(props) {
  const tipo = props.tipo;
  const mensaje = props.mensaje;
  const className = 'alert alert-' + tipo;
  return React.createElement('div', { className: className }, mensaje);
}

// ===== CONTROL DE ACCESO =====

// Componente ProtectedRoute - Solo permite acceso según rol
function ProtectedRoute(props) {
  const children = props.children;
  const rolesPermitidos = props.roles; // ['admin'] o ['vendedor'] o ['admin', 'vendedor']
  const usuario = props.usuario;
  
  if (!usuario) {
    return React.createElement('div', { className: 'alert alert-danger' }, 'Debe iniciar sesión');
  }
  
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.role)) {
    return React.createElement('div', { className: 'alert alert-danger' }, 
      '❌ Acceso denegado. Rol requerido: ' + rolesPermitidos.join(', ')
    );
  }
  
  return children;
}

// Función para verificar permisos
function tienePermiso(usuario, modulo) {
  if (!usuario) return false;
  
  // Normalizar el rol (admin/administrador)
  const role = usuario.role || usuario.rol || '';
  const isAdmin = role === 'admin' || role === 'administrador';
  
  if (isAdmin) return true; // Admin tiene acceso a todo
  
  // Vendedor solo acceso a: ventas, devoluciones
  const modulosVendedor = ['ventas', 'devoluciones'];
  if (role === 'vendedor') {
    return modulosVendedor.includes(modulo);
  }
  
  return false;
}

// ===== SIDEBAR RETRÁCTIL =====

function Sidebar(props) {
  const usuario = props.usuario;
  const tabActiva = props.tabActiva;
  const setTabActiva = props.setTabActiva;
  const onLogout = props.onLogout;
  const isOpen = props.isOpen;
  const onClose = props.onClose;
  const sidebarRef = React.useRef(null);
  
  // Cerrar sidebar cuando cambia de pestaña
  React.useEffect(function() {
    if (isOpen) {
      onClose();
    }
  }, [tabActiva]);
  
  // Detectar click fuera del sidebar
  React.useEffect(function() {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        if (isOpen) {
          onClose();
        }
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return function() {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);
  
  // Menú items basado en rol
  const getMenuItems = function() {
    const items = [
      { id: 'ventas', label: 'Ventas', icon: '💰', roles: ['admin', 'vendedor'] },
      { id: 'devoluciones', label: 'Devoluciones', icon: '↩️', roles: ['admin', 'vendedor'] }
    ];
    
    if (usuario && usuario.role === 'admin') {
      items.push(
        { id: 'productos', label: 'Productos', icon: '📦', roles: ['admin'] },
        { id: 'categorias', label: 'Categorías', icon: '📂', roles: ['admin'] },
        { id: 'lotes', label: 'Lotes', icon: '📋', roles: ['admin'] },
        { id: 'proveedores', label: 'Proveedores', icon: '🏭', roles: ['admin'] },
        { id: 'compras', label: 'Compras', icon: '📥', roles: ['admin'] },
        { id: 'reportes', label: 'Reportes', icon: '📊', roles: ['admin'] },
        { id: 'alertas', label: 'Alertas', icon: '🔔', roles: ['admin'] },
        { id: 'usuarios', label: 'Usuarios', icon: '👥', roles: ['admin'] },
        { id: 'configuracion', label: 'Configuración', icon: '⚙️', roles: ['admin'] }
      );
    }
    
    return items;
  };
  
  const menuItems = getMenuItems();
  const sidebarClass = 'sidebar ' + (isOpen ? 'open' : 'closed');
  
  return React.createElement('div', null,
    // Overlay
    isOpen && React.createElement('div', { 
      className: 'sidebar-overlay',
      onClick: onClose
    }),
    
    // Sidebar
    React.createElement('div', { 
      ref: sidebarRef,
      className: sidebarClass
    },
      React.createElement('div', { className: 'sidebar-header' },
        React.createElement('div', { className: 'sidebar-logo' }, isOpen ? '🏪 TIENDA' : '🏪')
      ),
      
      React.createElement('nav', { className: 'sidebar-nav' },
        menuItems.map(function(item) {
          return React.createElement('button', {
            key: item.id,
            className: 'sidebar-item ' + (tabActiva === item.id ? 'active' : ''),
            onClick: function() { setTabActiva(item.id); },
            title: item.label
          },
            React.createElement('span', { className: 'sidebar-icon' }, item.icon),
            React.createElement('span', { className: 'sidebar-label' }, item.label)
          );
        })
      ),
      
      React.createElement('div', { className: 'sidebar-footer' },
        React.createElement('div', { className: 'sidebar-user' },
          React.createElement('div', { className: 'sidebar-user-avatar' }, usuario ? (usuario.nombre || usuario.name || 'U').charAt(0).toUpperCase() : 'U'),
          React.createElement('div', { className: 'sidebar-user-info' },
            React.createElement('div', { className: 'sidebar-user-name' }, usuario ? (usuario.nombre || usuario.name || 'Usuario') : 'Usuario'),
            React.createElement('div', { className: 'sidebar-user-role' }, usuario ? (usuario.role || usuario.rol || 'user') : 'user')
          )
        ),
        React.createElement('button', {
          className: 'btn btn-danger sidebar-logout',
          onClick: onLogout,
          title: 'Cerrar sesión'
        },
          React.createElement('span', null, 'Cerrar sesión')
        )
      )
    )
  );
}

// ===== LOGIN =====

function Login(props) {
  const onLogin = props.onLogin;
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('adminpass');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Iniciando login con Supabase Auth...');
      
      // Verificar que supabaseAuth esté disponible
      if (!window.supabaseAuth || !window.supabaseAuth.login) {
        throw new Error('Supabase Auth no está configurado. Verifica que supabaseClient.js esté cargado.');
      }
      
      // Login con Supabase Auth
      const result = await window.supabaseAuth.login(email, password);
      
      if (result.success) {
        console.log('✅ Login exitoso');
        // Guardar token en localStorage
        localStorage.setItem('token', result.token);
        
        // Guardar info del usuario
        localStorage.setItem('user', JSON.stringify({
          id: result.user.id,
          email: result.user.email,
          role: result.user.user_metadata?.role || 'vendedor'
        }));
        
        onLogin();
      } else {
        throw new Error(result.error || 'Error desconocido en login');
      }
    } catch (err) {
      console.error('❌ Error en login:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return React.createElement('div', { className: 'login-container' },
    React.createElement('div', { className: 'login-box' },
      React.createElement('h1', null, '🏪 Sistema Tienda'),
      React.createElement('h2', null, 'Gestión de Inventario'),
      error && React.createElement(AlertBox, { tipo: 'danger', mensaje: error }),
      React.createElement('form', { onSubmit: submit },
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Email'),
          React.createElement('input', { 
            className: 'input', 
            type: 'email',
            value: email, 
            onChange: function(e) { setEmail(e.target.value); },
            disabled: loading
          })
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Contraseña'),
          React.createElement('input', { 
            className: 'input', 
            type: 'password',
            value: password, 
            onChange: function(e) { setPassword(e.target.value); },
            disabled: loading
          })
        ),
        React.createElement('button', { 
          className: 'btn btn-primary btn-large',
          type: 'submit',
          disabled: loading
        }, loading ? 'Ingresando...' : 'Ingresar')
      ),
      React.createElement('div', { className: 'login-info' },
        React.createElement('p', null, '📝 Demo:'),
        React.createElement('p', null, 'Admin: admin@example.com / adminpass'),
        React.createElement('p', null, 'Vendedor: vendedor@example.com / vendedorpass')
      )
    )
  );
}

// ===== GESTIÓN DE CATEGORÍAS =====

function GestionCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [productosPorCategoria, setProductosPorCategoria] = useState({});
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [mensaje, setMensaje] = useState('');

  useEffect(function() {
    cargarCategorias();
  }, []);

  function cargarCategorias() {
    api().getCategorias()
      .then(function(res) {
        setCategorias(res.data || []);
        setMensaje('');
      })
      .catch(function(err) {
        setMensaje('Error: ' + getErrorMessage(err));
      });
  }

  function cargarProductosCategoria(categoriaId) {
    api().getProductos({ categoria_id: categoriaId })
      .then(function(res) {
        setProductosPorCategoria(Object.assign({}, productosPorCategoria, { 
          [categoriaId]: res.data || [] 
        }));
      })
      .catch(function(err) {
        setMensaje('Error al cargar productos: ' + getErrorMessage(err));
      });
  }

  function toggleCategoria(categoria) {
    if (expandedCategoryId === categoria.id) {
      setExpandedCategoryId(null);
    } else {
      setExpandedCategoryId(categoria.id);
      if (!productosPorCategoria[categoria.id]) {
        cargarProductosCategoria(categoria.id);
      }
    }
  }

  function guardarCategoria(e) {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setMensaje('El nombre es requerido');
      return;
    }

    api().crearCategoria(formData)
      .then(function(res) {
        setMensaje('✓ Categoría guardada correctamente');
        setShowModal(false);
        setFormData({ nombre: '', descripcion: '' });
        setEditando(null);
        cargarCategorias();
      })
      .catch(function(err) {
        setMensaje('Error: ' + getErrorMessage(err));
      });
  }

  function abrirModal() {
    setEditando(null);
    setFormData({ nombre: '', descripcion: '' });
    setShowModal(true);
  }

  function editar(categoria) {
    setEditando(categoria);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || ''
    });
    setShowModal(true);
  }

  function eliminar(categoria) {
    if (confirm('¿Estás seguro de que deseas eliminar la categoría "' + categoria.nombre + '"?')) {
      setMensaje('⚠️ Función de eliminar aún no implementada en el backend');
    }
  }

  function obtenerEstadoInventario(stock_actual, stock_minimo, stock_maximo) {
    if (stock_actual <= 0) return { label: 'Agotado', clase: 'badge-danger' };
    if (stock_actual <= stock_minimo) return { label: 'Bajo', clase: 'badge-warning' };
    if (stock_maximo && stock_actual >= stock_maximo) return { label: 'Lleno', clase: 'badge-info' };
    return { label: 'Normal', clase: 'badge-success' };
  }

  var categoriasCards = categorias.map(function(categoria) {
    var productos = productosPorCategoria[categoria.id] || [];
    var isExpanded = expandedCategoryId === categoria.id;

    var productosRows = productos.map(function(producto) {
      var estado = obtenerEstadoInventario(producto.stock_actual, producto.stock_minimo, producto.stock_maximo);
      return React.createElement('tr', { key: producto.id },
        React.createElement('td', null, producto.nombre),
        React.createElement('td', null, producto.codigo_interno || '-'),
        React.createElement('td', { style: { textAlign: 'right' } }, '$' + (producto.precio_venta || 0).toFixed(2)),
        React.createElement('td', { style: { textAlign: 'center' } }, 
          React.createElement('span', null, producto.stock_actual || 0)
        ),
        React.createElement('td', { style: { textAlign: 'center' } }, 
          React.createElement('span', { className: 'badge ' + estado.clase }, estado.label)
        )
      );
    });

    return React.createElement('div', { key: categoria.id, className: 'categoria-card' },
      React.createElement('div', { className: 'categoria-card-header', onClick: function() { toggleCategoria(categoria); }, style: { cursor: 'pointer' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1 } },
          React.createElement('span', { className: 'categoria-toggle' }, isExpanded ? '▼' : '▶'),
          React.createElement('h3', { className: 'categoria-nombre', style: { margin: 0 } }, categoria.nombre)
        ),
        React.createElement('div', { className: 'categoria-acciones', onClick: function(e) { e.stopPropagation(); } },
          React.createElement('button', { 
            className: 'btn btn-small btn-secondary',
            onClick: function() { editar(categoria); },
            title: 'Editar'
          }, '✏️'),
          React.createElement('button', { 
            className: 'btn btn-small btn-danger',
            onClick: function() { eliminar(categoria); },
            title: 'Eliminar'
          }, '🗑️')
        )
      ),
      React.createElement('div', { className: 'categoria-card-body' },
        React.createElement('p', { className: 'categoria-descripcion' }, categoria.descripcion || 'Sin descripción'),
        isExpanded && React.createElement('div', { className: 'categoria-productos' },
          productos.length === 0 ? 
            React.createElement('p', { style: { textAlign: 'center', color: '#999', margin: '15px 0' } }, 'No hay productos en esta categoría') :
            React.createElement('table', { className: 'table productos-table' },
              React.createElement('thead', null,
                React.createElement('tr', null,
                  React.createElement('th', null, 'Producto'),
                  React.createElement('th', null, 'Código'),
                  React.createElement('th', null, 'Precio'),
                  React.createElement('th', null, 'Stock'),
                  React.createElement('th', null, 'Estado')
                )
              ),
              React.createElement('tbody', null, productosRows)
            )
        )
      )
    );
  });

  return React.createElement('div', { className: 'panel categories-panel' },
    React.createElement('div', { className: 'panel-header' },
      React.createElement('h2', null, '📂 Gestión de Categorías'),
      React.createElement('button', { 
        className: 'btn btn-primary',
        onClick: abrirModal
      }, '➕ Nueva Categoría')
    ),
    
    mensaje && React.createElement('div', { 
      className: 'alert ' + (mensaje.startsWith('✓') ? 'alert-success' : 'alert-danger'),
      style: { margin: '15px 0' }
    }, mensaje),

    categorias.length === 0 ? 
      React.createElement('div', { className: 'empty-state' },
        React.createElement('div', { className: 'empty-icon' }, '📂'),
        React.createElement('h3', null, 'Sin categorías'),
        React.createElement('p', null, 'No hay categorías registradas. ¡Crea una para empezar!'),
        React.createElement('button', { 
          className: 'btn btn-primary',
          onClick: abrirModal
        }, '➕ Crear Categoría')
      ) :
      React.createElement('div', { className: 'categorias-list' }, categoriasCards),

    showModal && React.createElement(Modal, { 
      titulo: editando ? 'Editar Categoría' : 'Nueva Categoría',
      onClose: function() { setShowModal(false); }
    },
      React.createElement('form', { onSubmit: guardarCategoria },
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Nombre *'),
          React.createElement('input', { 
            className: 'input',
            value: formData.nombre,
            onChange: function(e) { setFormData(Object.assign({}, formData, { nombre: e.target.value })); },
            required: true,
            placeholder: 'Ej: Electrónica, Ropa, Alimentos...'
          })
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Descripción'),
          React.createElement('textarea', { 
            className: 'input',
            value: formData.descripcion,
            onChange: function(e) { setFormData(Object.assign({}, formData, { descripcion: e.target.value })); },
            placeholder: 'Descripción de la categoría (opcional)',
            rows: 3
          })
        ),
        React.createElement('div', { className: 'form-actions' },
          React.createElement('button', { type: 'submit', className: 'btn btn-success' }, editando ? 'Actualizar' : 'Guardar'),
          React.createElement('button', { type: 'button', className: 'btn btn-secondary', onClick: function() { setShowModal(false); } }, 'Cancelar')
        )
      )
    )
  );
}

// ===== GESTIÓN DE PRODUCTOS =====

function GestionProductos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    codigo_interno: '',
    categoria_id: '',
    descripcion: '',
    precio_costo: '',
    precio_venta: '',
    stock_minimo: '',
    stock_maximo: '',
    unidad_medida: 'ud'
  });

  useEffect(function() {
    cargarDatos();
  }, []);

  function cargarDatos() {
    setLoading(true);
    Promise.all([
      api().getProductos({ estado: true }),
      api().getCategorias()
    ]).then(function(resultados) {
      setProductos(resultados[0].data);
      setCategorias(resultados[1].data);
      setError(null);
      setLoading(false);
    }).catch(function(e) {
      setError('Error al cargar datos: ' + getErrorMessage(e));
      setLoading(false);
    });
  }

  function guardarProducto(e) {
    e.preventDefault();
    
    // Limpiar datos antes de enviar
    const datosLimpios = Object.assign({}, formData);
    
    // Convertir strings vacías a null para campos opcionales
    if (datosLimpios.categoria_id === '' || datosLimpios.categoria_id === undefined) {
      datosLimpios.categoria_id = null;
    } else {
      datosLimpios.categoria_id = parseInt(datosLimpios.categoria_id);
    }
    
    if (datosLimpios.stock_maximo === '' || datosLimpios.stock_maximo === undefined) {
      datosLimpios.stock_maximo = null;
    } else {
      datosLimpios.stock_maximo = parseInt(datosLimpios.stock_maximo);
    }
    
    if (datosLimpios.descripcion === '') {
      datosLimpios.descripcion = null;
    }
    
    // Convertir números
    datosLimpios.precio_costo = parseFloat(datosLimpios.precio_costo) || 0;
    datosLimpios.precio_venta = parseFloat(datosLimpios.precio_venta) || 0;
    datosLimpios.stock_minimo = parseInt(datosLimpios.stock_minimo) || 5;
    
    const promesa = editando 
      ? api().actualizarProducto(editando.id, datosLimpios)
      : api().crearProducto(datosLimpios);
    
    promesa.then(function() {
      cargarDatos();
      setShowModal(false);
      setFormData({ nombre: '', codigo_interno: '', categoria_id: '', descripcion: '', precio_costo: '', precio_venta: '', stock_minimo: '', stock_maximo: '', unidad_medida: 'ud' });
      setEditando(null);
      setError(null);
    }).catch(function(e) {
      setError('Error al guardar: ' + getErrorMessage(e));
    });
  }

  function eliminar(id) {
    if (!confirm('¿Eliminar producto?')) return;
    api().eliminarProducto(id).then(function() {
      cargarDatos();
    }).catch(function(e) {
      setError('Error: ' + getErrorMessage(e));
    });
  }

  function editar(producto) {
    setEditando(producto);
    setFormData({
      nombre: producto.nombre,
      codigo_interno: producto.codigo_interno,
      categoria_id: producto.categoria_id || '',
      descripcion: producto.descripcion || '',
      precio_costo: producto.precio_costo,
      precio_venta: producto.precio_venta,
      stock_minimo: producto.stock_minimo,
      stock_maximo: producto.stock_maximo || '',
      unidad_medida: producto.unidad_medida || 'ud'
    });
    setShowModal(true);
  }

  const productosFiltrados = productos.filter(function(p) {
    const coincideNombre = p.nombre.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0 || 
                          p.codigo_interno.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0;
    const coincideCategoria = !filtroCategoria || p.categoria_id == parseInt(filtroCategoria);
    return coincideNombre && coincideCategoria;
  });

  const categoriasOpts = categorias.map(function(c) {
    return React.createElement('option', { key: c.id, value: c.id }, c.nombre);
  });

  const productosRows = productosFiltrados.map(function(p) {
    const cat = categorias.find(function(c) { return c.id === p.categoria_id; });
    return React.createElement('tr', { key: p.id },
      React.createElement('td', null, p.codigo_interno),
      React.createElement('td', null, p.nombre),
      React.createElement('td', null, cat ? cat.nombre : '-'),
      React.createElement('td', null, '$' + parseFloat(p.precio_costo).toFixed(2)),
      React.createElement('td', null, '$' + parseFloat(p.precio_venta).toFixed(2)),
      React.createElement('td', null, p.stock_minimo),
      React.createElement('td', null, React.createElement('strong', null, p.stock_total || 0)),
      React.createElement('td', null,
        React.createElement('button', { className: 'btn btn-small btn-secondary', onClick: function() { editar(p); } }, 'Editar'),
        ' ',
        React.createElement('button', { className: 'btn btn-small btn-danger', onClick: function() { eliminar(p.id); } }, 'Eliminar')
      )
    );
  });

  return React.createElement('div', { className: 'panel' },
    React.createElement('div', { className: 'panel-header' },
      React.createElement('h2', null, '📦 Gestión de Productos'),
      React.createElement('button', { className: 'btn btn-success', onClick: function() {
        setEditando(null);
        setFormData({ nombre: '', codigo_interno: '', categoria_id: '', descripcion: '', precio_costo: '', precio_venta: '', stock_minimo: '', stock_maximo: '', unidad_medida: 'ud' });
        setShowModal(true);
      }}, '+ Nuevo Producto')
    ),
    error && React.createElement(AlertBox, { tipo: 'danger', mensaje: error }),
    loading && React.createElement('div', { className: 'spinner' }, 'Cargando...'),
    !loading && React.createElement('div', null,
      React.createElement('div', { className: 'search-bar' },
        React.createElement('input', { 
          className: 'input',
          type: 'text',
          placeholder: 'Buscar por nombre o código...',
          value: searchTerm,
          onChange: function(e) { setSearchTerm(e.target.value); }
        }),
        React.createElement('select', { 
          className: 'input',
          value: filtroCategoria,
          onChange: function(e) { setFiltroCategoria(e.target.value); }
        },
          React.createElement('option', { value: '' }, 'Todas las categorías'),
          categoriasOpts
        )
      ),
      React.createElement('table', { className: 'table' },
        React.createElement('thead', null,
          React.createElement('tr', null,
            React.createElement('th', null, 'Código'),
            React.createElement('th', null, 'Nombre'),
            React.createElement('th', null, 'Categoría'),
            React.createElement('th', null, 'P. Costo'),
            React.createElement('th', null, 'P. Venta'),
            React.createElement('th', null, 'Stock Mín'),
            React.createElement('th', null, 'Stock Total'),
            React.createElement('th', null, 'Acciones')
          )
        ),
        React.createElement('tbody', null, productosRows)
      )
    ),
    showModal && React.createElement(Modal, { 
      titulo: editando ? 'Editar Producto' : 'Nuevo Producto',
      onClose: function() { setShowModal(false); }
    },
      React.createElement('form', { onSubmit: guardarProducto },
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Nombre *'),
          React.createElement('input', { 
            className: 'input',
            value: formData.nombre,
            onChange: function(e) { setFormData(Object.assign({}, formData, { nombre: e.target.value })); },
            required: true
          })
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Código Interno *'),
          React.createElement('input', { 
            className: 'input',
            value: formData.codigo_interno,
            onChange: function(e) { setFormData(Object.assign({}, formData, { codigo_interno: e.target.value })); },
            required: true,
            disabled: !!editando
          })
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Categoría'),
          React.createElement('select', { 
            className: 'input',
            value: formData.categoria_id,
            onChange: function(e) { setFormData(Object.assign({}, formData, { categoria_id: e.target.value })); }
          },
            React.createElement('option', { value: '' }, 'Sin categoría'),
            categoriasOpts
          )
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Descripción'),
          React.createElement('textarea', { 
            className: 'input',
            value: formData.descripcion,
            onChange: function(e) { setFormData(Object.assign({}, formData, { descripcion: e.target.value })); },
            rows: 3
          })
        ),
        React.createElement('div', { className: 'form-row' },
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Precio Costo *'),
            React.createElement('input', { 
              className: 'input',
              type: 'number',
              step: '0.01',
              value: formData.precio_costo,
              onChange: function(e) { setFormData(Object.assign({}, formData, { precio_costo: e.target.value })); },
              required: true
            })
          ),
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Precio Venta *'),
            React.createElement('input', { 
              className: 'input',
              type: 'number',
              step: '0.01',
              value: formData.precio_venta,
              onChange: function(e) { setFormData(Object.assign({}, formData, { precio_venta: e.target.value })); },
              required: true
            })
          )
        ),
        React.createElement('div', { className: 'form-row' },
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Stock Mínimo'),
            React.createElement('input', { 
              className: 'input',
              type: 'number',
              value: formData.stock_minimo,
              onChange: function(e) { setFormData(Object.assign({}, formData, { stock_minimo: e.target.value })); }
            })
          ),
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Stock Máximo'),
            React.createElement('input', { 
              className: 'input',
              type: 'number',
              value: formData.stock_maximo,
              onChange: function(e) { setFormData(Object.assign({}, formData, { stock_maximo: e.target.value })); }
            })
          )
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Unidad de Medida'),
          React.createElement('input', { 
            className: 'input',
            value: formData.unidad_medida,
            onChange: function(e) { setFormData(Object.assign({}, formData, { unidad_medida: e.target.value })); }
          })
        ),
        React.createElement('button', { className: 'btn btn-primary btn-large', type: 'submit' }, 'Guardar')
      )
    )
  );
}

// ===== GESTIÓN DE LOTES =====

function GestionLotes() {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [loteId, setLoteId] = useState(null);
  
  const [formData, setFormData] = useState({
    producto_id: '',
    numero_referencia: '',
    cantidad: '',
    costo_unitario: '',
    proveedor_id: ''
  });

  useEffect(function() {
    cargarProductos();
  }, []);

  function cargarProductos() {
    api().getProductos({ estado: true }).then(function(res) {
      setProductos(res.data);
      setError(null);
    }).catch(function(e) {
      setError('Error al cargar productos');
    });
  }

  function seleccionarProducto(id) {
    setLoading(true);
    setProductoSeleccionado(parseInt(id));
    api().getLotes(id).then(function(res) {
      setLotes(res.data);
      setFormData(Object.assign({}, formData, { producto_id: id }));
      setLoading(false);
    }).catch(function(e) {
      setError('Error al cargar lotes');
      setLoading(false);
    });
  }

  function guardarLote(e) {
    e.preventDefault();
    const promesa = editando 
      ? api().actualizarLote(loteId, formData)
      : api().crearLote(formData);
    
    promesa.then(function() {
      seleccionarProducto(formData.producto_id);
      setShowModal(false);
      setEditando(false);
      setLoteId(null);
      setFormData({ producto_id: formData.producto_id, numero_referencia: '', cantidad: '', costo_unitario: '', proveedor_id: '' });
    }).catch(function(e) {
      setError('Error: ' + getErrorMessage(e));
    });
  }

  function editarLote(lote) {
    setFormData({
      producto_id: lote.producto_id,
      numero_referencia: lote.numero_referencia || '',
      cantidad: lote.cantidad_actual,
      costo_unitario: lote.costo_unitario || '',
      proveedor_id: lote.proveedor_id || ''
    });
    setLoteId(lote.id);
    setEditando(true);
    setShowModal(true);
  }

  const productosOpts = productos.map(function(p) {
    return React.createElement('option', { key: p.id, value: p.id }, p.nombre + ' (' + (p.stock_total || 0) + ')');
  });

  const lotesRows = lotes.map(function(l) {
    return React.createElement('tr', { key: l.id },
      React.createElement('td', null, l.numero_referencia || '-'),
      React.createElement('td', null, l.cantidad_inicial),
      React.createElement('td', null, l.cantidad_actual),
      React.createElement('td', null, '$' + parseFloat(l.costo_unitario || 0).toFixed(2)),
      React.createElement('td', null, React.createElement('span', { className: 'badge badge-' + (l.estado === 'activo' ? 'success' : 'danger') }, l.estado)),
      React.createElement('td', null,
        React.createElement('button', { className: 'btn btn-small btn-info', onClick: function() { editarLote(l); } }, 'Editar')
      )
    );
  });

  return React.createElement('div', { className: 'panel' },
    React.createElement('div', { className: 'panel-header' },
      React.createElement('h2', null, '📦 Gestión de Lotes'),
      React.createElement('button', { className: 'btn btn-success', onClick: function() { setShowModal(true); } }, '+ Nuevo Lote')
    ),
    error && React.createElement(AlertBox, { tipo: 'danger', mensaje: error }),
    React.createElement('div', { className: 'form-group' },
      React.createElement('label', null, 'Seleccionar Producto:'),
      React.createElement('select', { 
        className: 'input',
        value: productoSeleccionado || '',
        onChange: function(e) { seleccionarProducto(e.target.value); }
      },
        React.createElement('option', { value: '' }, 'Elegir producto...'),
        productosOpts
      )
    ),
    loading && React.createElement('div', { className: 'spinner' }, 'Cargando...'),
    !loading && productoSeleccionado && React.createElement('table', { className: 'table' },
      React.createElement('thead', null,
        React.createElement('tr', null,
          React.createElement('th', null, 'Referencia'),
          React.createElement('th', null, 'Cantidad'),
          React.createElement('th', null, 'Cantidad Actual'),
          React.createElement('th', null, 'Costo Unit.'),
          React.createElement('th', null, 'Estado'),
          React.createElement('th', null, 'Acciones')
        )
      ),
      React.createElement('tbody', null, lotesRows)
    ),
    showModal && React.createElement(Modal, { 
      titulo: editando ? 'Editar Lote' : 'Nuevo Lote',
      onClose: function() { 
        setShowModal(false);
        setEditando(false);
        setLoteId(null);
      }
    },
      React.createElement('form', { onSubmit: guardarLote },
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Producto *'),
          React.createElement('select', { 
            className: 'input',
            value: formData.producto_id,
            onChange: function(e) { setFormData(Object.assign({}, formData, { producto_id: e.target.value })); },
            required: true
          },
            React.createElement('option', { value: '' }, 'Elegir...'),
            productosOpts
          )
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Número de Referencia'),
          React.createElement('input', { 
            className: 'input',
            value: formData.numero_referencia,
            onChange: function(e) { setFormData(Object.assign({}, formData, { numero_referencia: e.target.value })); }
          })
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Cantidad *'),
          React.createElement('input', { 
            className: 'input',
            type: 'number',
            value: formData.cantidad,
            onChange: function(e) { setFormData(Object.assign({}, formData, { cantidad: e.target.value })); },
            required: true
          })
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Costo Unitario'),
          React.createElement('input', { 
            className: 'input',
            type: 'number',
            step: '0.01',
            value: formData.costo_unitario,
            onChange: function(e) { setFormData(Object.assign({}, formData, { costo_unitario: e.target.value })); }
          })
        ),
        React.createElement('button', { className: 'btn btn-primary btn-large', type: 'submit' }, 'Guardar Lote')
      )
    )
  );
}

// ===== REPORTES =====

function Reportes() {
  const [reporteActivo, setReporteActivo] = useState('stock');
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [facturaVenta, setFacturaVenta] = useState(null);
  const [showFactura, setShowFactura] = useState(false);

  function cargarReporteStock() {
    setLoading(true);
    api().getReporteStock().then(function(res) {
      setDatos(res.data);
      setError(null);
      setLoading(false);
    }).catch(function(e) {
      setError('Error al cargar reporte');
      setLoading(false);
    });
  }

  function cargarReporteRotacion() {
    setLoading(true);
    api().getReporteRotacion(30).then(function(res) {
      setDatos(res.data);
      setError(null);
      setLoading(false);
    }).catch(function(e) {
      setError('Error al cargar reporte');
      setLoading(false);
    });
  }

  function cargarReporteValorizacion() {
    setLoading(true);
    api().getReporteValorizacion().then(function(res) {
      setDatos([res.data]);
      setError(null);
      setLoading(false);
    }).catch(function(e) {
      setError('Error al cargar reporte');
      setLoading(false);
    });
  }

  function cargarReporteVentas() {
    setLoading(true);
    api().getReporteVentas(fechaDesde, fechaHasta).then(function(res) {
      setDatos(res.data);
      setError(null);
      setLoading(false);
    }).catch(function(e) {
      setError('Error al cargar reporte de ventas');
      setLoading(false);
    });
  }

  function verFactura(venta) {
    api().getDetalleVenta(venta.id)
      .then(function(res) {
        setFacturaVenta(res.data);
        setShowFactura(true);
      })
      .catch(function(err) {
        setError('Error al cargar factura: ' + getErrorMessage(err));
      });
  }

  useEffect(function() {
    if (reporteActivo === 'stock') cargarReporteStock();
    else if (reporteActivo === 'rotacion') cargarReporteRotacion();
    else if (reporteActivo === 'valorizacion') cargarReporteValorizacion();
    else if (reporteActivo === 'ventas') cargarReporteVentas();
  }, [reporteActivo]);

  function descargarCSV() {
    const headers = Object.keys(datos[0] || {});
    let csv = headers.join(',') + '\n';
    datos.forEach(function(fila) {
      csv += headers.map(function(h) { return '"' + (fila[h] || '') + '"'; }).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte.csv';
    a.click();
  }

  function imprimir() {
    window.print();
  }

  const detallesRows = datos.length > 0 && datos[0].detalles 
    ? datos[0].detalles.map(function(d, i) {
        return React.createElement('tr', { key: i },
          React.createElement('td', null, d.producto),
          React.createElement('td', null, d.cantidad),
          React.createElement('td', null, '$' + parseFloat(d.costo_unitario || 0).toFixed(2)),
          React.createElement('td', null, '$' + d.valor_total)
        );
      })
    : [];

  const otrosRows = (reporteActivo === 'stock' || reporteActivo === 'rotacion' || reporteActivo === 'ventas')
    ? datos.map(function(d, i) {
        if (reporteActivo === 'stock') {
          return React.createElement('tr', { key: i },
            React.createElement('td', null, d.codigo),
            React.createElement('td', null, d.nombre),
            React.createElement('td', null, d.stock_total),
            React.createElement('td', null, d.stock_minimo),
            React.createElement('td', null, '$' + parseFloat(d.precio_costo).toFixed(2)),
            React.createElement('td', null, '$' + parseFloat(d.precio_venta).toFixed(2)),
            React.createElement('td', null, d.margen_porcentaje + '%'),
            React.createElement('td', null, '$' + d.valor_total_costo),
            React.createElement('td', null, React.createElement('span', { className: 'badge badge-' + (d.alerta === 'BAJO' ? 'danger' : 'success') }, d.alerta))
          );
        } else if (reporteActivo === 'rotacion') {
          return React.createElement('tr', { key: i },
            React.createElement('td', null, d.nombre),
            React.createElement('td', null, d.vendido_ultimos_dias),
            React.createElement('td', null, d.velocidad_rotacion)
          );
        } else if (reporteActivo === 'ventas') {
          return React.createElement('tr', { key: i },
            React.createElement('td', null, d.id),
            React.createElement('td', null, d.numero_venta || '-'),
            React.createElement('td', null, new Date(d.fecha).toLocaleString()),
            React.createElement('td', null, '$' + parseFloat(d.total).toFixed(2)),
            React.createElement('td', null, React.createElement('span', { className: 'badge badge-success' }, d.estado)),
            React.createElement('td', null,
              React.createElement('button', { 
                className: 'btn btn-small btn-info',
                onClick: function() { verFactura(d); }
              }, '📄 Ver Factura')
            )
          );
        }
      })
    : [];

  return React.createElement('div', { className: 'panel' },
    React.createElement('div', { className: 'panel-header' },
      React.createElement('h2', null, '📊 Reportes'),
      React.createElement('div', null,
        React.createElement('button', { 
          className: 'btn ' + (reporteActivo === 'stock' ? 'btn-primary' : 'btn-secondary'),
          onClick: function() { setReporteActivo('stock'); }
        }, 'Stock Actual'),
        React.createElement('button', { 
          className: 'btn ' + (reporteActivo === 'rotacion' ? 'btn-primary' : 'btn-secondary'),
          onClick: function() { setReporteActivo('rotacion'); }
        }, 'Rotación'),
        React.createElement('button', { 
          className: 'btn ' + (reporteActivo === 'valorizacion' ? 'btn-primary' : 'btn-secondary'),
          onClick: function() { setReporteActivo('valorizacion'); }
        }, 'Valorización'),
        React.createElement('button', { 
          className: 'btn ' + (reporteActivo === 'ventas' ? 'btn-primary' : 'btn-secondary'),
          onClick: function() { setReporteActivo('ventas'); }
        }, 'Ventas')
      )
    ),
    reporteActivo === 'ventas' && React.createElement('div', { className: 'form-group', style: { display: 'flex', gap: '10px', marginBottom: '15px' } },
      React.createElement('div', null,
        React.createElement('label', null, 'Desde:'),
        React.createElement('input', { type: 'date', value: fechaDesde, onChange: function(e) { setFechaDesde(e.target.value); }, className: 'form-control' })
      ),
      React.createElement('div', null,
        React.createElement('label', null, 'Hasta:'),
        React.createElement('input', { type: 'date', value: fechaHasta, onChange: function(e) { setFechaHasta(e.target.value); }, className: 'form-control' })
      ),
      React.createElement('button', { className: 'btn btn-primary', onClick: cargarReporteVentas, style: { marginTop: '25px' } }, 'Filtrar')
    ),
    error && React.createElement(AlertBox, { tipo: 'danger', mensaje: error }),
    loading && React.createElement('div', { className: 'spinner' }, 'Cargando...'),
    !loading && datos.length > 0 && React.createElement('div', null,
      React.createElement('div', { className: 'button-group' },
        React.createElement('button', { className: 'btn btn-info', onClick: descargarCSV }, '⬇️ Descargar CSV'),
        React.createElement('button', { className: 'btn btn-info', onClick: imprimir }, '🖨️ Imprimir')
      ),
      reporteActivo === 'valorizacion' && React.createElement('div', { className: 'card' },
        React.createElement('h3', null, 'Valorización de Inventario'),
        React.createElement('p', null, 'Valor Total: $' + datos[0].valor_total_inventario),
        React.createElement('p', null, 'Cantidad Lotes: ' + datos[0].cantidad_lotes),
        React.createElement('table', { className: 'table' },
          React.createElement('thead', null,
            React.createElement('tr', null,
              React.createElement('th', null, 'Producto'),
              React.createElement('th', null, 'Cantidad'),
              React.createElement('th', null, 'Costo Unit.'),
              React.createElement('th', null, 'Valor Total')
            )
          ),
          React.createElement('tbody', null, detallesRows)
        )
      ),
      (reporteActivo === 'stock' || reporteActivo === 'rotacion' || reporteActivo === 'ventas') && React.createElement('table', { className: 'table' },
        React.createElement('thead', null,
          React.createElement('tr', null,
            reporteActivo === 'stock' && React.createElement('th', null, 'Código'),
            reporteActivo === 'stock' && React.createElement('th', null, 'Nombre'),
            reporteActivo === 'stock' && React.createElement('th', null, 'Stock'),
            reporteActivo === 'stock' && React.createElement('th', null, 'Mín'),
            reporteActivo === 'stock' && React.createElement('th', null, 'P. Costo'),
            reporteActivo === 'stock' && React.createElement('th', null, 'P. Venta'),
            reporteActivo === 'stock' && React.createElement('th', null, 'Margen %'),
            reporteActivo === 'stock' && React.createElement('th', null, 'V. Total'),
            reporteActivo === 'stock' && React.createElement('th', null, 'Estado'),
            reporteActivo === 'rotacion' && React.createElement('th', null, 'Producto'),
            reporteActivo === 'rotacion' && React.createElement('th', null, 'Vendido (30d)'),
            reporteActivo === 'rotacion' && React.createElement('th', null, 'Vel. Rotación'),
            reporteActivo === 'ventas' && React.createElement('th', null, 'ID'),
            reporteActivo === 'ventas' && React.createElement('th', null, 'Número Venta'),
            reporteActivo === 'ventas' && React.createElement('th', null, 'Fecha'),
            reporteActivo === 'ventas' && React.createElement('th', null, 'Total'),
            reporteActivo === 'ventas' && React.createElement('th', null, 'Estado'),
            reporteActivo === 'ventas' && React.createElement('th', null, 'Acciones')
          )
        ),
        React.createElement('tbody', null, otrosRows)
      )
    ),
    showFactura && facturaVenta && React.createElement(Modal, { 
      titulo: '📄 Factura #' + (facturaVenta.numero_venta || facturaVenta.id),
      onClose: function() { setShowFactura(false); }
    },
      React.createElement('div', { style: { fontSize: '14px', lineHeight: '1.6' } },
        React.createElement('div', { style: { borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '15px', textAlign: 'center' } },
          React.createElement('h3', { style: { margin: '0 0 10px 0' } }, 'FACTURA DE VENTA'),
          React.createElement('p', { style: { margin: '0' } }, 'Número: ' + (facturaVenta.numero_venta || 'N/A')),
          React.createElement('p', { style: { margin: '0' } }, 'Fecha: ' + new Date(facturaVenta.fecha).toLocaleString())
        ),
        
        React.createElement('div', { style: { marginBottom: '15px' } },
          React.createElement('p', { style: { margin: '5px 0' } }, React.createElement('strong', null, 'Estado:')),
          React.createElement('p', { style: { margin: '5px 0' } }, facturaVenta.estado)
        ),

        React.createElement('div', { style: { marginBottom: '15px' } },
          React.createElement('h4', { style: { marginBottom: '10px' } }, 'Detalles de la Venta:'),
          React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse' } },
            React.createElement('thead', null,
              React.createElement('tr', { style: { borderBottom: '1px solid #ddd' } },
                React.createElement('th', { style: { textAlign: 'left', padding: '5px', borderBottom: '1px solid #ddd' } }, 'Producto'),
                React.createElement('th', { style: { textAlign: 'center', padding: '5px', borderBottom: '1px solid #ddd' } }, 'Cantidad'),
                React.createElement('th', { style: { textAlign: 'right', padding: '5px', borderBottom: '1px solid #ddd' } }, 'Precio Unit.'),
                React.createElement('th', { style: { textAlign: 'right', padding: '5px', borderBottom: '1px solid #ddd' } }, 'Subtotal')
              )
            ),
            React.createElement('tbody', null,
              (facturaVenta.detalles && Array.isArray(facturaVenta.detalles) ? facturaVenta.detalles : []).map(function(d, i) {
                return React.createElement('tr', { key: i, style: { borderBottom: '1px solid #eee' } },
                  React.createElement('td', { style: { padding: '8px 5px' } }, d.nombre || d.producto || '-'),
                  React.createElement('td', { style: { textAlign: 'center', padding: '8px 5px' } }, d.cantidad || '0'),
                  React.createElement('td', { style: { textAlign: 'right', padding: '8px 5px' } }, '$' + parseFloat(d.precio_unitario || d.costo_unitario || 0).toFixed(2)),
                  React.createElement('td', { style: { textAlign: 'right', padding: '8px 5px' } }, '$' + parseFloat(d.subtotal || (d.cantidad * (d.precio_unitario || d.costo_unitario || 0))).toFixed(2))
                );
              })
            )
          )
        ),

        React.createElement('div', { style: { borderTop: '2px solid #333', paddingTop: '10px', marginTop: '15px' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' } },
            React.createElement('span', null, 'TOTAL:'),
            React.createElement('span', null, '$' + parseFloat(facturaVenta.total).toFixed(2))
          )
        ),

        React.createElement('div', { style: { marginTop: '20px', textAlign: 'center', paddingTop: '15px', borderTop: '1px solid #ddd' } },
          React.createElement('button', { 
            className: 'btn btn-primary',
            onClick: function() { 
              const ventanaImpresion = window.open('', '_blank');
              ventanaImpresion.document.write('<html><head><title>Factura</title><style>body { font-family: Arial; margin: 20px; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }</style></head><body>');
              ventanaImpresion.document.write('<h2>FACTURA #' + (facturaVenta.numero_venta || 'N/A') + '</h2>');
              ventanaImpresion.document.write('<p>Fecha: ' + new Date(facturaVenta.fecha).toLocaleString() + '</p>');
              ventanaImpresion.document.write('<p>Estado: ' + facturaVenta.estado + '</p>');
              ventanaImpresion.document.write('<table><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr>');
              (facturaVenta.detalles && Array.isArray(facturaVenta.detalles) ? facturaVenta.detalles : []).forEach(function(d) {
                ventanaImpresion.document.write('<tr><td>' + (d.nombre || d.producto || '-') + '</td><td>' + (d.cantidad || '0') + '</td><td>$' + parseFloat(d.precio_unitario || d.costo_unitario || 0).toFixed(2) + '</td><td>$' + parseFloat(d.subtotal || (d.cantidad * (d.precio_unitario || d.costo_unitario || 0))).toFixed(2) + '</td></tr>');
              });
              ventanaImpresion.document.write('</table>');
              ventanaImpresion.document.write('<h3>Total: $' + parseFloat(facturaVenta.total).toFixed(2) + '</h3>');
              ventanaImpresion.document.write('</body></html>');
              ventanaImpresion.document.close();
              ventanaImpresion.print();
            }
          }, '🖨️ Imprimir Factura'),
          React.createElement('button', { 
            className: 'btn btn-secondary',
            onClick: function() { setShowFactura(false); },
            style: { marginLeft: '10px' }
          }, 'Cerrar')
        )
      )
    )
  );
}

// ===== ALERTAS =====

function GestionAlertas() {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('pendiente');

  useEffect(function() {
    cargarAlertas();
  }, [filtroEstado]);

  function cargarAlertas() {
    setLoading(true);
    api().getAlertas({ estado: filtroEstado }).then(function(res) {
      setAlertas(res.data);
      setError(null);
      setLoading(false);
    }).catch(function(e) {
      setError('Error al cargar alertas');
      setLoading(false);
    });
  }

  function resolver(id) {
    api().resolverAlerta(id).then(function() {
      cargarAlertas();
    }).catch(function(e) {
      setError('Error: ' + getErrorMessage(e));
    });
  }

  const alertasRows = alertas.map(function(a) {
    return React.createElement('tr', { key: a.id },
      React.createElement('td', null, a.tipo),
      React.createElement('td', null, a.descripcion),
      React.createElement('td', null, React.createElement('span', { className: 'badge badge-' + (a.severidad === 'alta' ? 'danger' : a.severidad === 'media' ? 'warning' : 'info') }, a.severidad)),
      React.createElement('td', null, new Date(a.fecha_creacion).toLocaleDateString()),
      React.createElement('td', null, React.createElement('span', { className: 'badge badge-' + (a.estado === 'pendiente' ? 'danger' : 'success') }, a.estado)),
      React.createElement('td', null,
        a.estado === 'pendiente' && React.createElement('button', { className: 'btn btn-small btn-success', onClick: function() { resolver(a.id); } }, 'Resolver')
      )
    );
  });

  return React.createElement('div', { className: 'panel' },
    React.createElement('div', { className: 'panel-header' },
      React.createElement('h2', null, '🔔 Alertas')
    ),
    error && React.createElement(AlertBox, { tipo: 'danger', mensaje: error }),
    React.createElement('div', { className: 'form-group' },
      React.createElement('label', null, 'Filtrar:'),
      React.createElement('select', { 
        className: 'input',
        value: filtroEstado,
        onChange: function(e) { setFiltroEstado(e.target.value); }
      },
        React.createElement('option', { value: 'pendiente' }, 'Pendientes'),
        React.createElement('option', { value: 'resuelto' }, 'Resueltas'),
        React.createElement('option', { value: '' }, 'Todas')
      )
    ),
    loading && React.createElement('div', { className: 'spinner' }, 'Cargando...'),
    !loading && React.createElement('table', { className: 'table' },
      React.createElement('thead', null,
        React.createElement('tr', null,
          React.createElement('th', null, 'Tipo'),
          React.createElement('th', null, 'Descripción'),
          React.createElement('th', null, 'Severidad'),
          React.createElement('th', null, 'Fecha'),
          React.createElement('th', null, 'Estado'),
          React.createElement('th', null, 'Acciones')
        )
      ),
      React.createElement('tbody', null, alertasRows)
    )
  );
}

// ===== VENTAS / PUNTO DE VENTA =====

function Ventas() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [showFactura, setShowFactura] = useState(false);
  const [ultimaVenta, setUltimaVenta] = useState(null);

  useEffect(function() {
    cargarProductos();
  }, []);

  function cargarProductos() {
    setLoading(true);
    setError(null);
    
    api().getProductos({ estado: true }).then(function(res) {
      console.log('📦 Productos cargados:', res.data.length);
      console.log('📊 Primer producto:', res.data[0]);
      setProductos(res.data);
      setLoading(false);
    }).catch(function(e) {
      console.error('❌ Error cargando productos:', e);
      setError('Error al cargar productos: ' + getErrorMessage(e));
      setLoading(false);
    });
  }

  function agregarAlCarrito(producto) {
    const enCarrito = carrito.find(function(item) { return item.id === producto.id; });
    
    if (enCarrito) {
      const nuevoCarrito = carrito.map(function(item) {
        if (item.id === producto.id) {
          const nuevaCantidad = item.cantidad + 1;
          if (nuevaCantidad > (producto.stock_total || 0)) {
            setError('Stock insuficiente. Disponible: ' + producto.stock_total);
            return item;
          }
          return Object.assign({}, item, { cantidad: nuevaCantidad });
        }
        return item;
      });
      setCarrito(nuevoCarrito);
    } else {
      if ((producto.stock_total || 0) < 1) {
        setError('Producto sin stock');
        return;
      }
      setCarrito(carrito.concat([Object.assign({}, producto, { cantidad: 1 })]));
    }
  }

  function cambiarCantidad(productoId, nuevaCantidad) {
    if (nuevaCantidad < 1) {
      eliminarDelCarrito(productoId);
      return;
    }
    
    const producto = productos.find(function(p) { return p.id === productoId; });
    if (nuevaCantidad > (producto.stock_total || 0)) {
      setError('Stock insuficiente. Disponible: ' + producto.stock_total);
      return;
    }
    
    const nuevoCarrito = carrito.map(function(item) {
      if (item.id === productoId) {
        return Object.assign({}, item, { cantidad: nuevaCantidad });
      }
      return item;
    });
    setCarrito(nuevoCarrito);
  }

  function eliminarDelCarrito(productoId) {
    setCarrito(carrito.filter(function(item) { return item.id !== productoId; }));
  }

  function calcularTotal() {
    return carrito.reduce(function(total, item) {
      return total + (item.precio_venta * item.cantidad);
    }, 0);
  }

  function procesarVenta() {
    if (carrito.length === 0) {
      setError('El carrito está vacío');
      return;
    }

    const venta = {
      items: carrito.map(function(item) {
        return {
          producto_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_venta,
          subtotal: item.precio_venta * item.cantidad
        };
      }),
      total: calcularTotal()
    };

    console.log('🛒 Procesando venta:', venta);
    
    api().crearVenta(venta).then(function(res) {
      console.log('✅ Venta creada:', res.data);
      setUltimaVenta({
        id: res.data.id || new Date().getTime(),
        fecha: new Date(),
        items: carrito,
        total: calcularTotal()
      });
      setCarrito([]);
      setShowFactura(true);
      cargarProductos();
      setError(null);
    }).catch(function(e) {
      console.error('❌ Error al procesar venta:', e);
      setError('Error al procesar venta: ' + getErrorMessage(e));
    });
  }

  function imprimirFactura() {
    window.print();
  }

  const productosFiltrados = productos.filter(function(p) {
    if (!busqueda) return true;
    const termino = busqueda.toLowerCase();
    return p.nombre.toLowerCase().indexOf(termino) >= 0 || 
           p.codigo_interno.toLowerCase().indexOf(termino) >= 0;
  });

  const productosRows = productosFiltrados.map(function(p) {
    const stockActual = p.stock_total || 0;
    const sinStock = stockActual === 0;
    
    return React.createElement('tr', { key: p.id, style: sinStock ? { opacity: 0.5 } : {} },
      React.createElement('td', null, p.codigo_interno),
      React.createElement('td', null, p.nombre),
      React.createElement('td', null, '$' + parseFloat(p.precio_venta).toFixed(2)),
      React.createElement('td', null, React.createElement('strong', { 
        style: { color: sinStock ? 'red' : 'green' }
      }, stockActual)),
      React.createElement('td', null,
        React.createElement('button', { 
          className: 'btn btn-small btn-success', 
          onClick: function() { agregarAlCarrito(p); },
          disabled: sinStock
        }, sinStock ? 'Sin stock' : '+ Agregar')
      )
    );
  });

  const carritoRows = carrito.map(function(item) {
    return React.createElement('tr', { key: item.id },
      React.createElement('td', null, item.nombre),
      React.createElement('td', null, '$' + parseFloat(item.precio_venta).toFixed(2)),
      React.createElement('td', null,
        React.createElement('input', {
          type: 'number',
          min: '1',
          max: item.stock_total,
          className: 'input',
          style: { width: '70px', display: 'inline-block' },
          value: item.cantidad,
          onChange: function(e) { cambiarCantidad(item.id, parseInt(e.target.value) || 1); }
        })
      ),
      React.createElement('td', null, '$' + (item.precio_venta * item.cantidad).toFixed(2)),
      React.createElement('td', null,
        React.createElement('button', { 
          className: 'btn btn-small btn-danger', 
          onClick: function() { eliminarDelCarrito(item.id); }
        }, 'X')
      )
    );
  });

  return React.createElement('div', { className: 'panel' },
    React.createElement('div', { className: 'panel-header' },
      React.createElement('h2', null, '💰 Punto de Venta')
    ),
    error && React.createElement(AlertBox, { tipo: 'danger', mensaje: error }),
    
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' } },
      // Columna izquierda: Productos
      React.createElement('div', null,
        React.createElement('div', { className: 'form-group' },
          React.createElement('input', {
            className: 'input',
            type: 'text',
            placeholder: 'Buscar producto por nombre o código...',
            value: busqueda,
            onChange: function(e) { setBusqueda(e.target.value); }
          })
        ),
        loading && React.createElement('div', { className: 'spinner' }, 'Cargando productos...'),
        !loading && productos.length === 0 && React.createElement('div', { className: 'alert alert-info' }, 
          '📦 No hay productos disponibles. Ve a la pestaña "Productos" para agregar algunos.'
        ),
        !loading && productos.length > 0 && React.createElement('div', null,
          productosRows.length === 0 && React.createElement('div', { className: 'alert alert-warning' }, 
            '🔍 No se encontraron productos con el término de búsqueda "' + busqueda + '"'
          ),
          React.createElement('table', { className: 'table' },
            React.createElement('thead', null,
              React.createElement('tr', null,
                React.createElement('th', null, 'Código'),
                React.createElement('th', null, 'Producto'),
                React.createElement('th', null, 'Precio'),
                React.createElement('th', null, 'Stock'),
                React.createElement('th', null, 'Acción')
              )
            ),
            React.createElement('tbody', null, productosRows)
          )
        )
      ),

      // Columna derecha: Carrito
      React.createElement('div', { className: 'card' },
        React.createElement('h3', null, '🛒 Carrito'),
        carrito.length === 0 && React.createElement('p', null, 'El carrito está vacío'),
        carrito.length > 0 && React.createElement('div', null,
          React.createElement('table', { className: 'table' },
            React.createElement('thead', null,
              React.createElement('tr', null,
                React.createElement('th', null, 'Producto'),
                React.createElement('th', null, 'Precio'),
                React.createElement('th', null, 'Cant.'),
                React.createElement('th', null, 'Subtotal'),
                React.createElement('th', null, '')
              )
            ),
            React.createElement('tbody', null, carritoRows)
          ),
          React.createElement('div', { style: { marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' } },
            React.createElement('h2', { style: { margin: '0', textAlign: 'right' } }, 'Total: $' + calcularTotal().toFixed(2))
          ),
          React.createElement('button', { 
            className: 'btn btn-success btn-large', 
            style: { width: '100%', marginTop: '10px' },
            onClick: procesarVenta
          }, '💳 Procesar Venta')
        )
      )
    ),

    // Modal de factura
    showFactura && ultimaVenta && React.createElement(Modal, {
      titulo: 'Factura - Venta #' + ultimaVenta.id,
      onClose: function() { setShowFactura(false); }
    },
      React.createElement('div', { className: 'factura', style: { padding: '20px' } },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: '20px' } },
          React.createElement('h2', null, '🏪 Sistema Tienda MVP'),
          React.createElement('p', null, 'Fecha: ' + ultimaVenta.fecha.toLocaleDateString() + ' ' + ultimaVenta.fecha.toLocaleTimeString()),
          React.createElement('p', null, 'Factura #' + ultimaVenta.id)
        ),
        React.createElement('table', { className: 'table' },
          React.createElement('thead', null,
            React.createElement('tr', null,
              React.createElement('th', null, 'Producto'),
              React.createElement('th', null, 'Cantidad'),
              React.createElement('th', null, 'Precio Unit.'),
              React.createElement('th', null, 'Subtotal')
            )
          ),
          React.createElement('tbody', null,
            ultimaVenta.items.map(function(item, idx) {
              return React.createElement('tr', { key: idx },
                React.createElement('td', null, item.nombre),
                React.createElement('td', null, item.cantidad),
                React.createElement('td', null, '$' + parseFloat(item.precio_venta).toFixed(2)),
                React.createElement('td', null, '$' + (item.precio_venta * item.cantidad).toFixed(2))
              );
            })
          )
        ),
        React.createElement('div', { style: { marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' } },
          React.createElement('h2', { style: { margin: '0', textAlign: 'right' } }, 'TOTAL: $' + ultimaVenta.total.toFixed(2))
        ),
        React.createElement('div', { style: { marginTop: '20px', textAlign: 'center' } },
          React.createElement('button', { className: 'btn btn-primary', onClick: imprimirFactura }, '🖨️ Imprimir'),
          ' ',
          React.createElement('button', { className: 'btn btn-secondary', onClick: function() { setShowFactura(false); } }, 'Cerrar')
        )
      )
    )
  );
}

// ===== GESTIÓN DE COMPRAS =====

function GestionCompras() {
  const [compras, setCompras] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('recibida');
  const [porcentajeGanancia, setPorcentajeGanancia] = useState(30);
  
  const [formData, setFormData] = useState({
    proveedor_id: '',
    items: []
  });
  const [itemForm, setItemForm] = useState({ producto_id: '', cantidad: '', precio: '' });

  useEffect(function() {
    cargarDatos();
    cargarConfiguracion();
  }, []);

  function cargarConfiguracion() {
    api().getConfiguracion()
      .then(function(res) {
        if (res.data.porcentaje_ganancia !== undefined) {
          setPorcentajeGanancia(res.data.porcentaje_ganancia);
        }
      })
      .catch(function(err) {
        console.error('Error al cargar configuración:', err);
      });
  }

  function cargarDatos() {
    setLoading(true);
    Promise.all([
      api().listarCompras({}),
      api().getProductos({ estado: true }),
      api().getProveedores()
    ]).then(function(resultados) {
      setCompras(resultados[0].data);
      setProductos(resultados[1].data);
      setProveedores(resultados[2].data);
      setError(null);
      setLoading(false);
    }).catch(function(e) {
      setError('Error al cargar datos');
      setLoading(false);
    });
  }

  function agregarItem() {
    if (!itemForm.producto_id || !itemForm.cantidad) {
      setError('Complete los campos del producto');
      return;
    }
    const nuevoItem = Object.assign({}, itemForm, { id: Date.now() });
    setFormData(Object.assign({}, formData, { items: formData.items.concat([nuevoItem]) }));
    setItemForm({ producto_id: '', cantidad: '', precio: '' });
  }

  function quitarItem(id) {
    setFormData(Object.assign({}, formData, { items: formData.items.filter(function(i) { return i.id !== id; }) }));
  }

  function guardarCompra(e) {
    e.preventDefault();
    if (!formData.proveedor_id || formData.items.length === 0) {
      setError('Complete los campos requeridos');
      return;
    }
    
    api().crearCompra(formData).then(function() {
      cargarDatos();
      setShowModal(false);
      setFormData({ proveedor_id: '', items: [] });
      setError(null);
    }).catch(function(e) {
      setError('Error: ' + getErrorMessage(e));
    });
  }

  const proveedoresOpts = proveedores.map(function(p) {
    return React.createElement('option', { key: p.id, value: p.id }, p.nombre);
  });

  const productosOpts = productos.map(function(p) {
    return React.createElement('option', { key: p.id, value: p.id }, p.nombre + ' (' + p.codigo_interno + ')');
  });

  const itemsRows = formData.items.map(function(item) {
    const producto = productos.find(function(p) { return p.id == item.producto_id; });
    return React.createElement('tr', { key: item.id },
      React.createElement('td', null, producto ? producto.nombre : '-'),
      React.createElement('td', null, item.cantidad),
      React.createElement('td', null, '$' + (item.precio || 0)),
      React.createElement('td', null, '$' + (item.cantidad * (item.precio || 0)).toFixed(2)),
      React.createElement('td', null,
        React.createElement('button', { className: 'btn btn-small btn-danger', onClick: function() { quitarItem(item.id); } }, 'Eliminar')
      )
    );
  });

  const comprasRows = compras.filter(function(c) { return !filtroEstado || c.estado === filtroEstado; }).map(function(c) {
    const prov = proveedores.find(function(p) { return p.id === c.proveedor_id; });
    return React.createElement('tr', { key: c.id },
      React.createElement('td', null, c.numero_compra || '-'),
      React.createElement('td', null, prov ? prov.nombre : '-'),
      React.createElement('td', null, new Date(c.fecha).toLocaleDateString()),
      React.createElement('td', null, '$' + parseFloat(c.total || 0).toFixed(2)),
      React.createElement('td', null, React.createElement('span', { className: 'badge badge-success' }, c.estado))
    );
  });

  return React.createElement('div', { className: 'panel' },
    React.createElement('div', { className: 'panel-header' },
      React.createElement('h2', null, '📥 Gestión de Compras'),
      React.createElement('button', { className: 'btn btn-success', onClick: function() {
        setShowModal(true);
        setFormData({ proveedor_id: '', items: [] });
      }}, '+ Nueva Compra')
    ),
    error && React.createElement(AlertBox, { tipo: 'danger', mensaje: error }),
    loading && React.createElement('div', { className: 'spinner' }, 'Cargando...'),
    !loading && React.createElement('div', null,
      React.createElement('table', { className: 'table' },
        React.createElement('thead', null,
          React.createElement('tr', null,
            React.createElement('th', null, 'N° Compra'),
            React.createElement('th', null, 'Proveedor'),
            React.createElement('th', null, 'Fecha'),
            React.createElement('th', null, 'Total'),
            React.createElement('th', null, 'Estado')
          )
        ),
        React.createElement('tbody', null, comprasRows)
      )
    ),
    showModal && React.createElement(Modal, { 
      titulo: 'Nueva Compra',
      onClose: function() { setShowModal(false); }
    },
      React.createElement('form', { onSubmit: guardarCompra },
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Proveedor *'),
          React.createElement('select', { 
            className: 'input',
            value: formData.proveedor_id,
            onChange: function(e) { setFormData(Object.assign({}, formData, { proveedor_id: e.target.value })); },
            required: true
          },
            React.createElement('option', { value: '' }, 'Elegir...'),
            proveedoresOpts
          )
        ),
        React.createElement('h4', null, 'Agregar Productos'),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', marginBottom: '15px' } },
          React.createElement('select', { 
            className: 'input',
            value: itemForm.producto_id,
            onChange: function(e) { setItemForm(Object.assign({}, itemForm, { producto_id: e.target.value })); }
          },
            React.createElement('option', { value: '' }, 'Producto...'),
            productosOpts
          ),
          React.createElement('input', { 
            className: 'input',
            type: 'number',
            placeholder: 'Cantidad',
            value: itemForm.cantidad,
            onChange: function(e) { setItemForm(Object.assign({}, itemForm, { cantidad: e.target.value })); }
          }),
          React.createElement('input', { 
            className: 'input',
            type: 'number',
            step: '0.01',
            placeholder: 'Precio',
            value: itemForm.precio,
            onChange: function(e) { setItemForm(Object.assign({}, itemForm, { precio: e.target.value })); }
          }),
          React.createElement('button', { className: 'btn btn-primary', type: 'button', onClick: agregarItem }, 'Agregar')
        ),
        formData.items.length > 0 && React.createElement('table', { className: 'table' },
          React.createElement('thead', null,
            React.createElement('tr', null,
              React.createElement('th', null, 'Producto'),
              React.createElement('th', null, 'Cantidad'),
              React.createElement('th', null, 'Precio'),
              React.createElement('th', null, 'Subtotal'),
              React.createElement('th', null, 'Acción')
            )
          ),
          React.createElement('tbody', null, itemsRows)
        ),
        React.createElement('button', { className: 'btn btn-primary btn-large', type: 'submit' }, 'Guardar Compra')
      )
    )
  );
}

// ===== GESTIÓN DE DEVOLUCIONES =====

function GestionDevoluciones() {
  const [devoluciones, setDevoluciones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    tipo: 'cliente',
    referencia_original: '',
    motivo: '',
    items: []
  });
  const [itemForm, setItemForm] = useState({ producto_id: '', cantidad: '', precio: '' });

  useEffect(function() {
    cargarDatos();
  }, []);

  function cargarDatos() {
    setLoading(true);
    Promise.all([
      api().listarDevoluciones({}),
      api().getProductos({ estado: true })
    ]).then(function(resultados) {
      setDevoluciones(resultados[0].data);
      setProductos(resultados[1].data);
      setError(null);
      setLoading(false);
    }).catch(function(e) {
      setError('Error al cargar datos');
      setLoading(false);
    });
  }

  function agregarItem() {
    if (!itemForm.producto_id || !itemForm.cantidad) {
      setError('Complete los campos del producto');
      return;
    }
    const nuevoItem = Object.assign({}, itemForm, { id: Date.now() });
    setFormData(Object.assign({}, formData, { items: formData.items.concat([nuevoItem]) }));
    setItemForm({ producto_id: '', cantidad: '', precio: '' });
  }

  function quitarItem(id) {
    setFormData(Object.assign({}, formData, { items: formData.items.filter(function(i) { return i.id !== id; }) }));
  }

  function guardarDevolucion(e) {
    e.preventDefault();
    if (formData.items.length === 0) {
      setError('Agregue al menos un producto');
      return;
    }
    
    api().crearDevolucion(formData).then(function() {
      cargarDatos();
      setShowModal(false);
      setFormData({ tipo: 'cliente', referencia_original: '', motivo: '', items: [] });
      setError(null);
    }).catch(function(e) {
      setError('Error: ' + getErrorMessage(e));
    });
  }

  const productosOpts = productos.map(function(p) {
    return React.createElement('option', { key: p.id, value: p.id }, p.nombre);
  });

  const itemsRows = formData.items.map(function(item) {
    const producto = productos.find(function(p) { return p.id == item.producto_id; });
    return React.createElement('tr', { key: item.id },
      React.createElement('td', null, producto ? producto.nombre : '-'),
      React.createElement('td', null, item.cantidad),
      React.createElement('td', null, '$' + (item.precio || 0)),
      React.createElement('td', null, '$' + (item.cantidad * (item.precio || 0)).toFixed(2)),
      React.createElement('td', null,
        React.createElement('button', { className: 'btn btn-small btn-danger', onClick: function() { quitarItem(item.id); } }, 'Eliminar')
      )
    );
  });

  const devolucionesRows = devoluciones.map(function(d) {
    return React.createElement('tr', { key: d.id },
      React.createElement('td', null, d.numero_devolucion || '-'),
      React.createElement('td', null, d.tipo),
      React.createElement('td', null, new Date(d.fecha).toLocaleDateString()),
      React.createElement('td', null, '$' + parseFloat(d.total || 0).toFixed(2)),
      React.createElement('td', null, d.motivo || '-')
    );
  });

  return React.createElement('div', { className: 'panel' },
    React.createElement('div', { className: 'panel-header' },
      React.createElement('h2', null, '↩️ Gestión de Devoluciones'),
      React.createElement('button', { className: 'btn btn-success', onClick: function() {
        setShowModal(true);
        setFormData({ tipo: 'cliente', referencia_original: '', motivo: '', items: [] });
      }}, '+ Nueva Devolución')
    ),
    error && React.createElement(AlertBox, { tipo: 'danger', mensaje: error }),
    loading && React.createElement('div', { className: 'spinner' }, 'Cargando...'),
    !loading && React.createElement('div', null,
      React.createElement('table', { className: 'table' },
        React.createElement('thead', null,
          React.createElement('tr', null,
            React.createElement('th', null, 'N° Devolución'),
            React.createElement('th', null, 'Tipo'),
            React.createElement('th', null, 'Fecha'),
            React.createElement('th', null, 'Total'),
            React.createElement('th', null, 'Motivo')
          )
        ),
        React.createElement('tbody', null, devolucionesRows)
      )
    ),
    showModal && React.createElement(Modal, { 
      titulo: 'Nueva Devolución',
      onClose: function() { setShowModal(false); }
    },
      React.createElement('form', { onSubmit: guardarDevolucion },
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Tipo de Devolución *'),
          React.createElement('select', { 
            className: 'input',
            value: formData.tipo,
            onChange: function(e) { setFormData(Object.assign({}, formData, { tipo: e.target.value })); }
          },
            React.createElement('option', { value: 'cliente' }, 'Devolución Cliente'),
            React.createElement('option', { value: 'proveedor' }, 'Devolución Proveedor')
          )
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Referencia Original'),
          React.createElement('input', { 
            className: 'input',
            value: formData.referencia_original,
            onChange: function(e) { setFormData(Object.assign({}, formData, { referencia_original: e.target.value })); },
            placeholder: 'N° Venta o Compra'
          })
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Motivo'),
          React.createElement('textarea', { 
            className: 'input',
            value: formData.motivo,
            onChange: function(e) { setFormData(Object.assign({}, formData, { motivo: e.target.value })); },
            rows: 3
          })
        ),
        React.createElement('h4', null, 'Productos'),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', marginBottom: '15px' } },
          React.createElement('select', { 
            className: 'input',
            value: itemForm.producto_id,
            onChange: function(e) { setItemForm(Object.assign({}, itemForm, { producto_id: e.target.value })); }
          },
            React.createElement('option', { value: '' }, 'Producto...'),
            productosOpts
          ),
          React.createElement('input', { 
            className: 'input',
            type: 'number',
            placeholder: 'Cantidad',
            value: itemForm.cantidad,
            onChange: function(e) { setItemForm(Object.assign({}, itemForm, { cantidad: e.target.value })); }
          }),
          React.createElement('input', { 
            className: 'input',
            type: 'number',
            step: '0.01',
            placeholder: 'Precio',
            value: itemForm.precio,
            onChange: function(e) { setItemForm(Object.assign({}, itemForm, { precio: e.target.value })); }
          }),
          React.createElement('button', { className: 'btn btn-primary', type: 'button', onClick: agregarItem }, 'Agregar')
        ),
        formData.items.length > 0 && React.createElement('table', { className: 'table' },
          React.createElement('thead', null,
            React.createElement('tr', null,
              React.createElement('th', null, 'Producto'),
              React.createElement('th', null, 'Cantidad'),
              React.createElement('th', null, 'Precio'),
              React.createElement('th', null, 'Subtotal'),
              React.createElement('th', null, 'Acción')
            )
          ),
          React.createElement('tbody', null, itemsRows)
        ),
        React.createElement('button', { className: 'btn btn-primary btn-large', type: 'submit' }, 'Guardar Devolución')
      )
    )
  );
}

// ===== GESTIÓN DE USUARIOS =====

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    role: 'vendedor'
  });

  useEffect(function() {
    cargarUsuarios();
  }, []);

  function cargarUsuarios() {
    setLoading(true);
    api().listarUsuarios().then(function(res) {
      setUsuarios(res.data);
      setError(null);
      setLoading(false);
    }).catch(function(e) {
      setError('Error al cargar usuarios');
      setLoading(false);
    });
  }

  function guardarUsuario(e) {
    e.preventDefault();
    const promesa = editando 
      ? api().actualizarUsuario(editando.id, formData)
      : api().crearUsuario(formData);
    
    promesa.then(function() {
      cargarUsuarios();
      setShowModal(false);
      setFormData({ nombre: '', email: '', password: '', role: 'vendedor' });
      setEditando(null);
    }).catch(function(e) {
      setError('Error: ' + getErrorMessage(e));
    });
  }

  function eliminar(id) {
    if (!confirm('¿Eliminar usuario?')) return;
    api().eliminarUsuario(id).then(function() {
      cargarUsuarios();
    }).catch(function(e) {
      setError('Error: ' + getErrorMessage(e));
    });
  }

  function editar(usuario) {
    setEditando(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      role: usuario.role
    });
    setShowModal(true);
  }

  const usuariosRows = usuarios.map(function(u) {
    return React.createElement('tr', { key: u.id },
      React.createElement('td', null, u.nombre),
      React.createElement('td', null, u.email),
      React.createElement('td', null, React.createElement('span', { className: 'badge badge-info' }, u.role)),
      React.createElement('td', null, u.estado ? 'Activo' : 'Inactivo'),
      React.createElement('td', null,
        React.createElement('button', { className: 'btn btn-small btn-secondary', onClick: function() { editar(u); } }, 'Editar'),
        ' ',
        React.createElement('button', { className: 'btn btn-small btn-danger', onClick: function() { eliminar(u.id); } }, 'Eliminar')
      )
    );
  });

  return React.createElement('div', { className: 'panel' },
    React.createElement('div', { className: 'panel-header' },
      React.createElement('h2', null, '👥 Gestión de Usuarios'),
      React.createElement('button', { className: 'btn btn-success', onClick: function() {
        setEditando(null);
        setFormData({ nombre: '', email: '', password: '', role: 'vendedor' });
        setShowModal(true);
      }}, '+ Nuevo Usuario')
    ),
    error && React.createElement(AlertBox, { tipo: 'danger', mensaje: error }),
    loading && React.createElement('div', { className: 'spinner' }, 'Cargando...'),
    !loading && React.createElement('div', null,
      React.createElement('table', { className: 'table' },
        React.createElement('thead', null,
          React.createElement('tr', null,
            React.createElement('th', null, 'Nombre'),
            React.createElement('th', null, 'Email'),
            React.createElement('th', null, 'Rol'),
            React.createElement('th', null, 'Estado'),
            React.createElement('th', null, 'Acciones')
          )
        ),
        React.createElement('tbody', null, usuariosRows)
      )
    ),
    showModal && React.createElement(Modal, { 
      titulo: editando ? 'Editar Usuario' : 'Nuevo Usuario',
      onClose: function() { setShowModal(false); }
    },
      React.createElement('form', { onSubmit: guardarUsuario },
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Nombre *'),
          React.createElement('input', { 
            className: 'input',
            value: formData.nombre,
            onChange: function(e) { setFormData(Object.assign({}, formData, { nombre: e.target.value })); },
            required: true
          })
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Email *'),
          React.createElement('input', { 
            className: 'input',
            type: 'email',
            value: formData.email,
            onChange: function(e) { setFormData(Object.assign({}, formData, { email: e.target.value })); },
            required: true
          })
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, editando ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'),
          React.createElement('input', { 
            className: 'input',
            type: 'password',
            value: formData.password,
            onChange: function(e) { setFormData(Object.assign({}, formData, { password: e.target.value })); },
            required: !editando
          })
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Rol *'),
          React.createElement('select', { 
            className: 'input',
            value: formData.role,
            onChange: function(e) { setFormData(Object.assign({}, formData, { role: e.target.value })); },
            required: true
          },
            React.createElement('option', { value: 'vendedor' }, 'Vendedor'),
            React.createElement('option', { value: 'admin' }, 'Administrador')
          )
        ),
        React.createElement('button', { className: 'btn btn-primary btn-large', type: 'submit' }, editando ? 'Actualizar Usuario' : 'Crear Usuario')
      )
    )
  );
}

// ===== CONFIGURACIÓN =====

function Configuracion() {
  const [config, setConfig] = useState({});
  const [porcentajeGanancia, setPorcentajeGanancia] = useState(30);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(function() {
    cargarConfiguracion();
  }, []);

  function cargarConfiguracion() {
    setLoading(true);
    api().getConfiguracion()
      .then(function(res) {
        setConfig(res.data);
        if (res.data.porcentaje_ganancia !== undefined) {
          setPorcentajeGanancia(res.data.porcentaje_ganancia);
        }
        setLoading(false);
      })
      .catch(function(err) {
        setMensaje('Error al cargar configuración: ' + getErrorMessage(err));
        setLoading(false);
      });
  }

  function guardarPorcentaje(e) {
    e.preventDefault();
    
    if (porcentajeGanancia < 0 || porcentajeGanancia > 1000) {
      setMensaje('El porcentaje debe estar entre 0 y 1000');
      return;
    }

    api().setConfiguracion('porcentaje_ganancia', porcentajeGanancia)
      .then(function(res) {
        setMensaje('✓ Configuración guardada correctamente');
        setTimeout(function() { setMensaje(''); }, 3000);
      })
      .catch(function(err) {
        setMensaje('Error al guardar: ' + getErrorMessage(err));
      });
  }

  if (loading) {
    return React.createElement('div', { className: 'panel' },
      React.createElement('div', { className: 'spinner' }, 'Cargando...')
    );
  }

  return React.createElement('div', { className: 'panel' },
    React.createElement('div', { className: 'panel-header' },
      React.createElement('h2', null, '⚙️ Configuración del Sistema')
    ),
    
    mensaje && React.createElement('div', { 
      className: 'alert ' + (mensaje.startsWith('✓') ? 'alert-success' : 'alert-danger'),
      style: { margin: '15px 0' }
    }, mensaje),

    React.createElement('div', { className: 'card', style: { maxWidth: '600px', margin: '20px 0' } },
      React.createElement('h3', null, '💰 Porcentaje de Ganancia'),
      React.createElement('p', { style: { color: '#666', marginBottom: '20px' } }, 
        'Este porcentaje se aplicará automáticamente para calcular el precio de venta de los productos.'
      ),
      React.createElement('form', { onSubmit: guardarPorcentaje },
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Porcentaje de Ganancia (%) *'),
          React.createElement('input', { 
            className: 'input',
            type: 'number',
            min: '0',
            max: '1000',
            step: '0.1',
            value: porcentajeGanancia,
            onChange: function(e) { setPorcentajeGanancia(parseFloat(e.target.value) || 0); },
            required: true,
            placeholder: 'Ej: 30'
          })
        ),
        React.createElement('div', { style: { background: '#f0f6ff', padding: '15px', borderRadius: '8px', marginBottom: '15px' } },
          React.createElement('strong', null, 'Ejemplo de cálculo:'),
          React.createElement('p', { style: { margin: '5px 0' } }, 
            'Si el precio de compra es $100 y el porcentaje es ' + porcentajeGanancia + '%:'
          ),
          React.createElement('p', { style: { margin: '5px 0', fontSize: '16px', color: '#667eea' } }, 
            'Precio de venta = $100 + ($100 × ' + porcentajeGanancia + '%) = $' + (100 + (100 * porcentajeGanancia / 100)).toFixed(2)
          )
        ),
        React.createElement('button', { type: 'submit', className: 'btn btn-success btn-large' }, 
          '💾 Guardar Configuración'
        )
      )
    ),

    React.createElement('div', { className: 'card', style: { maxWidth: '600px', margin: '20px 0' } },
      React.createElement('h3', null, 'ℹ️ Información'),
      React.createElement('p', null, '• El precio de venta se calcula automáticamente al registrar compras'),
      React.createElement('p', null, '• El cálculo es: precio_venta = precio_compra + (precio_compra × % / 100)'),
      React.createElement('p', null, '• Los cambios en el porcentaje solo afectan nuevas compras'),
      React.createElement('p', null, '• Puedes modificar este valor en cualquier momento')
    )
  );
}

// ===== GESTIÓN DE PROVEEDORES =====

function GestionProveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    email: '',
    telefono: '',
    pais: '',
    condiciones_pago: '',
    lead_time_dias: 0
  });
  const [mensaje, setMensaje] = useState('');

  useEffect(function() {
    cargarProveedores();
  }, []);

  function cargarProveedores() {
    api().getProveedores()
      .then(function(res) {
        setProveedores(res.data || []);
        setMensaje('');
      })
      .catch(function(err) {
        setMensaje('Error: ' + getErrorMessage(err));
      });
  }

  function guardarProveedor(e) {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setMensaje('El nombre es requerido');
      return;
    }

    api().crearProveedor(formData)
      .then(function(res) {
        setMensaje('✓ Proveedor guardado correctamente');
        setShowModal(false);
        setFormData({ nombre: '', contacto: '', email: '', telefono: '', pais: '', condiciones_pago: '', lead_time_dias: 0 });
        setEditando(null);
        cargarProveedores();
      })
      .catch(function(err) {
        setMensaje('Error: ' + getErrorMessage(err));
      });
  }

  function abrirModal() {
    setEditando(null);
    setFormData({ nombre: '', contacto: '', email: '', telefono: '', pais: '', condiciones_pago: '', lead_time_dias: 0 });
    setShowModal(true);
  }

  function editar(proveedor) {
    setEditando(proveedor);
    setFormData({
      nombre: proveedor.nombre,
      contacto: proveedor.contacto || '',
      email: proveedor.email || '',
      telefono: proveedor.telefono || '',
      pais: proveedor.pais || '',
      condiciones_pago: proveedor.condiciones_pago || '',
      lead_time_dias: proveedor.lead_time_dias || 0
    });
    setShowModal(true);
  }

  function eliminar(proveedor) {
    if (confirm('¿Estás seguro de que deseas eliminar al proveedor "' + proveedor.nombre + '"?')) {
      setMensaje('Eliminando...');
      // Aquí iría la llamada a la API para eliminar
      // Por ahora solo mostramos el mensaje
      setTimeout(function() {
        setMensaje('⚠️ Función de eliminar aún no implementada en el backend');
      }, 500);
    }
  }

  var proveedoresRows = proveedores.map(function(proveedor) {
    return React.createElement('div', { key: proveedor.id, className: 'proveedor-card' },
      React.createElement('div', { className: 'proveedor-card-header' },
        React.createElement('h3', { className: 'proveedor-nombre' }, proveedor.nombre),
        React.createElement('div', { className: 'proveedor-acciones' },
          React.createElement('button', { 
            className: 'btn btn-small btn-secondary',
            onClick: function() { editar(proveedor); },
            title: 'Editar'
          }, '✏️ Editar'),
          React.createElement('button', { 
            className: 'btn btn-small btn-danger',
            onClick: function() { eliminar(proveedor); },
            title: 'Eliminar'
          }, '🗑️ Eliminar')
        )
      ),
      React.createElement('div', { className: 'proveedor-card-body' },
        React.createElement('div', { className: 'proveedor-field' },
          React.createElement('span', { className: 'proveedor-label' }, 'Contacto:'),
          React.createElement('span', { className: 'proveedor-value' }, proveedor.contacto || React.createElement('em', null, 'N/A'))
        ),
        React.createElement('div', { className: 'proveedor-field' },
          React.createElement('span', { className: 'proveedor-label' }, 'Email:'),
          React.createElement('span', { className: 'proveedor-value' }, 
            proveedor.email ? 
              React.createElement('a', { href: 'mailto:' + proveedor.email, className: 'email-link' }, proveedor.email) : 
              React.createElement('em', null, 'N/A')
          )
        ),
        React.createElement('div', { className: 'proveedor-field' },
          React.createElement('span', { className: 'proveedor-label' }, 'Teléfono:'),
          React.createElement('span', { className: 'proveedor-value' }, proveedor.telefono || React.createElement('em', null, 'N/A'))
        ),
        React.createElement('div', { className: 'proveedor-field' },
          React.createElement('span', { className: 'proveedor-label' }, 'País:'),
          React.createElement('span', { className: 'proveedor-value' }, proveedor.pais || React.createElement('em', null, 'N/A'))
        ),
        React.createElement('div', { className: 'proveedor-field' },
          React.createElement('span', { className: 'proveedor-label' }, 'Lead Time:'),
          React.createElement('span', { className: 'proveedor-value badge badge-info' }, (proveedor.lead_time_dias || 0) + ' días')
        ),
        React.createElement('div', { className: 'proveedor-field' },
          React.createElement('span', { className: 'proveedor-label' }, 'Condiciones:'),
          React.createElement('span', { className: 'proveedor-value' }, proveedor.condiciones_pago || React.createElement('em', null, 'N/A'))
        )
      )
    );
  });

  return React.createElement('div', { className: 'panel providers-panel' },
    React.createElement('div', { className: 'panel-header' },
      React.createElement('h2', null, '🏭 Gestión de Proveedores'),
      React.createElement('button', { 
        className: 'btn btn-primary',
        onClick: abrirModal
      }, '➕ Nuevo Proveedor')
    ),
    
    mensaje && React.createElement('div', { 
      className: 'alert ' + (mensaje.startsWith('✓') ? 'alert-success' : 'alert-danger'),
      style: { margin: '15px 0' }
    }, mensaje),

    proveedores.length === 0 ? 
      React.createElement('div', { className: 'empty-state' },
        React.createElement('div', { className: 'empty-icon' }, '🏭'),
        React.createElement('h3', null, 'Sin proveedores'),
        React.createElement('p', null, 'No hay proveedores registrados. ¡Crea uno para empezar!'),
        React.createElement('button', { 
          className: 'btn btn-primary',
          onClick: abrirModal
        }, '➕ Crear Proveedor')
      ) :
      React.createElement('div', { className: 'proveedores-list' }, proveedoresRows),

    showModal && React.createElement(Modal, { 
      titulo: editando ? 'Editar Proveedor' : 'Nuevo Proveedor',
      onClose: function() { setShowModal(false); }
    },
      React.createElement('form', { onSubmit: guardarProveedor },
        React.createElement('div', { className: 'form-row' },
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Nombre *'),
            React.createElement('input', { 
              className: 'input',
              value: formData.nombre,
              onChange: function(e) { setFormData(Object.assign({}, formData, { nombre: e.target.value })); },
              required: true
            })
          ),
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Contacto'),
            React.createElement('input', { 
              className: 'input',
              value: formData.contacto,
              onChange: function(e) { setFormData(Object.assign({}, formData, { contacto: e.target.value })); }
            })
          )
        ),
        React.createElement('div', { className: 'form-row' },
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Email'),
            React.createElement('input', { 
              className: 'input',
              type: 'email',
              value: formData.email,
              onChange: function(e) { setFormData(Object.assign({}, formData, { email: e.target.value })); }
            })
          ),
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Teléfono'),
            React.createElement('input', { 
              className: 'input',
              value: formData.telefono,
              onChange: function(e) { setFormData(Object.assign({}, formData, { telefono: e.target.value })); }
            })
          )
        ),
        React.createElement('div', { className: 'form-row' },
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'País'),
            React.createElement('input', { 
              className: 'input',
              value: formData.pais,
              onChange: function(e) { setFormData(Object.assign({}, formData, { pais: e.target.value })); }
            })
          ),
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Lead Time (días)'),
            React.createElement('input', { 
              className: 'input',
              type: 'number',
              value: formData.lead_time_dias,
              onChange: function(e) { setFormData(Object.assign({}, formData, { lead_time_dias: parseInt(e.target.value) || 0 })); }
            })
          )
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Condiciones de Pago'),
          React.createElement('input', { 
            className: 'input',
            placeholder: 'Ej: Neto 30 días',
            value: formData.condiciones_pago,
            onChange: function(e) { setFormData(Object.assign({}, formData, { condiciones_pago: e.target.value })); }
          })
        ),
        React.createElement('div', { className: 'form-actions' },
          React.createElement('button', { type: 'submit', className: 'btn btn-success' }, editando ? 'Actualizar' : 'Guardar'),
          React.createElement('button', { type: 'button', className: 'btn btn-secondary', onClick: function() { setShowModal(false); } }, 'Cancelar')
        )
      )
    )
  );
}

// ===== APLICACIÓN PRINCIPAL =====

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));
  const [tabActiva, setTabActiva] = useState('ventas');
  const [usuario, setUsuario] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(function() {
    if (loggedIn) {
      const token = localStorage.getItem('token');
      const decoded = decodeToken(token);
      setUsuario(decoded);
    }
  }, [loggedIn]);

  function logout() {
    localStorage.removeItem('token');
    setLoggedIn(false);
    setUsuario(null);
    setTabActiva('ventas');
  }

  if (!loggedIn) {
    return React.createElement(Login, { onLogin: function() { setLoggedIn(true); } });
  }

  // Esperar a que el usuario se decodifique
  if (!usuario) {
    return React.createElement('div', { className: 'app-container' },
      React.createElement('div', { style: { textAlign: 'center', padding: '40px' } },
        React.createElement('p', null, 'Cargando...')
      )
    );
  }

  // Control de acceso: redirigir si intenta acceder sin permisos
  if (!tienePermiso(usuario, tabActiva)) {
    return React.createElement('div', { className: 'app-with-sidebar' },
      React.createElement(Sidebar, { 
        usuario: usuario,
        tabActiva: tabActiva,
        setTabActiva: setTabActiva,
        onLogout: logout,
        isOpen: isSidebarOpen,
        onClose: function() { setIsSidebarOpen(false); }
      }),
      React.createElement('div', { className: 'app-content' },
        React.createElement('div', { className: 'app-header' },
          React.createElement('button', { 
            className: 'btn-hamburger',
            onClick: function() { setIsSidebarOpen(!isSidebarOpen); },
            title: 'Abrir menú'
          }, '☰'),
          React.createElement('h2', null, usuario.nombre || usuario.name || 'Usuario'),
          React.createElement('span', { 
            className: 'role-badge ' + ((usuario.role === 'admin' || usuario.role === 'administrador') ? 'badge-admin' : 'badge-vendedor') 
          }, 
            (usuario.role === 'admin' || usuario.role === 'administrador') ? 'ADMIN' : 'VENDEDOR'
          )
        ),
        React.createElement('div', { className: 'alert alert-danger', style: { margin: '20px' } },
          '❌ No tienes permisos para acceder a este módulo. Serás redirigido...'
        )
      )
    );
  }

  return React.createElement('div', { className: 'app-with-sidebar' },
    // Sidebar
    React.createElement(Sidebar, { 
      usuario: usuario,
      tabActiva: tabActiva,
      setTabActiva: setTabActiva,
      onLogout: logout,
      isOpen: isSidebarOpen,
      onClose: function() { setIsSidebarOpen(false); }
    }),
    
    // Contenido principal
    React.createElement('div', { className: 'app-content' },
      React.createElement('div', { className: 'app-header' },
        React.createElement('button', { 
          className: 'btn-hamburger',
          onClick: function() { setIsSidebarOpen(!isSidebarOpen); },
          title: 'Abrir menú'
        }, '☰'),
        React.createElement('h2', null, usuario && usuario.nombre),
        React.createElement('span', { className: 'role-badge badge-' + (usuario && usuario.role) }, usuario && usuario.role.toUpperCase())
      ),
      
      React.createElement('div', { className: 'content-area' },
        // Ventas - Accesible para admin y vendedor
        tabActiva === 'ventas' && React.createElement(ProtectedRoute, { usuario: usuario, roles: ['admin', 'vendedor'] },
          React.createElement(Ventas, null)
        ),
        
        // Devoluciones - Accesible para admin y vendedor
        tabActiva === 'devoluciones' && React.createElement(ProtectedRoute, { usuario: usuario, roles: ['admin', 'vendedor'] },
          React.createElement(GestionDevoluciones, null)
        ),
        
        // Admin only
        tabActiva === 'productos' && React.createElement(ProtectedRoute, { usuario: usuario, roles: ['admin'] },
          React.createElement(GestionProductos, null)
        ),
        tabActiva === 'categorias' && React.createElement(ProtectedRoute, { usuario: usuario, roles: ['admin'] },
          React.createElement(GestionCategorias, null)
        ),
        tabActiva === 'lotes' && React.createElement(ProtectedRoute, { usuario: usuario, roles: ['admin'] },
          React.createElement(GestionLotes, null)
        ),
        tabActiva === 'compras' && React.createElement(ProtectedRoute, { usuario: usuario, roles: ['admin'] },
          React.createElement(GestionCompras, null)
        ),
        tabActiva === 'proveedores' && React.createElement(ProtectedRoute, { usuario: usuario, roles: ['admin'] },
          React.createElement(GestionProveedores, null)
        ),
        tabActiva === 'reportes' && React.createElement(ProtectedRoute, { usuario: usuario, roles: ['admin'] },
          React.createElement(Reportes, null)
        ),
        tabActiva === 'alertas' && React.createElement(ProtectedRoute, { usuario: usuario, roles: ['admin'] },
          React.createElement(GestionAlertas, null)
        ),
        tabActiva === 'usuarios' && React.createElement(ProtectedRoute, { usuario: usuario, roles: ['admin'] },
          React.createElement(GestionUsuarios, null)
        ),
        tabActiva === 'configuracion' && React.createElement(ProtectedRoute, { usuario: usuario, roles: ['admin'] },
          React.createElement(Configuracion, null)
        )
      )
    )
  );
}

// Renderizar la aplicación
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App, null));
