package br.com.palerique.perf.scenarios

import br.com.palerique.perf.common.BaseSettings.jsonHttpProtocol
import br.com.palerique.perf.common.Helper.formatGraphQL
import br.com.palerique.perf.operations.GuestbookCommentsOperations
import io.gatling.core.Predef._
import io.gatling.core.structure.ScenarioBuilder
import io.gatling.http.Predef._

import scala.concurrent.duration._
import scala.language.postfixOps

final class AppSimulation extends Simulation with GuestbookCommentsOperations {

  val canonicalModifier: ScenarioBuilder = {
    val graphql =
      """
        |query MyQuery {
        |  listGuestbookComments {
        |    items {
        |      author
        |      createdDate
        |      guestbookId
        |      id
        |      message
        |    }
        |  }
        |}""".stripMargin
    scenario("list all comments")
      .exec(http("list all comments")
        .post("/graphql")
        .body(
          StringBody(s"""{"query":"${formatGraphQL(graphql)}","variables":null,"operationName":"MyQuery"}""")
        ).asJson
        .header("Content-Type", "application/json")
        .check(status.is(200))
      ).exitHereIfFailed
  }

//  private val increasingConcurrentUsersCompositeStep = incrementConcurrentUsers(200)
//    .times(100)
//    .eachLevelLasting(2000 millis)
//    .startingFrom(1)
//
  final val rampUpUsers = rampUsers(3000).during(60.seconds)

//  final val xpto = heavisideUsers(5000).during(60.seconds)

//  val scn: ScenarioBuilder = scenario("App Startup")
//    .exec(allComments())
//    .pause(1.seconds)
  //    .exec(commentDetails("TODO:25"))
  //    .pause(1.seconds)

  //  setUp(
  //    scn.inject(rampUpUsers)
  //  ).protocols(jsonHttpProtocol())

  setUp(
    //    scn.inject(rampUpUsers)
    //    canonicalModifier.inject(rampUpUsers)
    canonicalModifier.inject(rampUpUsers)
  ).assertions(forAll.failedRequests.count.lte(1))
    .protocols(jsonHttpProtocol())
}
