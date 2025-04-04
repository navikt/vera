# Vera

Vera er en oversikt over hvilke versjoner som kjører i hvert miljø. Vera har også et api for registering av deploy events.

Denne applikasjonen avhenger av en mongo-db instans som er opprettet i [navikt/nais-yaml](https://github.com/navikt/nais-yaml/tree/a319a942ba61b65fe04c0054562845a4d4d1c5a3/templates/dev-gcp).


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

Spørsmål knyttet til koden eller prosjektet kan rettes til Team Atom.

For eksterne kontakt en av følgende:
- Håvard Tronhus (havard.tronhus@nav.no)
- Eirik Molnes (eirik.molnes@nav.no)
  
For NAV-ansatte kan henvendelser sendes via slack i kanalen #team-atom
