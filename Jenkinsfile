pipeline {
    agent any

    stages {

        stage('Cleanup Old Container') {
            steps {
                echo 'Removing old container if exists...'
                bat '''
                docker rm -f my-app-container || exit 0
                '''
            }
        }

        stage('Build') {
            steps {
                echo 'Building Docker Image...'
                bat 'docker build -t my-app .'
            }
        }

        stage('Run') {
            steps {
                echo 'Running Container...'
                bat '''
                docker run -d -p 3002:3000 --name my-app-container my-app
                '''
            }
        }

    }
}