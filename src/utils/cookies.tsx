"use client";

export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') {
    console.warn('getCookie called on server side');
    return null;
  }

  try {    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(";").shift() || null;
      return cookieValue;
    }
    
    return null;
  } catch (error) {
    console.error("Cookie parsing error:", error);
    return null;
  }
}