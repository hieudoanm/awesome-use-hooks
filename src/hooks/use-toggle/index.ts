import { useState, useCallback } from 'react';

export const useToggle = (initialState = false) => {
  // Initialize the state
  const [state, setState] = useState(initialState);

  // Define and memorize toggler function in case we pass down the component,
  // This function change the boolean value to it's opposite value
  const toggle = useCallback(() => setState((state: boolean) => !state), []);

  return [state, toggle];
};

export default useToggle;