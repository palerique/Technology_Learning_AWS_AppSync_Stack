import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { GuestbookComment } from '../types/GuestbookComment';
import AttributeMap = DocumentClient.AttributeMap;

export function convertAttributeMapToComment(attributeMap: AttributeMap): GuestbookComment {
  return {
    author: attributeMap.author,
    createdDate: attributeMap.createdDate,
    guestbookId: attributeMap.guestbookId,
    id: attributeMap.id,
    message: attributeMap.message,
  };
}

export function convertAttributeMapCollectionToCommentCollection(collection: AttributeMap[]): GuestbookComment[] {
  const result: GuestbookComment[] = [];

  collection.forEach((value) => {
    result.push(convertAttributeMapToComment(value));
  });

  return result;
}
