/**
 * Traduce mensajes de error de Supabase/PostgreSQL al español.
 */
export function translateError(message: string): string {
  if (!message) return "Ocurrió un error inesperado.";

  const msg = message.toLowerCase();

  if (msg.includes("duplicate key") || msg.includes("unique constraint"))
    return "Ya existe un registro con esos datos.";
  if (msg.includes("violates foreign key"))
    return "No se puede completar la operación porque hay datos relacionados.";
  if (msg.includes("not null") || msg.includes("null value"))
    return "Completá todos los campos obligatorios.";
  if (msg.includes("jwt expired") || msg.includes("invalid jwt") || msg.includes("not authenticated"))
    return "Tu sesión expiró. Volvé a iniciar sesión.";
  if (msg.includes("permission denied") || msg.includes("row-level security"))
    return "No tenés permiso para realizar esta acción.";
  if (msg.includes("network") || msg.includes("fetch"))
    return "Error de conexión. Verificá tu internet e intentá de nuevo.";
  if (msg.includes("timeout"))
    return "La operación tardó demasiado. Intentá de nuevo.";
  if (msg.includes("invalid input") || msg.includes("invalid value"))
    return "Algunos datos ingresados no son válidos.";

  // Fallback: devolver el mensaje original si no hay traducción
  return message;
}