# React useHooks

- [Hooks](#hooks)
  - [useAsync](#useasync)
  - [useDebounce](#usedebounce)
  - [useEffectOnce](#useeffectonce)
  - [useHover](#usehover)
  - [useInterval](#useinterval)
  - [useIsFirstRender](#useisfirstrender)
  - [useIsMounted](#useismounted)
  - [useKeyPress](#usekeypress)
  - [useLocalStorage](#uselocalstorage)
  - [useLockBodyScroll](#uselockbodyscroll)
  - [useOnClickOutside](#useonclickoutside)
  - [useScript](#usescript)
  - [useTimeout](#usetimeout)
  - [useToggle](#usetoggle)
  - [useUpdateEffect](#useupdateeffect)
  - [useWindowSize](#usewindowsize)
- [Reference](#reference)

## Hooks

### useAsync

```ts
import { useState, useCallback, useEffect } from 'react';

// Hook
export const useAsync = <T>(
  asyncFunction: () => Promise<T>,
  immediate = true,
) => {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [response, setValue] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  // The execute function wraps asyncFunction and
  // handles setting state for loading, value, and error.
  // useCallback ensures the below useEffect is not called
  // on every render, but only if asyncFunction changes.
  const execute = useCallback(() => {
    setStatus('loading');
    setValue(null);
    setError(null);
    return asyncFunction()
      .then((asyncResponse: T) => {
        setValue(asyncResponse);
        setStatus('success');
      })
      .catch((error: Error) => {
        setError(error);
        setStatus('error');
      });
  }, [asyncFunction]);

  // Call execute if we want to fire it right away.
  // Otherwise execute can be called later, such as
  // in an onClick handler.
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, response, error };
};

export default useAsync;
```

### useDebounce

```ts
import { useEffect, useState } from 'react';

// Hook
export const useDebounce = <T>(value: T, delay: number) => {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay], // Only re-call effect if value or delay changes
  );
  return debouncedValue;
};

export default useDebounce;
```

### useEffectOnce

```ts
import { EffectCallback, useEffect } from 'react';

export const useEffectOnce = (effect: EffectCallback): void => {
  useEffect(effect, []);
};

export default useEffectOnce;
```

### useHover

```ts
import { useEffect, useRef, useState } from 'react';

export const useHover = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [value, setValue] = useState(false);
  const handleMouseOver = () => setValue(true);
  const handleMouseOut = () => setValue(false);

  useEffect(
    () => {
      const node = ref.current;
      if (node) {
        node.addEventListener('mouseover', handleMouseOver);
        node.addEventListener('mouseout', handleMouseOut);
        return () => {
          node.removeEventListener('mouseover', handleMouseOver);
          node.removeEventListener('mouseout', handleMouseOut);
        };
      }
    },
    [ref.current], // Recall only if ref changes
  );
  return [ref, value];
};

export default useHover;
```

### useInterval

```ts
import { useEffect, useRef } from 'react';

export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (!delay && delay !== 0) {
      return;
    }

    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay]);
};

export default useInterval;
```

### useIsFirstRender

```ts
import { useRef } from 'react';

export const useIsFirstRender = (): boolean => {
  const isFirst = useRef<boolean>(true);

  if (isFirst.current) {
    isFirst.current = false;

    return true;
  }

  return isFirst.current;
};

export default useIsFirstRender;
```

### useIsMounted

```ts
import { useCallback, useEffect, useRef } from 'react';

export const useIsMounted = (): (() => boolean) => {
  const isMounted = useRef<boolean>(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
};

export default useIsMounted;
```

### useKeyPress

```ts
import { useEffect, useState } from 'react';

// Hook
export const useKeyPress = (targetKey: string) => {
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = useState<boolean>(false);
  // If pressed key is our target key then set to true
  function downHandler({ key }: { key: string }) {
    if (key === targetKey) {
      setKeyPressed(true);
    }
  }
  // If released key is our target key then set to false
  const upHandler = ({ key }: { key: string }) => {
    if (key === targetKey) {
      setKeyPressed(false);
    }
  };
  // Add event listeners
  useEffect(() => {
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount
  return keyPressed;
};

export default useKeyPress;
```

### useLocalStorage

```ts
import { useState } from 'react';

const parseJSON = <T>(jsonString: string, fallbackValue: T) => {
  try {
    return jsonString ? JSON.parse(jsonString) : fallbackValue;
  } catch (error) {
    console.error(error);
    return fallbackValue;
  }
};

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    // Get from local storage by key
    const item: string = window.localStorage.getItem(key) || '';
    // Parse stored json or if none return initialValue
    return parseJSON(item, initialValue);
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  return [storedValue, setValue];
};

export default useLocalStorage;
```

### useLockBodyScroll

```ts
import { useLayoutEffect } from 'react';

export const useLockBodyScroll = () => {
  useLayoutEffect(() => {
    // Get original body overflow
    const originalStyle = window.getComputedStyle(document.body).overflow;
    // Prevent scrolling on mount
    document.body.style.overflow = 'hidden';
    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []); // Empty array ensures effect is only run on mount and unmount
};

export default useLockBodyScroll;
```

### useOnClickOutside

```ts
import { RefObject, useEffect } from 'react';

// Hook
export const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent) => void,
) => {
  useEffect(
    () => {
      const listener = (event: any) => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }
        handler(event);
      };
      document.addEventListener('mousedown', listener);
      //   document.addEventListener('touchstart', listener);
      return () => {
        document.removeEventListener('mousedown', listener);
        // document.removeEventListener('touchstart', listener);
      };
    },
    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... callback/cleanup to run every render. It's not a big deal ...
    // ... but to optimize you can wrap handler in useCallback before ...
    // ... passing it into this hook.
    [ref, handler],
  );
};

export default useOnClickOutside;
```

### useScript

```ts
import { useEffect, useState } from 'react';

type ScriptStatus = 'loading' | 'idle' | 'ready' | 'error';

// Hook
export const useScript = (src: string) => {
  // Keep track of script status ("idle", "loading", "ready", "error")
  const [status, setStatus] = useState<ScriptStatus>(src ? 'loading' : 'idle');
  useEffect(
    () => {
      // Allow falsy src value if waiting on other data needed for
      // constructing the script URL passed to this hook.
      if (!src) {
        setStatus('idle');
        return;
      }
      // Fetch existing script element by src
      // It may have been added by another intance of this hook
      let script: HTMLScriptElement | null = document.querySelector(
        `script[src="${src}"]`,
      );
      if (!script) {
        // Create script
        script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.setAttribute('data-status', 'loading');
        // Add script to document body
        document.body.appendChild(script);
        // Store status in attribute on script
        // This can be read by other instances of this hook
        const setAttributeFromEvent = (event: any) => {
          script?.setAttribute(
            'data-status',
            event.type === 'load' ? 'ready' : 'error',
          );
        };
        script.addEventListener('load', setAttributeFromEvent);
        script.addEventListener('error', setAttributeFromEvent);
      } else {
        // Grab existing script status from attribute and set to state.
        setStatus(
          (script.getAttribute('data-status') as ScriptStatus) || 'error',
        );
      }
      // Script event handler to update status in state
      // Note: Even if the script already exists we still need to add
      // event handlers to update the state for *this* hook instance.
      const setStateFromEvent = (event: any) => {
        setStatus(event.type === 'load' ? 'ready' : 'error');
      };
      // Add event listeners
      script.addEventListener('load', setStateFromEvent);
      script.addEventListener('error', setStateFromEvent);
      // Remove event listeners on cleanup
      return () => {
        if (script) {
          script.removeEventListener('load', setStateFromEvent);
          script.removeEventListener('error', setStateFromEvent);
        }
      };
    },
    [src], // Only re-run effect if script src changes
  );
  return status;
};

export default useScript;
```

### useTimeout

```ts
import { useEffect, useRef } from 'react';

export const useTimeout = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the timeout.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (!delay && delay !== 0) {
      return;
    }

    const id = setTimeout(() => savedCallback.current(), delay);

    return () => clearTimeout(id);
  }, [delay]);
};

export default useTimeout;
```

### useToggle

```ts
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
```

### useUpdateEffect

```ts
import { DependencyList, EffectCallback, useEffect } from 'react';

import { useIsFirstRender } from '../use-is-first-render';

export const useUpdateEffect = (
  effect: EffectCallback,
  deps?: DependencyList,
): void => {
  const isFirst = useIsFirstRender();

  useEffect(() => {
    if (!isFirst) {
      return effect();
    }
  }, deps);
};

export default useUpdateEffect;
```

### useWindowSize

```ts
import { useEffect, useState } from 'react';

type WindowSize = { width?: number; height?: number };

export const useWindowSize = (): WindowSize => {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  });

  // Handler to call on window resize
  const handleResize = () => {
    // Set window width/height to state
    setWindowSize({
      width: window?.innerWidth,
      height: window?.innerHeight,
    });
  };

  useEffect(() => {
    // Add event listener
    window.addEventListener('resize', handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
};

export default useWindowSize;
```

## Reference

- [use-hooks](https://usehooks.com/)
- [use-hooks-ts](https://usehooks-ts.com/)
