import { AppSyncResolverHandler } from 'aws-lambda';
import { TableGuestbookCommentFilterInput } from 'generic-stuff/dist/types/TableGuestbookCommentFilterInput';
import { GuestbookComment } from 'generic-stuff/dist/types/GuestbookComment';
import { listComments } from 'generic-stuff/dist/services/listCommentsService';

export const handler: AppSyncResolverHandler<TableGuestbookCommentFilterInput, { items: GuestbookComment[] }> = async (
  event,
) => {
  console.log({ event });
  const result = listComments(event.arguments);
  console.log({ result });
  return result;
};
