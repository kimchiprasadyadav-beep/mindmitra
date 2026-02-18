export interface MoodEntry {
  emoji: string;
  label: string;
  timestamp: number;
  value: number;
}

export interface JournalEntry {
  id: string;
  text: string;
  prompt?: string;
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const isBrowser = typeof window !== 'undefined';

export function getUserName(): string {
  if (!isBrowser) return '';
  return localStorage.getItem('mindmitra_username') || '';
}
export function setUserName(name: string) {
  if (isBrowser) localStorage.setItem('mindmitra_username', name);
}
export function hasOnboarded(): boolean {
  if (!isBrowser) return false;
  return localStorage.getItem('mindmitra_onboarded') === 'true';
}
export function setOnboarded() {
  if (isBrowser) localStorage.setItem('mindmitra_onboarded', 'true');
}
export function getMoods(): MoodEntry[] {
  if (!isBrowser) return [];
  const data = localStorage.getItem('mindmitra_moods');
  return data ? JSON.parse(data) : [];
}
export function addMood(entry: MoodEntry) {
  const moods = getMoods();
  moods.push(entry);
  localStorage.setItem('mindmitra_moods', JSON.stringify(moods));
}
export function getJournalEntries(): JournalEntry[] {
  if (!isBrowser) return [];
  const data = localStorage.getItem('mindmitra_journal');
  return data ? JSON.parse(data) : [];
}
export function addJournalEntry(entry: JournalEntry) {
  const entries = getJournalEntries();
  entries.push(entry);
  localStorage.setItem('mindmitra_journal', JSON.stringify(entries));
}
export function getChatMessages(): ChatMessage[] {
  if (!isBrowser) return [];
  const data = localStorage.getItem('mindmitra_chat');
  return data ? JSON.parse(data) : [];
}
export function saveChatMessages(messages: ChatMessage[]) {
  if (isBrowser) localStorage.setItem('mindmitra_chat', JSON.stringify(messages));
}
export function clearChat() {
  if (isBrowser) localStorage.removeItem('mindmitra_chat');
}
export function getDarkMode(): boolean {
  if (!isBrowser) return false;
  return localStorage.getItem('mindmitra_dark') === 'true';
}
export function setDarkMode(dark: boolean) {
  if (isBrowser) localStorage.setItem('mindmitra_dark', dark ? 'true' : 'false');
}
