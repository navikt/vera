import groovy.json.JsonSlurper;
node {
    def npm, node // tools
    def groupId = "nais"
    def appConfig = "nais.yaml"
    def committer, committerEmail, changelog // metadata
    def application = "vera"
    def dockerDir = "./docker"
    def distDir = "${dockerDir}/dist"

deleteDir()

stage("checkout") {
  git url: "https://github.com/navikt/${application}.git"
    }

    try {
        stage("initialize") {
            committer = sh(script: 'git log -1 --pretty=format:"%ae (%an)"', returnStdout: true).trim()
            releaseVersion = sh(script: 'echo $(date "+%Y-%m-%d")-$(git --no-pager log -1 --pretty=%h)', returnStdout: true).trim()
        }

        stage("run unit tests") {
            withEnv(['HTTP_PROXY=http://webproxy-utvikler.nav.no:8088', 'NO_PROXY=adeo.no']) {
                sh "npm install"
                sh "npm test"
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
            withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'nexusUser', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]) {
               sh "curl --fail -v -u ${env.USERNAME}:${env.PASSWORD} --upload-file ${appConfig} https://repo.adeo.no/repository/raw/${groupId}/${application}/${releaseVersion}/nais.yaml"
            }
        }


        stage("deploy to !prod") {
            withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'srvauraautodeploy', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]) {
                sh "curl -k -d \'{\"application\": \"${application}\", \"version\": \"${releaseVersion}\", \"environment\": \"cd-u1\", \"zone\": \"sbs\", \"namespace\": \"default\", \"username\": \"${env.USERNAME}\", \"password\": \"${env.PASSWORD}\"}\' https://daemon.nais.oera-q.local/deploy"
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
    } 
}
