interface TableStringFilterInput {
  beginsWith: string;
  between: [string];
  contains: string;
  eq: string;
  ge: string;
  gt: string;
  le: string;
  lt: string;
  ne: string;
  notContains: string;
}

interface TableIDFilterInput {
  beginsWith: string;
  between: [string];
  contains: string;
  eq: string;
  ge: string;
  gt: string;
  le: string;
  lt: string;
  ne: string;
  notContains: string;
}

export interface TableGuestbookCommentFilterInput {
  input: {
    guestbookId: TableStringFilterInput;
    id: TableIDFilterInput;
    createdDate: TableStringFilterInput;
    author: TableStringFilterInput;
    message: TableStringFilterInput;
    limit: number;
    nextToken: string;
  };
}
