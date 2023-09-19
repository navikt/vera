import path from 'path';
const rootPath = path.normalize(__dirname + '/..');

const config = {
  root: rootPath,
  //port: process.env['PORT'] || 8080,
  dbUrl: process.env['VERADB_URL'] || 'mongodb://127.0.0.1/deploy_log',
  dbUser: process.env['VERADB_USERNAME'],
  dbPassword: process.env['VERADB_PASSWORD']
};

//module.exports = config
export default config;
