import { useCallback, useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { sleep } from "../../../global/utils";

const inputKeys = ["w", "a", "s", "d", " "];

const createTouchInputCallback = (setInput, inputStr) => {
  return () => {
    (async () => {
      setInput(inputStr);
      await sleep(1);
      setInput("");
    })();
  };
};

const useInputs = () => {
  const [input, setInput] = useState();
  const touchHandlers = useSwipeable({
    onSwipedLeft: createTouchInputCallback(setInput, "a"),
    onSwipedRight: createTouchInputCallback(setInput, "d"),
    onSwipedUp: createTouchInputCallback(setInput, "w"),
    onSwipedDown: createTouchInputCallback(setInput, "s"),
    onTap: createTouchInputCallback(setInput, " "),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const prevInput = useRef("");
  const handleKeyDown = useCallback((e) => {
    const key = e.key.toLowerCase();
    if (inputKeys.includes(key)) {
      if (key === prevInput.current) return;

      setInput(key);
      prevInput.current = key;
    }
  }, []);
  const handleKeyUp = useCallback((e) => {
    const key = e.key.toLowerCase();
    if (inputKeys.includes(key)) {
      if (key === prevInput.current) {
        prevInput.current = "";
        setInput("");
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return { input, touchHandlers };
};

export default useInputs;
