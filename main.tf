# Terraform Main

terraform {
  backend "s3" {
    region = "ap-northeast-2"
    bucket = "terraform-nalbam-seoul"
    key    = "dev-api-wifi.tfstate"
  }
  required_version = ">= 0.12"
}

provider "aws" {
  region = var.region
}

module "domain" {
  source = "github.com/nalbam/terraform-aws-route53?ref=v0.12.12"
  domain = var.domain
}

module "dev-lambda" {
  source = "github.com/nalbam/terraform-aws-lambda-api?ref=v0.12.2"
  region = var.region

  name        = var.name
  stage       = var.stage
  description = "api > lambda > wifi"
  runtime     = "nodejs10.x"
  handler     = "index.handler"
  memory_size = 1024
  timeout     = 5
  s3_bucket   = var.s3_bucket
  s3_source   = "target/lambda.zip"
  s3_key      = "lambda/${var.name}/${var.name}-${var.build_no}.zip"

  // domain
  zone_id         = module.domain.zone_id
  certificate_arn = module.domain.certificate_arn
  domain_name     = "${var.stage}-${var.name}.${var.domain}"

  env_vars = {
    PROFILE   = var.stage
    MAC_TABLE = "${var.stage}-${var.name}-mac"
    SCN_TABLE = "${var.stage}-${var.name}-scn"
  }
}
