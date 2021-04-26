package br.com.palerique.perf.common

import io.gatling.core.Predef._
import io.gatling.core.body.Body
import io.gatling.core.session.Expression
import io.gatling.http.Predef._
import io.gatling.http.request.builder.HttpRequestBuilder

trait Graphql {
  final def graphqlRequest(requestName: String, payload: Body): HttpRequestBuilder =
    http(requestName).post("/graphql").body(payload).asJson

  final def graphQlQueryBody(graphQlQuery: String): Body = StringBody(graphQlQuery)

  final def graphQlMutationBody(graphQlMutation: String): Body = StringBody(mutationJsonPayload(graphQlMutation))

  private def mutationJsonPayload(graphQlMutation: String): Expression[String] = (session: Session) => {
    for {
      mutation <- session(graphQlMutation.trim.replaceAll("\"", "\\\\\"")).validate[String]
    } yield s"""{ "mutation": "$mutation"}"""
  }
}

object Graphql extends Graphql
