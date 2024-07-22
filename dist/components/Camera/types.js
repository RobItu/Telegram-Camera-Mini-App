"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Refs are a type of hook that do not cause the component to re-render.
// You can assign certain elements or components to refs so that you may interact with them directly.
// For example, let's say you have an <input> tag which is an element/component. You can create a ref variable like this:
// const inputRef = useRef<HTMLInputElement>(null); // This creates a ref that can hold an HTMLInputElement. (this is just assigning a type, much like you would a string or number)
// You would then assign the inputRef to the <input> tag like this:
// <input ref={inputRef} />
// Now you can have some function interact with inputRef, which means you can manipulate the <input> tag directly
// without causing a re-render every time a change is made. This is very efficient!
// useEffect(() => {
//   if (inputRef.current) {
//     inputRef.current.focus(); // This focuses the input element when the component mounts.
//   }
// }, []);
//# sourceMappingURL=types.js.map