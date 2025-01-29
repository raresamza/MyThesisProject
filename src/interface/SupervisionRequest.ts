export interface SupervisionRequest {
  id: number;
  title: string;
  student: string;
  description: string;
  teacher: string; // Name of the assigned teacher
  status: "pending" | "approved" | "denied"; // Status of the request
  comments: { author: string; text: string }[];
}