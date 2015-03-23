__Vera__

For å komme i gang med utvikling:

- git clone http://stash.devillo.no/scm/aura/vera.git
- npm install
- if (!gulp.installed) npm install -g gulp
- export db_url=mongodb://e34apsl00652.devillo.no/deploy_log && export NODE_ENV=development && nodemon --debug --watch backend --watch server.js # starter opp backend mot basen som ligger på utviklingsserveren og oppdaterer ved endringer. Alternativt kan man lage sin egen mongodb base.
- gulp # bygger frontend og rebygger ved endringer

Ved push til master trigges byggejobben til vera (aura.devillo.no/view/cd/job/cd_vera/).
Denne gjør følgende:
* Bumper versjon
* Lager tag
* Bygger prosjektet
* Oppretter og pusher et nytt docker image til docker.adeo.no (image tag = docker.adeo.no:5000/vera:<versjon>)
* Deployer denne til cd-u1 miljøet
* Kjører tester

