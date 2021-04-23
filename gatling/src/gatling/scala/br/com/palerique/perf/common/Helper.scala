package br.com.palerique.perf.common

object Helper {
  def formatGraphQL(query: String): String = query
    .replace("\n", "")
    .replace("\"", "\\\"")
}
