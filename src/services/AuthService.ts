export class AuthService {
  private baseUrl = 'https://unipass.isdapps.uk';

  async authenticateUser(matricula: string, correo: string, contrasena: string): Promise<Record<string, any>> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Matricula: matricula,
          Correo: correo,
          Contraseña: contrasena,
        }),
      });

      if (response.status === 200) {
        const userData = await response.json();
        // Store the user ID in localStorage
        localStorage.setItem('userId', userData.user.IdLogin.toString());
        return userData;
      } else {
        const errorText = await response.text();
        throw new Error(`Authentication failed: ${errorText}`);
      }
    } catch (error: any) {
      console.error('Error in authenticateUser:', error);
      throw new Error(`Failed to authenticate user: ${error.message}`);
    }
  }

  async updatePassword(correo: string, newPassword: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/password/${correo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ NewPassword: newPassword }),
      });

      if (response.status === 200) {
        return true; // Contraseña actualizada con éxito
      } else if (response.status === 404) {
        throw new Error('No se pudo actualizar la contraseña: Usuario no encontrado');
      } else {
        const errorText = await response.text();
        throw new Error(`Error al actualizar la contraseña: ${errorText}`);
      }
    } catch (error: any) {
      console.error('Error en updatePassword:', error);
      throw new Error(`Fallo en la actualización de la contraseña: ${error.message}`);
    }
  }

  async getInfoMatricula(matricula: string): Promise<Record<string, any> | null> {
    try {
      const response = await fetch(`${this.baseUrl}/userMatricula/${matricula}`);

      if (response.status === 200) {
        return await response.json();
      } else {
        throw new Error('Failed to load user info');
      }
    } catch (error: any) {
      console.error('Error en getInfoMatricula:', error);
      throw new Error('Failed to load user info');
    }
  }
}

export default new AuthService();