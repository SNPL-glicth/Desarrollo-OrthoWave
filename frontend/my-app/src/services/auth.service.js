import api from './api';

export const authService = {
  async login(email, password) {
    try {
      console.log('Iniciando solicitud de login con:', { email });
      
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      // Log de la respuesta completa (sin datos sensibles)
      console.log('Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        hasData: !!response.data,
        hasToken: !!response.data?.access_token,
        hasUser: !!response.data?.user
      });

      // Validación más detallada de la respuesta
      if (!response.data) {
        console.error('Error: No se recibieron datos del servidor');
        throw new Error('No se recibieron datos del servidor');
      }

      if (!response.data.access_token) {
        console.error('Error: No se recibió el token de acceso');
        throw new Error('No se recibió el token de acceso');
      }

      if (!response.data.user) {
        console.error('Error: No se recibieron los datos del usuario');
        throw new Error('No se recibieron los datos del usuario');
      }

      // Validar que el usuario tenga todos los campos necesarios
      const requiredFields = ['id', 'email', 'nombre', 'apellido', 'rol'];
      const missingFields = requiredFields.filter(field => !response.data.user[field]);
      
      if (missingFields.length > 0) {
        console.error('Error: Campos faltantes en el usuario:', missingFields);
        throw new Error(`Datos de usuario incompletos. Faltan: ${missingFields.join(', ')}`);
      }

      // Guardar en localStorage
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      console.log('Login exitoso. Usuario:', {
        id: response.data.user.id,
        email: response.data.user.email,
        rol: response.data.user.rol
      });
      
      return response.data;
    } catch (error) {
      console.error('Error detallado en login:', {
        name: error.name,
        message: error.message,
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        },
        request: error.request ? 'Existe' : 'No existe'
      });

      // Manejar diferentes tipos de errores
      if (error.response) {
        // El servidor respondió con un status fuera del rango 2xx
        if (error.response.status === 401) {
          throw new Error('Credenciales incorrectas. Por favor verifica tu email y contraseña.');
        } else if (error.response.status === 404) {
          throw new Error('Servicio de autenticación no encontrado. Por favor contacta al administrador.');
        } else {
          throw new Error(error.response.data?.message || 'Error en el servidor. Por favor intenta más tarde.');
        }
      } else if (error.request) {
        // La solicitud se hizo pero no se recibió respuesta
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        // Error en la configuración de la solicitud
        throw new Error('Error al procesar la solicitud: ' + error.message);
      }
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Error en el registro');
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        throw new Error('Error al procesar la solicitud: ' + error.message);
      }
    }
  },

  async verifyCode(email, code) {
    try {
      const response = await api.post('/auth/verify', { email, code });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Error en la verificación');
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        throw new Error('Error al procesar la solicitud: ' + error.message);
      }
    }
  },

  logout() {
    try {
      console.log('Cerrando sesión...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('Sesión cerrada exitosamente');
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  },

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      console.log('Obteniendo usuario actual:', {
        userExists: !!userStr,
        tokenExists: !!token
      });

      if (!userStr || !token) {
        return null;
      }

      const user = JSON.parse(userStr);
      console.log('Usuario actual:', user);
      return user;
    } catch (error) {
      console.error('Error al obtener el usuario actual:', error);
      this.logout();
      return null;
    }
  },

  getToken() {
    const token = localStorage.getItem('token');
    console.log('Token actual:', token ? 'Existe' : 'No existe');
    return token;
  },

  isAuthenticated() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    const isAuth = !!(token && user);
    console.log('Estado de autenticación:', {
      hasToken: !!token,
      hasUser: !!user,
      isAuthenticated: isAuth
    });
    return isAuth;
  },
}; 