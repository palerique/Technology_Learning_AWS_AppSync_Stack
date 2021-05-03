package br.com.palerique.perf.common

import br.com.palerique.perf.common.TestEnvironment.productionTestEnvironment
import io.gatling.core.Predef.{rampUsers, _}
import io.gatling.http.Predef._
import io.gatling.http.protocol.HttpProtocolBuilder

import scala.concurrent.duration.DurationInt

trait BaseSettings {
  //  private val JsonContentType = ContentType("application/json")
  private val UserAgent = "GatlingLoadTester"
  private val defaultEnvironment = productionTestEnvironment
  //  private val defaultEnvironment = localTestEnvironment

  final def jsonHttpProtocol(env: TestEnvironment = defaultEnvironment): HttpProtocolBuilder = {
    http.baseUrl(env.baseUrl)
      .disableCaching.userAgentHeader(UserAgent)
      .header("x-api-key", "da2-rtbw5vfzv5eqha3d4pssj6ysuy")
  }

  // 10,000 over 1 minute is about the most we can handle locally.
  //  final val rampUpUsers = rampUsers(10000) over 60.seconds
  final val rampUpUsers = rampUsers(1000).during(120.seconds)
  //  final val rampUpUsers = rampUsers(3000) over 60.seconds
}

object BaseSettings extends BaseSettings
