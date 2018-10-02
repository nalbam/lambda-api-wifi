// dynamodb

resource "aws_dynamodb_table" "dynamodb" {
  name           = "${var.stage}-${var.name}"
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
    Name = "${var.stage}-${var.name}"
  }
}
