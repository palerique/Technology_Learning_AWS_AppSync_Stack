package br.com.palerique.perf.operations

import br.com.palerique.perf.common.Graphql.{graphQlQueryBody, graphqlRequest}
import io.gatling.core.Predef._
import io.gatling.core.structure.ChainBuilder
import br.com.palerique.perf.queries.GuestbookCommentsQueries._

trait GuestbookCommentsOperations {
  final def allComments(): ChainBuilder = {
    exec(
      graphqlRequest("All Comments", graphQlQueryBody(allCommentsQuery))
    )
  }

  final def commentDetails(personId: String): ChainBuilder = {
    exec(
      graphqlRequest("Comment Details", graphQlQueryBody(commentDetailsQuery(personId)))
    )
  }
}
