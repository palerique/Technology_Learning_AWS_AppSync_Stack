package br.com.palerique.perf.queries

trait GuestbookCommentsQueries {
  val allCommentsQuery: String =
    s"""
       |{
       |  "query":"query MyQuery {
       |    listGuestbookComments {
       |      items {
       |        author
       |        createdDate
       |        guestbookId
       |        id
       |        message
       |      }
       |    }
       |  }",
       |  "variables":null,
       |  "operationName":"MyQuery"
       |}
     """.stripMargin

  def commentDetailsQuery(commentId: String): String =
    s"""
       |{
       |  personDetails(personId: "$commentId") {
       |    name
       |    birthYear
       |    hairColour
       |  }
       |}
     """.stripMargin
}

object GuestbookCommentsQueries extends GuestbookCommentsQueries
