/**
 * Genera un id único local. No necesita ser criptográficamente seguro: solo
 * identifica filas dentro de la base de datos de este mismo dispositivo.
 */
export function createId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
