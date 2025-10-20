data "external_schema" "drizzle" {
    program = [ 
      "tail",
      "-n",
      "+3",
      "/migrations/ddl.sql",
    ]
}

env "local" {
  url = "mysql://root:password@:25060/devdogs"
  dev = "mysql://root:password@:25060/dev"
  schema {
    src = data.external_schema.drizzle.url
  }
  migration {
    dir = "file://atlas/migrations"
  }
}