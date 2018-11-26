import groovy.json.JsonSlurper;
node {
    def npm, node // tools
    def groupId = "nais"
    def appConfig = "nais.yaml"
    def committer, committerEmail, changelog // metadata
    def application = "vera"
    def dockerDir = "./docker"
    def distDir = "${dockerDir}/dist"

    sh "git clone https://github.com/navikt/github-apps-support.git || (cd github-apps-support && git pull)"

    withEnv(["PATH+GITHUB_APPS_SUPPORT=${cwd}/github-apps-support/bin"]) {
        stage("checkout") {

        def token
        withCredentials([file(credentialsId: 'AuraCiGithubApp', variable: 'privateKey')]) {
            def jwt = sh(script: "generate-jwt.sh ${privateKey} 19726", returnStdout: true).trim()

            withEnv(['HTTPS_PROXY=http://webproxy-utvikler.nav.no:8088', "JWT=${jwt}"]) {
                token = sh(script: 'generate-installation-token.sh $JWT', returnStdout: true).trim()
            }
        }

        checkout([$class: 'GitSCM', branches: [[name: 'name: */master']], userRemoteConfigs: [[url: "https://${token}:github.com/navikt/vera.git"]]])
    }
	

    lastCommitMessage = sh(script: "git --no-pager log -1 --pretty=%B", returnStdout: true).trim()
    if (lastCommitMessage != null &&
        lastCommitMessage.toString().contains('Releasing ')) {
	return
    }
    
    try {
        stage("initialize") {
	    sh(script: 'npm version major -m "Releasing %s"')
            withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'AuraCiGithubApp', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]) {
                withEnv(['HTTPS_PROXY=http://webproxy-utvikler.nav.no:8088', 'NO_PROXY=adeo.no']) {
                    sh(script: "git push https://${PASSWORD}@github.com/navikt/${application}.git --tags")
                    sh(script: "git push https://${PASSWORD}@github.com/navikt/${application}.git master")
                }
            }
            committer = sh(script: 'git log -1 --pretty=format:"%ae (%an)"', returnStdout: true).trim()
            releaseVersion = sh(script: 'node -p "require(\'./package.json\').version"', returnStdout: true).trim()
        }

        stage("run unit tests") {
            withEnv(['HTTP_PROXY=http://webproxy-utvikler.nav.no:8088', 'NO_PROXY=adeo.no']) {
                sh "npm install"
            }
        }

        stage("build frontend bundle") {
            withEnv(['HTTP_PROXY=http://webproxy-utvikler.nav.no:8088', 'NO_PROXY=adeo.no']) {
                sh "mkdir -p ${distDir}"
                sh "cp -r server.js backend ${distDir}"
                sh "cd ${distDir} && cp ../../package.json . && npm install --production && cd -"
                //    getting required node_modules for production
                sh "npm install && node ./node_modules/gulp/bin/gulp.js dist || exit 1" // Creating frontend bundle
                sh "cp -r --parents frontend/build ${distDir}" // Copying frontend bundle
                sh "cp Dockerfile ${dockerDir}"
            }
        }

        stage("build and publish docker image") {
            def imageName = "docker.adeo.no:5000/${application}:${releaseVersion}"
            sh "sudo docker build -t ${imageName} ./docker"
            sh "sudo docker push ${imageName}"
        }


        stage("publish yaml") {
            withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'nexusUser', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]) {
		sh "curl -s -F r=m2internal -F hasPom=false -F e=yaml -F g=${groupId} -F a=${application} -F v=${releaseVersion} -F p=yaml -F file=@${appConfig} -u ${env.USERNAME}:${env.PASSWORD} http://maven.adeo.no/nexus/service/local/artifact/maven/content"
            }
        }


        stage("deploy to !prod") {
            withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'srvauraautodeploy', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]) {
                sh "curl -k -d \'{\"application\": \"${application}\", \"version\": \"${releaseVersion}\", \"environment\": \"cd-u1\", \"zone\": \"fss\", \"namespace\": \"default\", \"username\": \"${env.USERNAME}\", \"password\": \"${env.PASSWORD}\"}\' https://daemon.nais.preprod.local/deploy"
            }
        }

        stage("verify resources") {
	    retry(15) {
		sleep 5
                httpRequest consoleLogResponseBody: true,
                ignoreSslErrors: true,
                responseHandle: 'NONE',
                url: 'https://vera.nais.preprod.local/isalive',
                validResponseCodes: '200'
	    }
        }

        stage("deploy to prod") {
            withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'srvauraautodeploy', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]) {
                sh "curl -k -d \'{\"application\": \"${application}\", \"version\": \"${releaseVersion}\", \"environment\": \"p\", \"zone\": \"fss\", \"namespace\": \"default\", \"username\": \"${env.USERNAME}\", \"password\": \"${env.PASSWORD}\"}\' https://daemon.nais.adeo.no/deploy"
            }
        }
        slackSend channel: '#nais-ci', message: ":nais: Successfully deployed ${application}:${releaseVersion} to prod :partyparrot: \nhttps://${application}.nais.adeo.no\nLast commit by ${committer}.", teamDomain: 'nav-it', tokenCredentialId: 'slack_fasit_frontend'
        if (currentBuild.result == null) {
            currentBuild.result = "SUCCESS"
        }

    } catch(e) {
        if (currentBuild.result == null || currentBuild.result == "FAILURE") {
            currentBuild.result = "FAILURE"
            slackSend channel: '#nais-ci', message: ":shit: Failed deploying ${application}:${releaseVersion}: ${e.getMessage()}. See log for more info ${env.BUILD_URL}", teamDomain: 'nav-it', tokenCredentialId: 'slack_fasit_frontend'
        }
        throw e
    } finally {
        step([$class       : 'InfluxDbPublisher',
              customData   : null,
              customDataMap: null,
              customPrefix : null,
              target       : 'influxDB'])
    }
}
}
