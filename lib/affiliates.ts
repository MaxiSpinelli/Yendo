/**
 * Links de afiliados de Yendo.
 * Cuando lleguen los links aprobados de CJ Affiliate, reemplazá los valores acá.
 * El resto de la app los usa automáticamente.
 */

export const AFFILIATE_LINKS = {
  booking: {
    // Reemplazar con el link aprobado de CJ Affiliate (ID 17288992)
    homepage: "https://www.booking.com/",
    // Búsqueda por destino — se construye dinámicamente con el destino del viaje
    search: (destination: string) =>
      `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}`,
  },
  flights: {
    // Reemplazar con el link aprobado de CJ Affiliate (ID 17288993)
    homepage: "https://www.booking.com/flights",
    // Búsqueda por origen/destino
    search: (origin: string, destination: string) =>
      `https://www.booking.com/flights#${encodeURIComponent(origin)}-${encodeURIComponent(destination)}`,
  },
};