export interface Thesis {
  id: string;
  title: string;
  description: string;
  supervisor: string | null; // Null if not supervised
}
