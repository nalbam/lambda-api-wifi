// dynamodb

resource "aws_dynamodb_table" "wifi-mac" {
  name           = "${var.stage}-${var.name}-mac"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "mac"

  attribute {
    name = "mac"
    type = "S"
  }

  tags {
    Name = "${var.stage}-${var.name}-mac"
  }
}

resource "aws_dynamodb_table" "wifi-scn" {
  name           = "${var.stage}-${var.name}-scn"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "id"
  range_key      = "scn_dt"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "mac"
    type = "S"
  }

  tags {
    Name = "${var.stage}-${var.name}-scn"
  }
}
