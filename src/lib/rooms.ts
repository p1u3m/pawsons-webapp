// Rooms: one per house. A member owns the room of their own house after the
// quiz and unlocks the others with Coin (see supabase/migrations/*_room_unlocks.sql).

/** Mirrors private.room_price() in the database, which is what actually charges. */
export const roomPrice = 100;
