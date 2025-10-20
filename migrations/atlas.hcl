data "external_schema" "drizzle" {
    program = [ 
      "tail",
      "-n",
      "+3",
      "/migrations/ddl.sql",
    ]
}

env "local" {
  url = "mysql://root:${getenv("MYSQL_PASSWORD")}@:${getenv("MYSQL_PORT")}/${getenv("MYSQL_DATABASE")}"
  dev = "mysql://root:${getenv("MYSQL_PASSWORD")}@:${getenv("MYSQL_PORT")}/dev"
  schema {
    src = data.external_schema.drizzle.url
  }
  migration {
    dir = "file://atlas/migrations"
  }
}