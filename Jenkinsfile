pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    // Override on the Jenkins agent if the repo checkout path differs
    APP_DIR = "${env.APP_DIR ?: env.WORKSPACE}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Validate backend.env secrets') {
      steps {
        dir("${APP_DIR}") {
          sh 'chmod +x scripts/validate-backend-env.sh scripts/deploy-backend.sh'
          sh './scripts/validate-backend-env.sh'
        }
      }
    }

    stage('Deploy backend (force recreate)') {
      steps {
        dir("${APP_DIR}") {
          // Always recreate so docker-compose env_file is re-injected.
          // `docker restart` is forbidden — it keeps stale env.
          sh './scripts/deploy-backend.sh'
        }
      }
    }

    stage('Verify PhonePe env in container') {
      steps {
        sh '''
          set -e
          echo "--- docker exec printenv PHONEPE ---"
          docker exec rasa_backend printenv | grep '^PHONEPE_'
          test "$(docker exec rasa_backend printenv | grep -c '^PHONEPE_')" -ge 6
          echo "--- /api/system/config ---"
          docker exec rasa_backend node -e "fetch('http://127.0.0.1:5000/api/system/config').then(r=>r.json()).then(j=>{console.log(JSON.stringify(j)); if(!j.phonepeConfigured) process.exit(1)})"
        '''
      }
    }
  }

  post {
    failure {
      sh 'docker logs --tail 100 rasa_backend || true'
    }
  }
}
