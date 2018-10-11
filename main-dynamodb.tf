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
  range_key      = "mac"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "mac"
    type = "S"
  }

  attribute {
    name = "scan_date"
    type = "S"
  }

  global_secondary_index {
    name               = "scn_index"
    hash_key           = "mac"
    range_key          = "scan_date"
    write_capacity     = 5
    read_capacity      = 5
    projection_type    = "INCLUDE"
    non_key_attributes = ["id"]
  }

  tags {
    Name = "${var.stage}-${var.name}-scn"
  }
}
