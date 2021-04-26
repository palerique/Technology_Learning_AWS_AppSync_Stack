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

export interface ListFilter {
  guestbookId: TableStringFilterInput;
  id: TableIDFilterInput;
  createdDate: TableStringFilterInput;
  author: TableStringFilterInput;
  message: TableStringFilterInput;
}

export interface TableGuestbookCommentFilterInput {
  input: {
    filter: ListFilter;
    limit: number;
    nextToken: string;
  };
}
