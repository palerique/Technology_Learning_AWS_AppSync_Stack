export interface Comment {
  id: { S: string };
  guestbookId: { S: string };
  createdDate: { S: string };
  author: { S: string };
  message: { S: string };
}
