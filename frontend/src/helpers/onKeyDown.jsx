// Enter to send; Shift+Enter = newline
  export default function onKeyDown(e, send) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }