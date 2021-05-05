package br.com.palerique.perf.common

sealed trait TestEnvironment {
  final def baseUrl: String = s"$host"

  def host: String
}

private case object LocalTestEnvironment extends TestEnvironment {
  override val host = "http://localhost:8080"
}

private case object ProductionTestEnvironment extends TestEnvironment {
  override val host = "https://7jmo4bs3ezcf7fdpq2km6yeyqe.appsync-api.us-east-1.amazonaws.com"
}

object TestEnvironment {
  val localTestEnvironment: TestEnvironment = LocalTestEnvironment
  val productionTestEnvironment: TestEnvironment = ProductionTestEnvironment
}
