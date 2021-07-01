# Basta frontend

Vera er en oversikt over hvilke versjoner som kjører i hvert miljø. Vera har også et api for registering av deploy events.




## Utvikling lokalt

Kjør

```console
docker-compose up -d
kubectl exec --context dev-gcp --namespace aura vera-mongo-0 -c mongod-container -- mongodump --archive > vera.dump
docker-compose exec -T mongo-db sh -c 'mongorestore --archive' < vera.dump
```

OBS!!! La mongodb starte opp i 20-120 sekunder før du prøver å starte `docker-compose start vera`

### Kjør (uten docker)

```console
npm install
gulp
```

Det kreves at du har en lokal mongodb installasjon som applikasjonen kan koble seg til. 


## Henvendelser

Spørsmål knyttet til koden eller prosjektet kan rettes til Team Aura.

For eksterne kontakt en av følgende:

- Mats Byfuglien (mats.byfuglien@nav.no)
- Johnny Horvi (johnny.horvi@nav.no)
- Roger Bjørnstad (roger.bjornstad@nav.no)
For NAV-ansatte kan henvendelser sendes via slack i kanalen #aura
