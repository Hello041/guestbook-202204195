// Input rules shared by writing and editing an entry.

export const AUTHOR_NAME_MAX = 20;
export const MESSAGE_MAX = 500;
export const PASSWORD_MIN = 4;
export const PASSWORD_MAX = 20;

export type EntryField = "authorName" | "message" | "password";
export type FieldErrors = Partial<Record<EntryField, string>>;

function length(value: string) {
  return Array.from(value).length;
}

// Returns the trimmed value, or an error message.
export function checkAuthorName(raw: string): { value: string } | { error: string } {
  const value = raw.trim();
  if (length(value) === 0) return { error: "이름을 입력해 주세요." };
  if (length(value) > AUTHOR_NAME_MAX) {
    return { error: `이름은 ${AUTHOR_NAME_MAX}자 이하로 입력해 주세요.` };
  }
  return { value };
}

export function checkMessage(raw: string): { value: string } | { error: string } {
  const value = raw.trim();
  if (length(value) === 0) return { error: "메시지를 입력해 주세요." };
  if (length(value) > MESSAGE_MAX) {
    return { error: `메시지는 ${MESSAGE_MAX}자 이하로 입력해 주세요.` };
  }
  return { value };
}

// Passwords are kept exactly as typed; only their length is checked.
export function checkPassword(raw: string): { value: string } | { error: string } {
  const n = length(raw);
  if (n < PASSWORD_MIN || n > PASSWORD_MAX) {
    return {
      error: `비밀번호는 ${PASSWORD_MIN}~${PASSWORD_MAX}자로 입력해 주세요.`,
    };
  }
  return { value: raw };
}
