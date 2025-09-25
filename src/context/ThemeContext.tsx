import { createContext, type Context } from 'react';

// 1. Định nghĩa interface cho Context
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// 2. Tạo Context với giá trị mặc định
export const ThemeContext: Context<ThemeContextType> = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});