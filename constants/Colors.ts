const tintColorLight = '#FF7031'; // Orange for light mode
const tintColorDark = '#ff6622'; // Darker orange for dark mode

export const Colors = {
  light: {
    text: '#11181C', // Dark gray for text
    background: '#FFFFFF', // White background
    tint: tintColorLight, // Orange for icons and accents
    icon: '#687076', // Gray for inactive icons
    tabIconDefault: '#687076', // Gray for inactive tab icons
    tabIconSelected: tintColorLight, // Orange for active tab icons
    cardBackground: '#F8F9FA', // Light gray for cards
    border: '#E0E0E0', // Light gray for borders
    unfocused: '#E0E0E0', // Light gray for unfocused text
    lessDarkBackground: '#F2F2F2', // Lighter gray for secondary backgrounds
    success: '#28A745', // Green for success messages
    warning: '#FFC107', // Yellow for warnings
    error: '#DC3545', // Red for errors
    veg: '#7CFF9A', // Green for vegetarian dishes
    nonVeg: '#FF7C7C', // Red for non-vegetarian dishes
  },
  dark: {
    text: '#ECEDEE', // Light gray for text
    background: '#222222', // Dark background
    tint: tintColorDark, // Darker orange for icons and accents
    icon: '#9BA1A6', // Gray for inactive icons
    tabIconDefault: '#9BA1A6', // Gray for inactive tab icons
    tabIconSelected: tintColorDark, // Darker orange for active tab icons
    cardBackground: '#1E1E1E', // Dark gray for cards
    border: '#333333', // Dark gray for borders
    unfocused: '#333333', // Dark gray for unfocused text
    lessDarkBackground: '#2A2A2A', // Lighter black for secondary backgrounds
    success: '#28A745', // Green for success messages
    warning: '#FFC107', // Yellow for warnings
    error: '#DC3545', // Red for errors
    veg: '#004A11', // Green for vegetarian dishes
    nonVeg: '#790000', // Red for non-vegetarian dishes
  },
};