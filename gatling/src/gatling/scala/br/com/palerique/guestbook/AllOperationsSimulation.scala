package br.com.palerique.guestbook

import io.gatling.core.Predef._
import io.gatling.core.structure.{ChainBuilder, ScenarioBuilder}
import io.gatling.http.Predef._
import io.gatling.http.protocol.HttpProtocolBuilder

class AllOperationsSimulation extends Simulation {

  val httpProtocol: HttpProtocolBuilder = http
    .baseUrl("https://fsgu54tqn5a7jpuxiktchqx6nu.appsync-api.us-east-1.amazonaws.com")
    .inferHtmlResources(BlackList(
      """.*\.js""",
      """.*\.css""",
      """.*\.gif""",
      """.*\.jpeg""",
      """.*\.jpg""",
      """.*\.ico""",
      """.*\.woff""",
      """.*\.woff2""",
      """.*\.(t|o)tf""",
      """.*\.png""",
      """.*detectportal\.firefox\.com.*"""),
      WhiteList(""".*graphql"""))
    .acceptHeader("*/*")
    .acceptEncodingHeader("gzip, deflate")
    .acceptLanguageHeader("en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7")
    .contentTypeHeader("application/json")
    .userAgentHeader("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36")

  val headers = Map("x-api-key" -> "da2-hkgqxapryjhqhc2efbsltkbna4")

  val graphQl = "/graphql"

  val scn: ScenarioBuilder = scenario("AllOperationsSimulation")
    .exec(ListGuestbookComments.listGuestbookComments)
    .exec(GetGuestbookComment.getGuestbookComment)
    .exec(CreateGuestbookComment.createGuestbookComment)
    .exec(GetGuestbookComment.getGuestbookComment)
    .exec(DeleteGuestbookComment.deleteGuestbookComment)
    .exec(GetGuestbookComment.getDeletedGuestbookComment)

  object ListGuestbookComments {
    val listGuestbookComments: ChainBuilder = exec(http("listGuestbookComments")
      .post(graphQl)
      .headers(headers)
      .body(ElFileBody("0000_listGuestbookComments.json")).asJson
      .check(status.is(200))
      .check(jsonPath("$.data.listGuestbookComments.items[0]").notNull)
      .check(jsonPath("$.data.listGuestbookComments.items[0]").ofType[Map[String, Any]].find.saveAs("comment"))
    ).pause(2)
  }

  object GetGuestbookComment {
    val getGuestbookComment: ChainBuilder = exec(http("getGuestbookComment")
      .post(graphQl)
      .headers(headers)
      .body(ElFileBody("0001_getGuestbookComment.json")).asJson
      .check(status.is(200))
      .check(jsonPath("$.data.getGuestbookComment").notNull)
      .check(jsonPath("$.data.getGuestbookComment.id").is("${comment.id}"))
      .check(jsonPath("$.data.getGuestbookComment.author").is("${comment.author}"))
      .check(jsonPath("$.data.getGuestbookComment.createdDate").is("${comment.createdDate}"))
      .check(jsonPath("$.data.getGuestbookComment.message").is("${comment.message}"))
      .check(jsonPath("$.data.getGuestbookComment.guestbookId").is("${comment.guestbookId}"))
    ).pause(2)

    val getDeletedGuestbookComment: ChainBuilder = exec(http("getGuestbookComment_deleted")
      .post(graphQl)
      .headers(headers)
      .body(ElFileBody("0001_getGuestbookComment.json")).asJson
      .check(status.is(200))
      .check(jsonPath("$.data.getGuestbookComment").isNull)
    )
  }

  object CreateGuestbookComment {
    val createGuestbookComment: ChainBuilder = exec(http("createGuestbookComment")
      .post(graphQl)
      .headers(headers)
      .body(ElFileBody("0002_createGuestbookComment.json")).asJson
      .check(status.is(200))
      .check(jsonPath("$.data.createGuestbookComment").notNull)
      .check(jsonPath("$.data.createGuestbookComment.id").notNull)
      .check(jsonPath("$.data.createGuestbookComment.author").is("Paulo Rodrigues"))
      .check(jsonPath("$.data.createGuestbookComment.createdDate").notNull)
      .check(jsonPath("$.data.createGuestbookComment.message").is("Great powers come with great responsibilities"))
      .check(jsonPath("$.data.createGuestbookComment.guestbookId").is("graduation"))
      .check(jsonPath("$.data.createGuestbookComment").ofType[Map[String, Any]].find.saveAs("comment"))
    ).pause(2)
  }

  object DeleteGuestbookComment {
    val deleteGuestbookComment: ChainBuilder = exec(http("deleteGuestbookComment_created")
      .post(graphQl)
      .headers(headers)
      .body(ElFileBody("0003_deleteGuestbookComment_created.json")).asJson
      .check(status.is(200))
      .check(jsonPath("$.data.deleteGuestbookComment").notNull)
      .check(jsonPath("$.data.deleteGuestbookComment.id").notNull)
      .check(jsonPath("$.data.deleteGuestbookComment.author").is("Paulo Rodrigues"))
      .check(jsonPath("$.data.deleteGuestbookComment.createdDate").notNull)
      .check(jsonPath("$.data.deleteGuestbookComment.message").is("Great powers come with great responsibilities"))
      .check(jsonPath("$.data.deleteGuestbookComment.guestbookId").is("graduation"))
    ).pause(2)
  }

  setUp(scn.inject(atOnceUsers(1))).protocols(httpProtocol)
}