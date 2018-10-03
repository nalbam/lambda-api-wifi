// dynamodb

resource "aws_dynamodb_table" "wifi-scan" {
  name           = "${var.stage}-${var.name}-scan"
  read_capacity  = 10
  write_capacity = 10
  hash_key       = "id"
  range_key      = "mac"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "mac"
    type = "S"
  }

  tags {
    Name = "${var.stage}-${var.name}-scan"
  }
}

resource "aws_dynamodb_table" "wifi-main" {
  name           = "${var.stage}-${var.name}-main"
  read_capacity  = 10
  write_capacity = 10
  hash_key       = "id"
  range_key      = "mac"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "mac"
    type = "S"
  }

  tags {
    Name = "${var.stage}-${var.name}-main"
  }
}
