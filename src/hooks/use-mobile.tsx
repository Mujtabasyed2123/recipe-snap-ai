import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false); // Default to false for consistent SSR
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true); // Signal that the component has mounted and client-side logic can run

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const onChange = () => {
      setIsMobile(mql.matches); // mql.matches directly gives a boolean
    };
    
    // Listen for changes in the media query
    mql.addEventListener("change", onChange);
    
    // Set the initial value after mount based on the current media query state
    setIsMobile(mql.matches); 

    // Cleanup listener on unmount
    return () => mql.removeEventListener("change", onChange);
  }, []); // Empty dependency array ensures this effect runs only once on the client, after mount

  // If the component has not mounted yet (i.e., we are on the server or during initial client render before useEffect runs),
  // return the default value (false) to ensure consistency.
  if (!hasMounted) {
    return false;
  }

  // Once mounted, return the actual calculated isMobile state.
  return isMobile;
}
