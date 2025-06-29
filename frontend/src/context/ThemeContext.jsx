// src/contexts/ThemeContext.js
import React, { createContext, useState, useEffect } from "react";

// Create the context
export const ThemeContext = createContext();

// Create a provider component
export const ThemeProvider = ({ children }) => {
  // Initialize darkMode state from localStorage.
  // It checks for a 'themeMode' item in localStorage.
  // If not found, it defaults to the user's system preference (prefers-color-scheme).
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem("themeMode");
      if (savedMode === "light") {
        return false; // User previously chose light mode
      } else if (savedMode === "dark") {
        return true; // User previously chose dark mode
      } else {
        // No saved preference, use system preference
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
    } catch (error) {
      console.error("Failed to read themeMode from localStorage:", error);
      return true; // Default to dark mode on error or if localStorage is unavailable
    }
  });

  // useEffect hook to apply or remove the 'dark' class on the <html> tag
  // and update the preference in localStorage whenever 'darkMode' state changes.
  useEffect(() => {
    const html = document.documentElement; // Get the root <html> element
    try {
      if (darkMode) {
        html.classList.add("dark"); // Add 'dark' class
        html.classList.remove("light"); // Ensure 'light' is removed if it exists
      } else {
        html.classList.add("light"); // Add 'light' class
        html.classList.remove("dark"); // Ensure 'dark' is removed if it exists
      }
      // Save the current mode to localStorage for persistence
      localStorage.setItem("themeMode", darkMode ? "dark" : "light");
    } catch (error) {
      console.error(
        "Failed to set themeMode in localStorage or apply class:",
        error
      );
    }
  }, [darkMode]); // Dependency array: runs whenever 'darkMode' state changes

  // Function to toggle between dark and light mode
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode); // Toggles the boolean value
  };

  // The ThemeProvider makes 'darkMode' and 'toggleDarkMode' available to its children
  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
