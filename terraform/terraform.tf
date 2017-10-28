variable "aws_region" { default = "eu-west-1" }
provider "aws" { region = "${var.aws_region}" }

variable "project_name" {}

terraform {
  backend "s3" {
    bucket = "gproduct-feed-api-terraform"
    key    = "api/terraform.tfstate"
    region = "eu-west-1"
  }
}

resource "random_id" "default" {
  keepers = {
    project_name = "${var.project_name}"
  }
  byte_length = 32
}

resource "aws_security_group" "default" {
  name = "mydb1"
  description = "RDS postgres servers (terraform-managed)"
  ingress {
    from_port = 5432
    to_port = 5432
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "default" {
  identifier = "${var.project_name}-db"
  allocated_storage = 5
  engine = "postgres"
  engine_version = "9.6.2"
  instance_class = "db.t2.micro"
  name = "postgres"
  username = "postgres"
  password = "${random_id.default.hex}"
  publicly_accessible = true
  vpc_security_group_ids   = ["${aws_security_group.default.id}"]
}

output "DATABASE_URL" {
  value = "postgres://postgres:${random_id.default.hex}@${aws_db_instance.default.address}/postgres"
}

