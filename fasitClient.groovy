class FasitParams {
    String baseUrl = "https://fasit.adeo.no/conf"
    String envName
    String domain
    String appName = "vera-rest"
    String username
    String password
    String workspacepath
}



def fasitParams  = new FasitParams(envName:build.buildVariableResolver.resolve("env"), domain:build.buildVariableResolver.resolve("domain"), username:build.buildVariableResolver.resolve("username"), password:build.buildVariableResolver.resolve("password"), workspacepath:build.workspace)

println "fasitParams.username = $fasitParams.username"

createServerInfoProperties(fasitParams)
createApplicationProperties(fasitParams)

def createServerInfoProperties(fasitParams){
    def connection = getConnection("$fasitParams.baseUrl/environments/$fasitParams.envName/applications/$fasitParams.appName")

    if( connection.responseCode == 200 || connection.responseCode == 201 ) {
        File serverInfoFile = new File("$fasitParams.workspacepath/serverinfo.properties")
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
    File applicationPropertiesFile = new File("$fasitParams.workspacepath/config.sh")
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
    println("Opening connection to $url")
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
        throw new RuntimeException("Error getting password from Fasit. Response code $pwdConnection.responseCode")
    }
}

def encodeCredentials(username, password) {
    String userProps = "$username:$password"
    return "Basic " + javax.xml.bind.DatatypeConverter.printBase64Binary(userProps.getBytes())
}