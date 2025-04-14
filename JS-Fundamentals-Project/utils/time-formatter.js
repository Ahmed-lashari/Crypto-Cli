export function formatTime(date) {
  if (!date) return "Never";

  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000); // difference in seconds

  if (diff < 60) {
    return "just now";
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diff / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}
