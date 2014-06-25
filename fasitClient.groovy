// TODO Extract as Jenkins parameters
class FasitParams {
  final baseUrl = "https://fasit.adeo.no/conf"
  final envName = "tpr-u1"
  final domain = "devillo.no"
  final appName = "vera-rest"
  final username = "admin"
  final password = "admin"
}

def fasitParams  = new FasitParams()

createServerInfoProperties(fasitParams)
createApplicationProperties(fasitParams)

def createServerInfoProperties(fasitParams){
  //TODO proper def
  //appname connection = getConnection("$fasitParams.baseUrl/environments/$fasitParams.envName/applications/$fasitParams.appName")
  def connection = getConnection("$fasitParams.baseUrl/environments/$fasitParams.envName/applications/fasit")
  
  if( connection.responseCode == 200 || connection.responseCode == 201 ) {
    File serverInfoFile = new File("serverinfo.properties")
    serverInfoFile.delete()
    def application = new XmlParser().parseText(connection.content.text)

    application.cluster.nodes.each {
      [hostname: it.hostname.text(), username: it.username.text(), password: getPassword(it.passwordRef.text(), fasitParams.username, fasitParams.password)].each {
        serverInfoFile << "$it\n"
      }
    }
  } else {
    throw new RuntimeException("Error when creating server info properties. Response code $connection.responseCode")
  }
}

def createApplicationProperties(fasitParams){
  File applicationPropertiesFile = new File("application.properties")
  applicationPropertiesFile.delete()
  
  dbResource = getFasitResource(fasitParams.baseUrl, "ApplicationProperties", "veraRestProperties", fasitParams.envName, fasitParams.domain )
  applicationPropertiesFile << dbResource.property.value.text() + "\n"

  def dbCredentialResource = getFasitResource(fasitParams.baseUrl, "Credential", "veraRestDbCredential", fasitParams.envName, fasitParams.domain)
  def dbUsername = dbCredentialResource.find {it['@name'] == 'username'}.value.text()
  def dbPassword = getPassword(dbCredentialResource.find {it['@name'] == 'password'}.ref.text(), fasitParams.username, fasitParams.password)
  applicationPropertiesFile << "db_username=$dbUsername\ndb_password=$dbPassword"
}

def getFasitResource(fasitBaseUrl, type, alias, envName, domain) {
  def resourceUrl = "$fasitBaseUrl/resources/bestmatch?envName=$envName&domain=$domain&type=$type&alias=$alias&app=vera-rest"  
  def connection = getConnection(resourceUrl)
  connection.connect()
  return new XmlParser().parseText(connection.content.text)
}

def getConnection(url){
  def connection = new URL(url).openConnection()
  connection.setRequestMethod("GET")
  return connection
}

def getPassword(passwordRef, username, password) {
  def pwdConnection =  new URL(passwordRef).openConnection()
  pwdConnection.setRequestMethod("GET")
  pwdConnection.setRequestProperty("Authorization", encodeCredentials(username, password))
  pwdConnection.connect()

  if( pwdConnection.responseCode == 200 || pwdConnection.responseCode == 201 ) {
    return pwdConnection.content.text
  } else {
    throw new RuntimeException("Error getting password from Fasit. Response code " + pwdConnection.getResponseCode )
  }
}

def encodeCredentials(username, password) {
  String userProps = "$username:$password"
  return "Basic " + javax.xml.bind.DatatypeConverter.printBase64Binary(userProps.getBytes())
}