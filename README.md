Vera
====

## Generating self-signed certificate

```
openssl req -newkey rsa:2048 -nodes -keyout localhost.key -x509 -days 999 -out localhost.crt -config openssl.cnf
```
