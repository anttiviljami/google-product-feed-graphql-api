# Terraform configuration

To apply Terraform configuration to AWS, make sure your env contains the access key id and secret.

```
export AWS_ACCESS_KEY_ID=
export AWS_SECRET_ACCESS_KEY=
```

Then simply run

```
terraform apply
```

The state of Terraform is managed in S3, so it should automatically sync any changes from the remote backend
