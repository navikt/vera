__Vera__

For å komme i gang med utvikling:

- git clone http://stash.devillo.no/scm/aura/vera.git
- npm install
- if (!gulp.installed) npm install -g gulp
- export db_url=mongodb://e34apsl00652.devillo.no/deploy_log && nodemon --watch backend server.js # starter opp backend mot basen som ligger på utviklingsserveren og oppdaterer ved endringer
- gulp # bygger frontend og rebygger ved endringer
