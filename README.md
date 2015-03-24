# vera

## For å komme i gang med utvikling:

1. git clone http://stash.devillo.no/scm/aura/vera.git
2. npm install
3. if (!gulp.installed) npm install -g gulp
4. export db_url=mongodb://e34apsl00652.devillo.no/deploy_log && export NODE_ENV=development && nodemon --debug --watch backend --watch server.js
   (starter opp backend mot basen som ligger på utviklingsserveren og oppdaterer ved endringer. Alternativt kan man lage sin egen mongodb base. Bør konfigureres opp i IDEen)
5. gulp # bygger frontend og rebygger ved endringer

Ved push til master trigges [byggejobben til vera](http://aura.devillo.no/view/cd/job/cd_vera/) automatisk med mindre commitmeldingen starter med 'SKIP_BUILD'

## Denne gjør følgende:

1. Bumper versjon
2. Lager tag
3. Bygger prosjektet
4. Oppretter og pusher et nytt docker image til docker.adeo.no (image tag = docker.adeo.no:5000/vera:<versjon>)
5. Deployer denne til cd-u1 miljøet
6. Kjører tester