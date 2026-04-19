pipeline {
    agent any

    stages {

        stage('Build') {
            steps {
                echo 'Building Docker Image...'
                sh 'docker build -t my-app .'
            }
        }

        stage('Run') {
            steps {
                echo 'Running Container...'
                sh 'docker run -d -p 3000:3000 my-app'
            }
        }

    }
}