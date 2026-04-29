pipeline {
    agent any

    stages {

        stage('Cleanup Old Container') {
            steps {
                echo 'Removing old container if exists...'
                sh '''
                docker rm -f my-app-container || true
                '''
            }
        }
        stage('Build') {
            steps {
                echo 'Building Docker Image...'
                sh 'docker build -t my-app .'
            }
        }
        stage('Run') {
            steps {
                echo 'Running Container...'
                sh '''
                docker run -d -p 3002:5000 --name my-app-container my-app
                '''
            }
        }

    }
}