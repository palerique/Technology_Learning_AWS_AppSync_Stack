package br.com.palerique.guestbook

import io.gatling.core.Predef._
import io.gatling.core.structure.{ChainBuilder, ScenarioBuilder}
import io.gatling.http.Predef._
import io.gatling.http.protocol.HttpProtocolBuilder

import scala.concurrent.duration.DurationInt
import scala.language.postfixOps

class AllOperationsSimulation extends Simulation {

  val httpProtocol: HttpProtocolBuilder = http
    .baseUrl("https://lbexwsny4vevrf37szamtlzjh4.appsync-api.us-east-1.amazonaws.com")
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

  val headers = Map("x-api-key" -> "da2-behai2leqfaprbdzcgjadije7m")

  val graphQl = "/graphql"

  val allOperationsScn: ScenarioBuilder = scenario("AllOperationsSimulation")
    .exec(ListGuestbookComments.listGuestbookComments)
    .exec(GetGuestbookComment.getGuestbookComment)
    .exec(CreateGuestbookComment.createGuestbookComment)
    .exec(GetGuestbookComment.getGuestbookComment)
    .exec(DeleteGuestbookComment.deleteGuestbookComment)
    .exec(GetGuestbookComment.getDeletedGuestbookComment)

  val readOperationsScn: ScenarioBuilder = scenario("ReadOperationsSimulation")
    .exec(ListGuestbookComments.listGuestbookComments)
    .exec(GetGuestbookComment.getGuestbookComment)

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

  setUp(
    //    scn.inject(atOnceUsers(1))
    //    scn.inject(atOnceUsers(100))
    //    scn.inject(rampUsers(3000).during(60.seconds))
    //    scn.inject(rampUsers(2000).during(60.seconds))
    //https://alexandreesl.com/2020/02/12/gatling-making-performance-tests-with-scala/
    //    readOperationsScn.inject(constantUsersPerSec(250) during (5 minutes)),
    //    allOperationsScn.inject(rampUsers(600) during (2 minutes))
    //Others:
    allOperationsScn.inject(
      constantConcurrentUsers(10).during(20.seconds),
      rampConcurrentUsers(10).to(20).during(20.seconds),
      rampConcurrentUsers(20).to(30).during(20.seconds),
      rampConcurrentUsers(30).to(40).during(20.seconds),
      rampConcurrentUsers(40).to(50).during(20.seconds),
      rampConcurrentUsers(50).to(60).during(20.seconds),
      rampConcurrentUsers(60).to(70).during(20.seconds),
      rampConcurrentUsers(70).to(80).during(20.seconds),
      rampConcurrentUsers(80).to(90).during(20.seconds),
      rampConcurrentUsers(90).to(100).during(20.seconds),
      rampConcurrentUsers(100).to(200).during(20.seconds),
      rampConcurrentUsers(200).to(300).during(20.seconds),
      rampConcurrentUsers(300).to(500).during(20.seconds),
    ),
  ).protocols(httpProtocol)
}
