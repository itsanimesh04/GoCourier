type UnauthorizedHandler = (from?: string) => void;

let handler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(next: UnauthorizedHandler) {
  handler = next;
}

export function notifyUnauthorized(from?: string) {
  handler?.(from);
}
