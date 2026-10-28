/**
 * Utility function to generate initials from a name
 * @param {string} name - The full name
 * @returns {string} The initials
 */
export const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Cool-spectrum hues (teal, cyan, blue, indigo neighborhoods) so the generated
// avatars sit inside the glacial "Solar Inversion" palette instead of clashing
// with warm tones.
const AVATAR_HUES = [175, 190, 205, 220, 240, 260, 285, 160];

/**
 * Deterministic avatar color derived from the participant name.
 * Same name always yields the same color; mid-saturation tones read well on
 * both the light and dark schemes.
 * @param {string} name - The full name (or email)
 * @returns {{ bgcolor: string, color: string }} sx-ready colors
 */
export const getAvatarColor = (name) => {
  let hash = 0;
  const str = String(name || "?");
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  const hue = AVATAR_HUES[Math.abs(hash) % AVATAR_HUES.length];
  return {
    // Muted saturation so avatars read as part of the surface system rather
    // than competing with the accent color, in both light and dark schemes.
    bgcolor: `hsl(${hue}, 32%, 42%)`,
    color: "#FFFFFF",
  };
};

/**
 * Get avatar size in pixels
 * @param {string} size - 'small' | 'medium' | 'large'
 * @returns {number} Size in pixels
 */
export const getAvatarSize = (size = "medium") => {
  const sizeMap = {
    small: 32,
    medium: 40,
    large: 56,
  };
  return sizeMap[size] || sizeMap.medium;
};
